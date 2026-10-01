// 服务端判断「这幅画是不是照片转出来的」
//
// 为什么需要这个：fromImage 标记以前是客户端自己传的
// （set.js 里 `if (body.fromImage === true) entry.fromImage = true`），
// 只要不发这个字段就能当成原创 —— 拿发布奖励、算绘制格数成就、
// 收光尘、收票全都通吃。改成服务端自己判断，客户端说的只作参考。
//
// 先说实话：**像素级无法可靠区分「手绘」和「照片转图再改几格」**。
// 两种情况在数据上都是一串 RGB，改几个格子之后两者完全一样。
// 所以这里做的是「有证据才标」，宁可漏也不冤枉人：
// 证据不足一律当手绘处理，不会让正常画师平白被扣。
//
// 用的两个统计特征（都是照片量化的典型副作用，手绘基本不会有）：
//
//   1. 渐变密度：照片转图会保留大量「相邻格颜色很接近但不相等」的过渡，
//      手绘是成片的纯色块。把图缩到 8×8 统计这种「近邻差异」的比例。
//   2. 调色板规模：照片量化后色数落在几十到几百；
//      手绘通常只用几种到几十种颜色。
//
// 阈值取得很保守，两个特征同时成立才判定，可疑但不够确定的只做标记。

/** 把像素数组缩到 n×n 的平均色（用最近邻取样即可，不需要高质量重采样） */
function downsample(pixels, size, n) {
  const out = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const sx = Math.min(size - 1, Math.floor(((x + 0.5) * size) / n))
      const sy = Math.min(size - 1, Math.floor(((y + 0.5) * size) / n))
      const p = pixels[sy * size + sx]
      out.push(Array.isArray(p) && p.length >= 3 ? p : [255, 255, 255])
    }
  }
  return out
}

/** 统计渐变密度：相邻（上下左右）颜色「接近但不相等」的比例 */
function gradientRatio(pixels, size) {
  if (!Array.isArray(pixels) || pixels.length < 4) return 0
  const n = 8
  const g = downsample(pixels, size, n)
  const idx = (x, y) => y * n + x
  let near = 0
  let total = 0
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = g[idx(x, y)]
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= n || ny >= n) continue
        const b = g[idx(nx, ny)]
        const d =
          Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
        total++
        // 差值 0 = 纯色块（手绘）；差值 1~90 = 过渡（照片量化的残留）
        if (d > 0 && d <= 90) near++
      }
    }
  }
  return total ? near / total : 0
}

/** 统计用到的不同颜色数（量化到 5 位，忽略肉眼看不出的细微差别） */
function paletteSize(pixels) {
  if (!Array.isArray(pixels)) return 0
  const s = new Set()
  for (const p of pixels) {
    if (!Array.isArray(p) || p.length < 3) continue
    s.add(((p[0] >> 3) << 10) | ((p[1] >> 3) << 5) | (p[2] >> 3))
  }
  return s.size
}

/**
 * 判断结果
 *   camera   —— 证据充分，当作相机作品处理
 *   suspect  —— 有点像但不够确定，只做标记（不取消发布奖励以外的惩罚）
 *   normal   —— 没有证据，按手绘处理
 */
export function inspectArtwork(pixels, size, claimedFromImage) {
  // 客户端主动声明的，一律直接采信 —— 自己承认没理由不信
  if (claimedFromImage === true) {
    return { verdict: 'camera', reason: '客户端声明为相机作品', grad: 0, colors: 0 }
  }

  const s = size === 32 || size === 64 ? size : 16
  if (!Array.isArray(pixels) || pixels.length < s * s * 0.5) {
    return { verdict: 'normal', reason: '数据不完整', grad: 0, colors: 0 }
  }

  const grad = gradientRatio(pixels, s)
  const colors = paletteSize(pixels)

  // 两个特征同时成立才判相机作品，阈值刻意保守
  if (grad >= 0.34 && colors >= 40) {
    return { verdict: 'camera', reason: '照片转图特征明显（渐变密度与色数同时偏高）', grad, colors }
  }
  // 只有渐变、没有色数，或反过来：多半是渐变画 / 高对比手绘，只标记不处理
  if (grad >= 0.5 || colors >= 120) {
    return { verdict: 'suspect', reason: '像素特征接近照片转图，建议人工看一眼', grad, colors }
  }
  return { verdict: 'normal', reason: '没有照片转图特征', grad, colors }
}
