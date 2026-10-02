// 生日礼物：生日当天送 100 光尘 + 一封贺信，一年只送一次。
//
// 这里没有定时任务，也不需要 —— 客户端每次打开网站都会拉一次账本，
// 趁着那次请求顺手判断就行（见 api/dust.js 的 onRequestGet）。
import { readBook, writeBook } from './_dust.js'
import { deliver } from './_mail.js'
import { writeUser, BIRTHDAY_GIFT, isBirthdayToday } from './_auth.js'

/** 北京时间的年份，用来标记「今年已经送过了」 */
function bjYear(now) {
  return new Date((Number(now) || Date.now()) + 8 * 3600000).getUTCFullYear()
}

/**
 * 该发就把生日礼发了。
 * 返回本次发放的光尘数：0 表示今天不是他的生日，或者今年已经发过了。
 */
export async function maybeBirthdayGift(kv, user, now) {
  if (!kv || !user || !user.uid) return 0
  if (!isBirthdayToday(user.birthday, now)) return 0

  const year = bjYear(now)
  if (Number(user.birthdayGiftYear) === year) return 0

  const uid = user.uid

  // 光尘直接进账本，不用再去信箱点一次「领取」
  const book = await readBook(kv, uid)
  await writeBook(kv, uid, { ...book, bal: (Number(book.bal) || 0) + BIRTHDAY_GIFT })

  // 贺信是纯通知（不带附件），否则就成了发两次
  await deliver(kv, uid, {
    id: 'bday-' + year,
    claimId: 'bday-' + year,
    kind: 'text',
    icon: '🎂',
    title: '生日快乐！小镇给你留了 ' + BIRTHDAY_GIFT + ' 个光尘',
    body:
      '今天是你填的生日，小镇记着呢。\n' +
      BIRTHDAY_GIFT +
      ' 个光尘已经直接进你的账本了，不用点领取。\n' +
      '去画一幅，或者给喜欢的作品送一份心意吧。\n' +
      '（生日一年只能改一次，所以这份礼物一年也只有一次）',
    dust: 0,
  }).catch(() => {})

  user.birthdayGiftYear = year
  await writeUser(kv, user)
  return BIRTHDAY_GIFT
}
