// 成就系统
//
// 定位：和「连续签到徽章」不同，签到徽章只看连续天数（会因断签归零），
// 成就看的是累计成果，断了也不清零，所以放在服务端按 uid 记账。
//
// 两类成就：
//   progress  进度型：累计作品数、累计绘制格数、累计收到赞、累计创作天数…
//             每达到一档就永久解锁一格
//   badge     里程碑型：首次发布、尺寸解锁（16/32/64）、首次被送光尘…
//
// 数据从作品历史实时统计，不额外维护计数，避免和实际作品数对不上。

/* -------------------- 成就定义 --------------------
   一共 100 个，全部手写。
   不做「发布作品 5 / 6 / 7」这种连续门槛 —— 那种列表没有意义，
   用户看到只会觉得在凑数。所以每一条都挑一个真正有分量的节点，
   再配一个像样的名字和一句说人话的说明。
   里程碑型（type:'badge'）只判断条件，不看累计数。 */

export const CATEGORIES = [
  { key: 'works', name: '创作数量' },
  { key: 'cells', name: '绘制规模' },
  { key: 'likes', name: '获得认可' },
  { key: 'run', name: '连续创作' },
  { key: 'days', name: '长期坚持' },
  { key: 'sign', name: '签到' },
  { key: 'dust', name: '光尘往来' },
  { key: 'canvas', name: '画布运用' },
  { key: 'play', name: '玩法探索' },
  { key: 'moment', name: '创作时刻' },
  { key: 'adventure', name: '冒险世界' },
]

/** 进度型成就：need 是门槛，reward 是解锁时发的光尘 */
export const PROGRESS = [
  /* ---------- 创作数量 ---------- */
  { id: 'w1', ico: '🎨', name: '处女作', desc: '画下第一格像素', cat: 'works', type: 'progress', metric: 'works', need: 1, reward: 5 },
  { id: 'w3', ico: '🖌️', name: '起步之路', desc: '3 幅作品，笔还没生锈', cat: 'works', type: 'progress', metric: 'works', need: 3, reward: 8 },
  { id: 'w5', ico: '🖼️', name: '小试牛刀', desc: '5 幅作品，敢动手了', cat: 'works', type: 'progress', metric: 'works', need: 5, reward: 10 },
  { id: 'w10', ico: '🔟', name: '第十幅', desc: '墙上挂得下了', cat: 'works', type: 'progress', metric: 'works', need: 10, reward: 12 },
  { id: 'w20', ico: '🏛️', name: '画坛新秀', desc: '20 幅，够开个小展', cat: 'works', type: 'progress', metric: 'works', need: 20, reward: 18 },
  { id: 'w35', ico: '⏳', name: '熟能生巧', desc: '35 幅，手比脑子快', cat: 'works', type: 'progress', metric: 'works', need: 35, reward: 20 },
  { id: 'w50', ico: '👑', name: '半百之约', desc: '50 幅，一半的整数', cat: 'works', type: 'progress', metric: 'works', need: 50, reward: 25 },
  { id: 'w80', ico: '🗄️', name: '高产之魂', desc: '80 幅，产量惊人', cat: 'works', type: 'progress', metric: 'works', need: 80, reward: 25 },
  { id: 'w100', ico: '💯', name: '百幅长卷', desc: '100 幅，能办展了', cat: 'works', type: 'progress', metric: 'works', need: 100, reward: 30 },
  { id: 'w200', ico: '🏗️', name: '双百之作', desc: '200 幅，卷轴还没卷完', cat: 'works', type: 'progress', metric: 'works', need: 200, reward: 30 },
  { id: 'w500', ico: '🌌', name: '五百片海', desc: '500 幅，了不起', cat: 'works', type: 'progress', metric: 'works', need: 500, reward: 30 },
  { id: 'w300', ico: '🌆', name: '三百灯火', desc: '300 幅，灯火颇盛', cat: 'works', type: 'progress', metric: 'works', need: 300, reward: 30 },

  /* ---------- 绘制规模 ---------- */
  { id: 'c500', ico: '🔹', name: '初落笔墨', desc: '累计涂满 500 格', cat: 'cells', type: 'progress', metric: 'cells', need: 500, reward: 5 },
  { id: 'c2000', ico: '🔸', name: '小有所成', desc: '累计涂满 2000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 2000, reward: 8 },
  { id: 'c10k', ico: '💠', name: '万点星火', desc: '累计涂满 10000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 10000, reward: 15 },
  { id: 'c50k', ico: '🟦', name: '像素汪洋', desc: '累计涂满 50000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 50000, reward: 20 },
  { id: 'c200k', ico: '🟪', name: '二十万笔', desc: '累计涂满 200000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 200000, reward: 25 },
  { id: 'c500k', ico: '🟥', name: '五十万笔', desc: '累计涂满 500000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 500000, reward: 30 },
  { id: 'c1m', ico: '🌈', name: '百万像素宗师', desc: '累计涂满 1000000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 1000000, reward: 30 },
  { id: 'c200k2', ico: '🟨', name: '三十万笔', desc: '累计涂满 300000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 300000, reward: 25 },

  /* ---------- 获得认可 ---------- */
  { id: 'l1', ico: '💛', name: '第一声喝彩', desc: '收到第 1 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 1, reward: 2 },
  { id: 'l5', ico: '💚', name: '五人相随', desc: '收到 5 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 5, reward: 4 },
  { id: 'l10', ico: '💙', name: '小有名气', desc: '收到 10 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 10, reward: 6 },
  { id: 'l25', ico: '💜', name: '二十五份认可', desc: '收到 25 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 25, reward: 8 },
  { id: 'l50', ico: '🔥', name: '颇受喜爱', desc: '收到 50 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 50, reward: 12 },
  { id: 'l100', ico: '🎖️', name: '百赞加身', desc: '收到 100 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 100, reward: 18 },
  { id: 'l300', ico: '⭐', name: '众心所向', desc: '收到 300 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 300, reward: 25 },
  { id: 'l1000', ico: '🌟', name: '千赞巨匠', desc: '收到 1000 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 1000, reward: 30 },
  { id: 'b5', ico: '🔎', name: '佳作初现', desc: '有一幅画收到 5 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 5, reward: 6 },
  { id: 'b20', ico: '🖼️', name: '单幅封神', desc: '有一幅画收到 20 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 20, reward: 12 },
  { id: 'b50', ico: '💎', name: '镇站之宝', desc: '有一幅画收到 50 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 50, reward: 20 },
  { id: 'b200', ico: '👑', name: '一画倾城', desc: '有一幅画收到 200 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 200, reward: 30 },

  /* ---------- 连续创作（连着每天都画） ---------- */
  { id: 'r3', ico: '📆', name: '三日连击', desc: '连续 3 天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 3, reward: 5 },
  { id: 'r7', ico: '🗓️', name: '全勤一周', desc: '连续 7 天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 7, reward: 12 },
  { id: 'r14', ico: '📗', name: '两周全勤', desc: '连续 14 天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 14, reward: 18 },
  { id: 'r30', ico: '📕', name: '全勤满月', desc: '连续 30 天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 30, reward: 25 },
  { id: 'r100', ico: '📚', name: '百日全勤', desc: '连续 100 天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 100, reward: 30 },

  /* ---------- 长期坚持 ---------- */
  { id: 'd2', ico: '🌱', name: '两天之约', desc: '在 2 个不同的日子动过笔', cat: 'days', type: 'progress', metric: 'days', need: 2, reward: 2 },
  { id: 'd7', ico: '🌿', name: '一周坚持', desc: '累计创作 7 天', cat: 'days', type: 'progress', metric: 'days', need: 7, reward: 6 },
  { id: 'd30', ico: '🌳', name: '满月勤勉', desc: '累计创作 30 天', cat: 'days', type: 'progress', metric: 'days', need: 30, reward: 12 },
  { id: 'd100', ico: '🌲', name: '百日笔耕', desc: '累计创作 100 天', cat: 'days', type: 'progress', metric: 'days', need: 100, reward: 20 },
  { id: 'd365', ico: '🎍', name: '整年不停', desc: '累计创作 365 天', cat: 'days', type: 'progress', metric: 'days', need: 365, reward: 30 },
  { id: 'sp30', ico: '🗿', name: '创作老兵', desc: '从第一幅到最后一幅跨越 30 天', cat: 'days', type: 'progress', metric: 'spanDays', need: 30, reward: 10 },
  { id: 'sp365', ico: '🧱', name: '横跨一年', desc: '从第一幅到最后一幅跨越 365 天', cat: 'days', type: 'progress', metric: 'spanDays', need: 365, reward: 30 },

  /* ---------- 签到 ---------- */
  { id: 's3', ico: '🎫', name: '三日热度', desc: '累计签到 3 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 3, reward: 3 },
  { id: 's7', ico: '📗', name: '一周惯性', desc: '累计签到 7 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 7, reward: 6 },
  { id: 's30', ico: '📙', name: '签到铁人', desc: '累计签到 30 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 30, reward: 12 },
  { id: 's100', ico: '📚', name: '百日朝圣', desc: '累计签到 100 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 100, reward: 20 },
  { id: 's365', ico: '🏆', name: '全年朝圣者', desc: '累计签到 365 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 365, reward: 30 },
  { id: 's500', ico: '💠', name: '五百次到访', desc: '累计签到 500 天', cat: 'sign', type: 'progress', metric: 'signTotal', need: 500, reward: 30 },
  { id: 'k3', ico: '🥉', name: '连续三天', desc: '连续签到 3 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 3, reward: 4 },
  { id: 'k7', ico: '🥈', name: '连续一周', desc: '连续签到 7 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 7, reward: 10 },
  { id: 'k30', ico: '🥇', name: '连续满月', desc: '连续签到 30 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 30, reward: 20 },
  { id: 'k100', ico: '💎', name: '百日不辍', desc: '连续签到 100 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 100, reward: 30 },

  /* ---------- 光尘往来 ---------- */
  { id: 'go1', ico: '💝', name: '第一份心意', desc: '累计收到 1 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 1, reward: 2 },
  { id: 'go10', ico: '🎀', name: '十份心意', desc: '累计收到 10 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 10, reward: 5 },
  { id: 'go50', ico: '🧧', name: '众心所赠', desc: '累计收到 50 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 50, reward: 12 },
  { id: 'go100', ico: '💌', name: '百份心意', desc: '累计收到 100 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 100, reward: 18 },
  { id: 'go500', ico: '🎊', name: '五百份心意', desc: '累计收到 500 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 500, reward: 25 },
  { id: 'go1000', ico: '👑', name: '千份心意', desc: '累计收到 1000 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 1000, reward: 30 },
  { id: 'gd1', ico: '🤝', name: '第一份赠礼', desc: '送出 1 次光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 1, reward: 2 },
  { id: 'gd5', ico: '🎁', name: '慷慨之心', desc: '送出 5 次光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 5, reward: 5 },
  { id: 'gd20', ico: '🕊️', name: '雨露均沾', desc: '送出 20 次光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 20, reward: 10 },
  { id: 'gd100', ico: '🌸', name: '百礼相赠', desc: '送出 100 次光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 100, reward: 20 },
  { id: 'gd300', ico: '🎉', name: '慷慨如风', desc: '送出 300 次光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 300, reward: 30 },
  { id: 'go2000', ico: '💝', name: '两千份心意', desc: '累计收到 2000 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 2000, reward: 30 },

  /* ---------- 画布运用 ---------- */
  { id: 'v32', ico: '🟦', name: '更大一点', desc: '用 32×32 画过', cat: 'canvas', type: 'progress', metric: 'size32', need: 1, reward: 6 },
  { id: 'v32x10', ico: '🟪', name: '三十二见十', desc: '用 32×32 发布 10 幅', cat: 'canvas', type: 'progress', metric: 'size32', need: 10, reward: 18 },
  { id: 'v64', ico: '🏙️', name: '巨幅画布', desc: '用 64×64 画过', cat: 'canvas', type: 'progress', metric: 'size64', need: 1, reward: 12 },
  { id: 'v64x3', ico: '🏗️', name: '大工程', desc: '用 64×64 发布 3 幅', cat: 'canvas', type: 'progress', metric: 'size64', need: 3, reward: 25 },
  { id: 'v16x100', ico: '🔲', name: '十六见百', desc: '用 16×16 发布 100 幅', cat: 'canvas', type: 'progress', metric: 'size16', need: 100, reward: 20 },

  /* ---------- 玩法探索 ---------- */
  { id: 'an1', ico: '🎞️', name: '动起来的画', desc: '发布过动画作品', cat: 'play', type: 'progress', metric: 'animCount', need: 1, reward: 10 },
  { id: 'an3', ico: '🎬', name: '动画长跑', desc: '发布 3 幅动画', cat: 'play', type: 'progress', metric: 'animCount', need: 3, reward: 20 },
  { id: 'fr4', ico: '📽️', name: '四帧循环', desc: '做过 4 帧以上的动画', cat: 'play', type: 'progress', metric: 'maxFrames', need: 4, reward: 8 },
  { id: 'fr8', ico: '🎥', name: '八帧循环', desc: '做过 8 帧以上的动画', cat: 'play', type: 'progress', metric: 'maxFrames', need: 8, reward: 15 },
  { id: 'fr16', ico: '📀', name: '十六帧满载', desc: '做过 16 帧的动画', cat: 'play', type: 'progress', metric: 'maxFrames', need: 16, reward: 30 },
  { id: 'co4', ico: '🎨', name: '四色小品', desc: '单幅用过 4 种以上颜色', cat: 'play', type: 'progress', metric: 'maxColorsOne', need: 4, reward: 4 },
  { id: 'co12', ico: '🌈', name: '五色缤纷', desc: '单幅用过 12 种以上颜色', cat: 'play', type: 'progress', metric: 'maxColorsOne', need: 12, reward: 10 },
  { id: 'co20', ico: '🖌️', name: '万紫千红', desc: '单幅用过 20 种以上颜色', cat: 'play', type: 'progress', metric: 'maxColorsOne', need: 20, reward: 20 },
  { id: 'co32', ico: '💎', name: '调色满分', desc: '单幅用满 32 种颜色', cat: 'play', type: 'progress', metric: 'maxColorsOne', need: 32, reward: 30 },
  { id: 'ct1', ico: '🏆', name: '首次出征', desc: '报名参加过一次主题赛', cat: 'play', type: 'progress', metric: 'contestCount', need: 1, reward: 8 },
  { id: 'ct4', ico: '🎖️', name: '四度出征', desc: '报名参加 4 次主题赛', cat: 'play', type: 'progress', metric: 'contestCount', need: 4, reward: 15 },
  { id: 'ct10', ico: '👑', name: '常驻选手', desc: '报名参加 10 次主题赛', cat: 'play', type: 'progress', metric: 'contestCount', need: 10, reward: 25 },
  { id: 'cl50', ico: '🎨', name: '见过五十色', desc: '作品里一共出现过 50 种以上颜色', cat: 'play', type: 'progress', metric: 'colors', need: 50, reward: 12 },
  { id: 'cl150', ico: '🌈', name: '见过百五十色', desc: '作品里一共出现过 150 种以上颜色', cat: 'play', type: 'progress', metric: 'colors', need: 150, reward: 25 },
  { id: 'hr8', ico: '🕗', name: '早八画手', desc: '在 8 个不同时段发布过作品', cat: 'moment', type: 'progress', metric: 'hourCount', need: 8, reward: 10 },
  { id: 'hr16', ico: '🕛', name: '全日无休', desc: '在 16 个不同时段发布过作品', cat: 'moment', type: 'progress', metric: 'hourCount', need: 16, reward: 25 },


  /* ---------- 第二期：更长的尾巴 ----------
     上面那批是「入门到熟练」，这里是熟练之后还有得追的部分。
     奖励也随难度抬高，最难的一档给到 100。 */
  { id: 'w800', ico: '📜', name: '八百长卷', desc: '800 幅作品，卷轴堆成山', cat: 'works', type: 'progress', metric: 'works', need: 800, reward: 40 },
  { id: 'w1000', ico: '🏯', name: '千幅之城', desc: '1000 幅作品，够砌一座城', cat: 'works', type: 'progress', metric: 'works', need: 1000, reward: 50 },
  { id: 'w1500', ico: '🌠', name: '千五百幅', desc: '1500 幅，产量已入传奇', cat: 'works', type: 'progress', metric: 'works', need: 1500, reward: 60 },
  { id: 'c2m', ico: '🌌', name: '两百万格', desc: '累计涂满 2000000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 2000000, reward: 40 },
  { id: 'c5m', ico: '🪐', name: '五百万格', desc: '累计涂满 5000000 格', cat: 'cells', type: 'progress', metric: 'cells', need: 5000000, reward: 60 },
  { id: 'l2000', ico: '💫', name: '两千赞', desc: '累计收到 2000 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 2000, reward: 40 },
  { id: 'l5000', ico: '🌞', name: '五千赞', desc: '累计收到 5000 个赞', cat: 'likes', type: 'progress', metric: 'likes', need: 5000, reward: 60 },
  { id: 'bl30', ico: '📈', name: '单幅三十赞', desc: '一幅画收到 30 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 30, reward: 20 },
  { id: 'bl100', ico: '🏅', name: '单幅百赞', desc: '一幅画收到 100 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 100, reward: 40 },
  { id: 'bl300', ico: '🎇', name: '单幅三百赞', desc: '一幅画收到 300 个赞', cat: 'likes', type: 'progress', metric: 'bestLikes', need: 300, reward: 60 },
  { id: 'dy200', ico: '🌳', name: '两百天', desc: '累计 200 天画过画', cat: 'days', type: 'progress', metric: 'days', need: 200, reward: 30 },
  { id: 'dy365', ico: '📅', name: '一年之约', desc: '累计 365 天画过画', cat: 'days', type: 'progress', metric: 'days', need: 365, reward: 50 },
  { id: 'dy500', ico: '🗻', name: '五百天', desc: '累计 500 天画过画', cat: 'days', type: 'progress', metric: 'days', need: 500, reward: 70 },
  { id: 'mo6', ico: '🍃', name: '半年常客', desc: '在 6 个不同月份发布过作品', cat: 'days', type: 'progress', metric: 'monthsActive', need: 6, reward: 15 },
  { id: 'mo12', ico: '🎡', name: '全年在线', desc: '在 12 个不同月份发布过作品', cat: 'days', type: 'progress', metric: 'monthsActive', need: 12, reward: 35 },
  { id: 'mo24', ico: '🕰️', name: '两年老友', desc: '在 24 个不同月份发布过作品', cat: 'days', type: 'progress', metric: 'monthsActive', need: 24, reward: 60 },
  { id: 'pw1', ico: '🌟', name: '首幅热门', desc: '有一幅作品收到 20 个以上光尘', cat: 'likes', type: 'progress', metric: 'perfectWorks', need: 1, reward: 15 },
  { id: 'pw10', ico: '🌻', name: '十幅热门', desc: '有 10 幅作品各收到 20 个以上光尘', cat: 'likes', type: 'progress', metric: 'perfectWorks', need: 10, reward: 40 },
  { id: 'pw50', ico: '💐', name: '五十幅热门', desc: '有 50 幅作品各收到 20 个以上光尘', cat: 'likes', type: 'progress', metric: 'perfectWorks', need: 50, reward: 70 },
  { id: 'av10', ico: '⚖️', name: '幅幅十赞', desc: '20 幅以上作品、平均每幅 10 个赞', cat: 'likes', type: 'progress', metric: 'avgLikes', need: 10, reward: 35 },
  { id: 'av30', ico: '💠', name: '幅幅三十赞', desc: '20 幅以上作品、平均每幅 30 个赞', cat: 'likes', type: 'progress', metric: 'avgLikes', need: 30, reward: 65 },
  { id: 'we10', ico: '🎪', name: '周末画手', desc: '在周末发布过 10 幅作品', cat: 'moment', type: 'progress', metric: 'weekendCount', need: 10, reward: 15 },
  { id: 'we50', ico: '🏕️', name: '周末常客', desc: '在周末发布过 50 幅作品', cat: 'moment', type: 'progress', metric: 'weekendCount', need: 50, reward: 35 },
  { id: 'dn1', ico: '🌃', name: '凌晨两点', desc: '在凌晨 2~5 点发布过作品', cat: 'moment', type: 'progress', metric: 'deepNight', need: 1, reward: 6 },
  { id: 'dn10', ico: '🦉', name: '深夜常客', desc: '在凌晨 2~5 点发布过 10 幅作品', cat: 'moment', type: 'progress', metric: 'deepNight', need: 10, reward: 30 },
  { id: 'ss60', ico: '📆', name: '连续两月', desc: '连续签到 60 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 60, reward: 30 },
  { id: 'ss100', ico: '💯', name: '百日不辍', desc: '连续签到 100 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 100, reward: 45 },
  { id: 'ss200', ico: '🧱', name: '两百天签到', desc: '连续签到 200 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 200, reward: 70 },
  { id: 'ss365', ico: '🎆', name: '全年签到', desc: '连续签到 365 天', cat: 'sign', type: 'progress', metric: 'signStreak', need: 365, reward: 100 },
  { id: 'st200', ico: '🗓️', name: '签到两百次', desc: '累计签到 200 次', cat: 'sign', type: 'progress', metric: 'signTotal', need: 200, reward: 30 },
  { id: 'st365', ico: '📖', name: '签到一年', desc: '累计签到 365 次', cat: 'sign', type: 'progress', metric: 'signTotal', need: 365, reward: 60 },
  { id: 'gi100', ico: '🎁', name: '送出百份', desc: '给别人的作品送出 100 份光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 100, reward: 30 },
  { id: 'gi300', ico: '🧧', name: '送出三百份', desc: '给别人的作品送出 300 份光尘', cat: 'dust', type: 'progress', metric: 'gifted', need: 300, reward: 60 },
  { id: 'go5000', ico: '👑', name: '收到五千', desc: '累计收到 5000 个光尘', cat: 'dust', type: 'progress', metric: 'got', need: 5000, reward: 80 },
  { id: 'md3', ico: '🌊', name: '一日三画', desc: '同一天发布 3 幅作品', cat: 'run', type: 'progress', metric: 'maxPerDay', need: 3, reward: 12 },
  { id: 'md5', ico: '🌪️', name: '一日五画', desc: '同一天发布 5 幅作品', cat: 'run', type: 'progress', metric: 'maxPerDay', need: 5, reward: 25 },
  { id: 'md10', ico: '☄️', name: '一日十画', desc: '同一天发布 10 幅作品', cat: 'run', type: 'progress', metric: 'maxPerDay', need: 10, reward: 55 },
  { id: 'dr14', ico: '🔗', name: '连续半月', desc: '连续 14 天每天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 14, reward: 25 },
  { id: 'dr60', ico: '⛓️', name: '连续两月创作', desc: '连续 60 天每天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 60, reward: 60 },
  { id: 'dr100', ico: '🌉', name: '百日不断', desc: '连续 100 天每天都有作品', cat: 'run', type: 'progress', metric: 'dayRun', need: 100, reward: 90 },
  { id: 'ds3', ico: '🧩', name: '三种尺寸', desc: '16 / 32 / 64 三种画布都用过', cat: 'canvas', type: 'progress', metric: 'distinctSizes', need: 3, reward: 20 },
  { id: 'an10', ico: '🎞️', name: '十部动画', desc: '做过 10 部帧动画', cat: 'play', type: 'progress', metric: 'animCount', need: 10, reward: 20 },
  { id: 'an30', ico: '🎬', name: '三十部动画', desc: '做过 30 部帧动画', cat: 'play', type: 'progress', metric: 'animCount', need: 30, reward: 40 },
  { id: 'fr24', ico: '🎦', name: '二十四帧', desc: '做过 24 帧的动画', cat: 'play', type: 'progress', metric: 'maxFrames', need: 24, reward: 50 },
  { id: 'ct20', ico: '⚔️', name: '二十次出征', desc: '报名参加 20 次主题赛', cat: 'play', type: 'progress', metric: 'contestCount', need: 20, reward: 40 },
  { id: 'ct50', ico: '🛡️', name: '五十次出征', desc: '报名参加 50 次主题赛', cat: 'play', type: 'progress', metric: 'contestCount', need: 50, reward: 70 },
  { id: 'cl400', ico: '🎇', name: '见过四百色', desc: '作品里一共出现过 400 种以上颜色', cat: 'play', type: 'progress', metric: 'colors', need: 400, reward: 40 },
  { id: 'hr20', ico: '🕗', name: '二十时段', desc: '在 20 个不同时段发布过作品', cat: 'moment', type: 'progress', metric: 'hourCount', need: 20, reward: 35 },
  { id: 'hr24', ico: '🌐', name: '全天候满勤', desc: '24 个时段全都发布过作品', cat: 'moment', type: 'progress', metric: 'hourCount', need: 24, reward: 80 },
  /* ---------- 冒险世界 ----------
     数据来自 lw-town-save 的 world 段。由 computeMetrics 的第四个参数
     town 传进来；不传就全是 0，所以别的路径（每日任务）上这些只会
     显示成未解锁，不会误判成已达成。 */
  { id: 'adv_mine10', ico: '⛏️', name: '第一镐', desc: '挖掉 10 个方块', cat: 'adventure', type: 'progress', metric: 'mined', need: 10, reward: 5 },
  { id: 'adv_mine200', ico: '🪨', name: '挖穿一层', desc: '挖掉 200 个方块', cat: 'adventure', type: 'progress', metric: 'mined', need: 200, reward: 12 },
  { id: 'adv_mine2000', ico: '🏔️', name: '愚公移山', desc: '挖掉 2000 个方块', cat: 'adventure', type: 'progress', metric: 'mined', need: 2000, reward: 30 },
  { id: 'adv_place100', ico: '🧱', name: '开始盖了', desc: '放下 100 个方块', cat: 'adventure', type: 'progress', metric: 'placed', need: 100, reward: 12 },
  { id: 'adv_place1000', ico: '🏰', name: '营造师', desc: '放下 1000 个方块', cat: 'adventure', type: 'progress', metric: 'placed', need: 1000, reward: 30 },
  { id: 'adv_block20', ico: '📖', name: '见过世面', desc: '图鉴里收集 20 种方块', cat: 'adventure', type: 'progress', metric: 'blocks', need: 20, reward: 10 },
  { id: 'adv_block50', ico: '📚', name: '博物学者', desc: '图鉴里收集 50 种方块', cat: 'adventure', type: 'progress', metric: 'blocks', need: 50, reward: 25 },
  { id: 'adv_block80', ico: '🗂️', name: '全方块图鉴', desc: '图鉴里收集 80 种方块', cat: 'adventure', type: 'progress', metric: 'blocks', need: 80, reward: 40 },
  { id: 'adv_mob3', ico: '🐾', name: '见过活物', desc: '遇到过 3 种生物', cat: 'adventure', type: 'progress', metric: 'mobs', need: 3, reward: 8 },
  { id: 'adv_mob8', ico: '🦌', name: '荒野向导', desc: '遇到过 8 种生物', cat: 'adventure', type: 'progress', metric: 'mobs', need: 8, reward: 25 },
  { id: 'adv_mob12', ico: '🐉', name: '全都见过了', desc: '遇到过全部 12 种生物', cat: 'adventure', type: 'progress', metric: 'mobs', need: 12, reward: 40 },
  { id: 'adv_struct1', ico: '🗿', name: '发现遗迹', desc: '找到第一处结构', cat: 'adventure', type: 'progress', metric: 'structs', need: 1, reward: 10 },
  { id: 'adv_struct5', ico: '🏛️', name: '考古学家', desc: '找到 5 处结构', cat: 'adventure', type: 'progress', metric: 'structs', need: 5, reward: 25 },
  { id: 'adv_struct15', ico: '🌍', name: '踏遍小镇', desc: '找到 15 处结构', cat: 'adventure', type: 'progress', metric: 'structs', need: 15, reward: 40 },
  { id: 'adv_cave', ico: '🕳️', name: '下过洞穴', desc: '第一次下到洞穴层', cat: 'adventure', type: 'progress', metric: 'deepest', need: 1, reward: 12 },
  { id: 'adv_deep', ico: '🌑', name: '深入地心', desc: '下到最深的深层', cat: 'adventure', type: 'progress', metric: 'deepest', need: 2, reward: 30 },
  { id: 'adv_safe', ico: '🛡️', name: '毫发无伤', desc: '动手了但一次都没倒下', cat: 'adventure', type: 'progress', metric: 'advSafe', need: 1, reward: 20 },

]

/* 里程碑型：只判断条件，不看累计数 */
export const BADGES = [
  { id: 'g_night', ico: '🌙', name: '深夜画室', desc: '在深夜发布过作品', cat: 'moment' },
  { id: 'g_dawn', ico: '🌅', name: '早起鸟儿', desc: '在清晨发布过作品', cat: 'moment' },
  { id: 'g_morning', ico: '🌤️', name: '上午好', desc: '在上午发布过作品', cat: 'moment' },
  { id: 'g_noon', ico: '🍚', name: '午饭时间', desc: '在中午发布过作品', cat: 'moment' },
  { id: 'g_afternoon', ico: '🌞', name: '午后画手', desc: '在下午发布过作品', cat: 'moment' },
  { id: 'g_evening', ico: '🌆', name: '傍晚时分', desc: '在傍晚发布过作品', cat: 'moment' },
  { id: 'g_allhours', ico: '🕐', name: '全天候画手', desc: '在 12 个不同时段都发布过', cat: 'moment' },
  { id: 'g_twice', ico: '⚡', name: '一日双画', desc: '同一天发布 2 幅作品', cat: 'moment' },
  { id: 'g_mixsize', ico: '🔀', name: '大小通吃', desc: '16 和大尺寸都用过', cat: 'canvas' },
  { id: 'g_only16', ico: '🔲', name: '十六见', desc: '全部作品都是 16×16', cat: 'canvas' },
  { id: 'g_early', ico: '🐣', name: '元老成员', desc: '账号注册超过 30 天', cat: 'moment' },
  { id: 'g_senior', ico: '🧓', name: '老成员', desc: '账号注册超过 180 天', cat: 'moment' },
  { id: 'g_veteran', ico: '🗿', name: '时光旅人', desc: '第一幅与最后一幅跨越 100 天以上', cat: 'days' },

  { id: 'g_weekend', ico: '🎪', name: '周末也画', desc: '在周末发布过作品', cat: 'moment' },
  { id: 'g_allsizes', ico: '🧩', name: '尺寸全通', desc: '16 / 32 / 64 三种画布都用过', cat: 'canvas' },
  { id: 'g_deepnight', ico: '🦉', name: '凌晨工作室', desc: '在凌晨 2~5 点发布过作品', cat: 'moment' },
  { id: 'g_perfect', ico: '🌟', name: '热门之作', desc: '有一幅作品收到 20 个以上光尘', cat: 'likes' },
]

export const ALL = [...PROGRESS, ...BADGES]

/** 进度型里程碑的奖励档位（连续签到之外，交给成就系统统一发） */
const SIGN_MILESTONES = [3, 7, 15, 30, 60, 100, 200, 365]

/**
 * 从作品历史算出各项指标。
 * entries：该用户的作品列表（已按归属过滤）
 */
export function computeMetrics(entries, book, user, town) {
  let works = 0
  let cells = 0
  let likes = 0
  let gifted = 0
  const days = new Set()
  const badges = {}
  const sizes = {}
  const allColors = new Set()
  const hours = new Set()
  const perDay = new Map()
  let anim = false
  let animCount = 0
  let maxFrames = 0
  let contest = false
  let contestCount = 0
  let night = false
  let maxColorsOne = 0
  let bestLikes = 0
  let biggestSize = 0
  let first = 0
  let last = 0
  // 后面这批指标是给「更耐玩」的高阶成就用的
  let weekendCount = 0 // 周末发布的作品数
  let deepNight = 0 // 凌晨 2~5 点发布的作品数
  let perfectWorks = 0 // 单幅收到 20 个以上光尘的作品数
  const months = new Set() // 有过作品的「年-月」

  for (const e of entries) {
    if (!e) continue
    works += 1
    likes += Number(e.likes) || 0
    if (e.contest) {
      contest = true
      contestCount += 1
    }
    if (e.anim) {
      anim = true
      animCount += 1
      const f = e.anim && Array.isArray(e.anim.frames) ? e.anim.frames.length : 0
      if (f > maxFrames) maxFrames = f
    }
    const s = e.size === 32 || e.size === 64 ? e.size : 16
    sizes[s] = (sizes[s] || 0) + 1
    if (s > biggestSize) biggestSize = s
    const lk = Number(e.likes) || 0
    if (lk > bestLikes) bestLikes = lk
    if (lk >= 20) perfectWorks += 1

    const t = Number(e.time) || 0
    if (t) {
      const d = new Date(t)
      const dk = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
      days.add(dk)
      perDay.set(dk, (perDay.get(dk) || 0) + 1)
      hours.add(d.getHours())
      if (!first || t < first) first = t
      if (t > last) last = t
      // 23:00~05:00 算夜里
      const hr = d.getHours()
      if (hr >= 23 || hr < 5) night = true
      const wd = d.getDay()
      if (wd === 0 || wd === 6) weekendCount += 1
      if (hr >= 2 && hr < 5) deepNight += 1
      months.add(d.getFullYear() + '-' + d.getMonth())
    }

    // 纯白视为画布底色，不计入绘制量。
    // 像素相机（fromImage）转出来的作品不算「一笔一笔画的」——
    // 一张 64×64 的照片就是 4096 格，不排除的话传几十张就能刷满
    // 「十万格之境」这类成就。作品数照算，只有绘制量不算。
    if (!e.fromImage) {
      const px = Array.isArray(e.pixels) ? e.pixels : []
      const seen = new Set()
      for (const p of px) {
        if (!Array.isArray(p) || p.length < 3) continue
        if (p[0] > 246 && p[1] > 246 && p[2] > 246) continue
        cells += 1
        const key = (p[0] >> 3) + ',' + (p[1] >> 3) + ',' + (p[2] >> 3)
        seen.add(key)
        allColors.add(key)
      }
      if (seen.size > maxColorsOne) maxColorsOne = seen.size
    }
  }

  if (sizes[32]) badges.size32 = true
  if (sizes[64]) badges.size64 = true
  if (anim) badges.anim = true
  if (contest) badges.contest = true
  if (night) badges.night = true

  if (book) {
    gifted = Array.isArray(book.gifted) ? book.gifted.length : 0
    if (gifted > 0) badges.gifted = true
    if (gifted >= 50) badges.gifted50 = true
  }
  if (user && user.createdAt && Date.now() - user.createdAt > 30 * 86400000) {
    badges.early = true
  }

  const hoursArr = [...hours]
  /** 是否在 [from,to) 这个钟点区间发布过；跨零点(from>to)拆成两段 */
  const has = (from, to) => {
    for (const h of hoursArr) {
      if (from < to ? h >= from && h < to : h >= from || h < to) return true
    }
    return false
  }

  // 单日最多发布几幅
  let maxPerDay = 0
  for (const n of perDay.values()) if (n > maxPerDay) maxPerDay = n

  // 最长「连续每天都画了」的天数：把有作品的日期排好序再数间隔
  const dayNums = [...days]
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number)
      return Date.UTC(y, m, d) / 86400000
    })
    .sort((a, b) => a - b)
  let dayRun = 0
  let run = 0
  for (let i = 0; i < dayNums.length; i++) {
    if (i > 0 && dayNums[i] - dayNums[i - 1] === 1) run += 1
    else run = 1
    if (run > dayRun) dayRun = run
  }

  /* 冒险世界的指标。town 是 /api/towngame 里那份存档的 world 段；
     没传就全是 0。 */
  const WD = (town && town.world) || null
  const mined = WD ? Number(WD.mined) || 0 : 0
  const placed = WD ? Number(WD.placed) || 0 : 0
  const deaths = WD ? Number(WD.deaths) || 0 : 0
  const blocks = WD && WD.dex ? Object.keys(WD.dex).length : 0
  const mobs = WD && WD.dmob ? Object.keys(WD.dmob).length : 0
  const structs = WD && WD.found ? Object.keys(WD.found).length : 0
  const deepest = WD ? Number(WD.layer) || 0 : 0
  const advSafe = WD && deaths === 0 && mined + placed > 0 ? 1 : 0

  return {
    mined,
    placed,
    blocks,
    mobs,
    structs,
    deepest,
    advSafe,
    works,
    cells,
    likes,
    days: days.size,
    gifted,
    // 累计收到的光尘（别人送到自己作品上的）
    got: book ? Number(book.got) || 0 : 0,
    signTotal: book ? Number(book.total) || 0 : 0,
    signStreak: book ? Number(book.streak) || 0 : 0,
    // 以下为扩展指标，供更多成就使用
    bestLikes,
    maxColorsOne,
    colors: allColors.size,
    biggestSize,
    size16: sizes[16] || 0,
    size32: sizes[32] || 0,
    size64: sizes[64] || 0,
    animCount,
    maxFrames,
    contestCount,
    spanDays: first && last ? Math.max(1, Math.round((last - first) / 86400000) + 1) : 0,
    maxPerDay,
    dayRun,
    // 高阶成就用的（见文件上方 computeMetrics 里的新指标）
    monthsActive: months.size,
    weekendCount,
    deepNight,
    perfectWorks,
    avgLikes: works > 0 ? Math.round(likes / works) : 0,
    distinctSizes: (sizes[16] ? 1 : 0) + (sizes[32] ? 1 : 0) + (sizes[64] ? 1 : 0),
    // —— 里程碑型成就直接以同名字段被读取，所以在这里显式给出 ——
    g_twice: maxPerDay >= 2,
    g_allhours: hoursArr.length >= 12,
    g_mixsize: !!(sizes[16] && (sizes[32] || sizes[64])),
    g_only16: works > 0 && !sizes[32] && !sizes[64],
    g_night: has(23, 5),
    g_dawn: has(5, 8),
    g_morning: has(8, 12),
    g_noon: has(12, 14),
    g_afternoon: has(14, 18),
    g_evening: has(18, 23),
    g_early: !!(user && user.createdAt && Date.now() - user.createdAt > 30 * 86400000),
    g_senior: !!(user && user.createdAt && Date.now() - user.createdAt > 180 * 86400000),
    g_veteran: !!(first && last && last - first > 100 * 86400000),
    hourCount: hoursArr.length,
    badges,
  }
}

/**
 * 比对已解锁记录，返回本次新解锁的成就。
 * 只在「新解锁」时发奖，所以重复调用不会重复发放。
 */
export function diffUnlock(metrics, unlocked) {
  const got = unlocked && typeof unlocked === 'object' ? unlocked : {}
  const fresh = []

  for (const a of PROGRESS) {
    if (got[a.id]) continue
    if ((metrics[a.metric] || 0) >= a.need) {
      got[a.id] = Date.now()
      fresh.push({ ...a, kind: 'progress' })
    }
  }
  for (const b of BADGES) {
    if (got[b.id]) continue
    if (metrics[b.id]) {
      got[b.id] = Date.now()
      fresh.push({ ...b, kind: 'badge', reward: 0 })
    }
  }

  return { unlocked: got, fresh }
}

/** 组装给前端的视图：进度型带完成度，里程碑型只有解锁与否 */
export function view(unlocked) {
  const got = unlocked && typeof unlocked === 'object' ? unlocked : {}
  const items = ALL.map((a) => {
    if (a.kind === 'badge' || BADGES.indexOf(a) >= 0) {
      return {
        id: a.id,
        ico: a.ico,
        name: a.name,
        desc: a.desc,
        cat: a.cat,
        type: 'badge',
        got: !!got[a.id],
        at: got[a.id] || 0,
      }
    }
    return {
      id: a.id,
      ico: a.ico,
      name: a.name,
      desc: a.desc,
      cat: a.cat,
      type: 'progress',
      metric: a.metric,
      need: a.need,
      reward: a.reward || 0,
      got: !!got[a.id],
      at: got[a.id] || 0,
    }
  })
  return {
    items,
    categories: CATEGORIES,
    unlocked: items.filter((x) => x.got).length,
    total: items.length,
  }
}

export { SIGN_MILESTONES }
