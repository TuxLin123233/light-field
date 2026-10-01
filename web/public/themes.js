/* ===========================================================================
 * 配色主题：由下方单张数据表自动生成 CSS，不要手写主题块。
 * 之所以这么做：20 套主题手写极易互相覆盖或漏闭合，改一处颜色要翻十几个地方。
 * 改主题只改 THEMES 数据，再改 VERSION 号让 Service Worker 更新缓存。
 * =========================================================================== */

/* ---------- 夜间系的共同基底：先写一次，6 套夜间主题共用 ---------- */
const THEME_DARK_BASE = {
  surface: '#21242e',
  'surface-2': '#2a2e3a',
  'surface-3': '#232733',
  'art-bg': '#f2f0ec',
  text: '#e8eaf0',
  'text-muted': '#b3b8c6',
  'text-muted2': '#8d93a3',
  'text-faint': '#6b7180',
  'text-report': '#8b90a0',
  border: '#2c303d',
  'border-strong': '#3b4050',
  'border-input': '#383d4c',
  ring: '#21242e',
  shadow1: 'rgba(0, 0, 0, 0.34)',
  shadow2: 'rgba(0, 0, 0, 0.26)',
  shadow3: 'rgba(0, 0, 0, 0.18)',
  'shadow-hover': 'rgba(0, 0, 0, 0.58)',
  'toast-bg': '#2f3444',
  'tip-text': '#d8b483',
  'tip-btn-border': '#4a3a24',
  'blacktip-bg': '#262a20',
  'blacktip-border': '#4a3a24',
  'blacktip-text': '#e0bd85',
  like: '#ff8f9c',
  'like-bg': '#3a2436',
  'like-border': '#553044',
  'nav-halo': '0, 0, 0',
}

/* navBase 是 RGB 三元组，导航条与文字光晕都用它 */
const THEMES = [
  /* ============ 浅色系（导航光晕用白光） ============ */
  {
    id: 'light', name: '暖白', group: 'light',
    navBase: '255, 253, 250', sw: ['#fdf8f2', '#f2ece2', '#5b8def'],
  },
  {
    id: 'sakura', name: '樱粉', group: 'light',
    navBase: '255, 250, 251', sw: ['#fdf2f5', '#f0b9c9', '#e0698a'],
    v: {
      bg: 'linear-gradient(160deg, #fdf2f5 0%, #f6e3ea 100%)',
      surface: '#fffafb', 'surface-2': '#f7e7ec', 'surface-3': '#f2dde4', 'art-bg': '#fff',
      text: '#4a3540', 'text-muted': '#7d6470', 'text-muted2': '#a08d97', 'text-faint': '#bfa9b3',
      border: '#f2dde4', 'border-strong': '#e8c6d1', 'border-input': '#e4c2ce', ring: '#fffafb',
      accent: '#e0698a',
      'like': '#e0576a', 'like-bg': '#fdeef1', 'like-border': '#f0c9d3',
    },
  },
  {
    id: 'sea', name: '海盐', group: 'light',
    navBase: '251, 254, 255', sw: ['#f0f8fa', '#a8d5e0', '#2f93a8'],
    v: {
      bg: 'linear-gradient(160deg, #f0f8fa 0%, #ddeef2 100%)',
      surface: '#fbfeff', 'surface-2': '#e4f1f4', 'surface-3': '#d8eaee', 'art-bg': '#fff',
      text: '#2c3f47', 'text-muted': '#5a7079', 'text-muted2': '#8599a1', 'text-faint': '#a3b4ba',
      border: '#dcecef', 'border-strong': '#c3dee3', 'border-input': '#bfdbe1', ring: '#fbfeff',
      accent: '#2f93a8',
      'like': '#e05a6a', 'like-bg': '#fdeff1', 'like-border': '#f2ccd3',
    },
  },
  {
    id: 'mint', name: '薄荷', group: 'light',
    navBase: '252, 255, 252', sw: ['#f2f9f1', '#a9d9b2', '#3f9c5c'],
    v: {
      bg: 'linear-gradient(160deg, #f2f9f1 0%, #e2f1e3 100%)',
      surface: '#fcfffc', 'surface-2': '#e6f2e6', 'surface-3': '#dcecdd', 'art-bg': '#fff',
      text: '#33452f', 'text-muted': '#5c705a', 'text-muted2': '#869a84', 'text-faint': '#aeb7a5',
      border: '#ddedde', 'border-strong': '#c3ddc5', 'border-input': '#bfd9c1', ring: '#fcfffc',
      accent: '#3f9c5c',
      'like': '#e0576a', 'like-bg': '#fdeff1', 'like-border': '#f2ccd3',
    },
  },
  {
    id: 'sunset', name: '暖阳', group: 'light',
    navBase: '255, 252, 248', sw: ['#fff6ec', '#f6c896', '#d9823e'],
    v: {
      bg: 'linear-gradient(160deg, #fff6ec 0%, #fbe6d2 100%)',
      surface: '#fffcf8', 'surface-2': '#fbeedd', 'surface-3': '#f7e3cf', 'art-bg': '#fff',
      text: '#4a3826', 'text-muted': '#7d6248', 'text-muted2': '#a08771', 'text-faint': '#bda189',
      border: '#f7e3cf', 'border-strong': '#eecfb0', 'border-input': '#ebc9a7', ring: '#fffcf8',
      accent: '#d9823e',
      'like': '#d9524a', 'like-bg': '#fdeeea', 'like-border': '#f2ccc4',
    },
  },
  {
    id: 'milktea', name: '奶茶', group: 'light',
    navBase: '255, 253, 250', sw: ['#faf4ec', '#e0cbb2', '#b3805a'],
    v: {
      bg: 'linear-gradient(160deg, #faf4ec 0%, #f0e4d5 100%)',
      surface: '#fffdfa', 'surface-2': '#f3e9dc', 'surface-3': '#ece0d0', 'art-bg': '#fff',
      text: '#4a3d31', 'text-muted': '#7d6d5c', 'text-muted2': '#a08e7b', 'text-faint': '#bda896',
      border: '#eee0cf', 'border-strong': '#e0cbb2', 'border-input': '#dcc5aa', ring: '#fffdfa',
      accent: '#b3805a',
    },
  },
  {
    id: 'lavender', name: '薰衣草', group: 'light',
    navBase: '253, 252, 255', sw: ['#f7f5fc', '#d5cce9', '#8b72d8'],
    v: {
      bg: 'linear-gradient(160deg, #f7f5fc 0%, #ebe6f7 100%)',
      surface: '#fdfcff', 'surface-2': '#f0ecf9', 'surface-3': '#e8e2f5', 'art-bg': '#fff',
      text: '#3f3852', 'text-muted': '#6f6688', 'text-muted2': '#918aa6', 'text-faint': '#afa8c0',
      border: '#e6e0f3', 'border-strong': '#d5cce9', 'border-input': '#d0c6e6', ring: '#fdfcff',
      accent: '#8b72d8',
    },
  },
  {
    id: 'peach', name: '蜜桃', group: 'light',
    navBase: '255, 252, 250', sw: ['#fff5f1', '#f8cdb9', '#ef7a52'],
    v: {
      bg: 'linear-gradient(160deg, #fff5f1 0%, #ffe8de 100%)',
      surface: '#fffcfa', 'surface-2': '#ffede4', 'surface-3': '#ffe4d7', 'art-bg': '#fff',
      text: '#4d3830', 'text-muted': '#836257', 'text-muted2': '#a88a7c', 'text-faint': '#c6a99b',
      border: '#ffe3d6', 'border-strong': '#f8cdb9', 'border-input': '#f5c8b2', ring: '#fffcfa',
      accent: '#ef7a52',
    },
  },
  {
    id: 'mist', name: '雾霭', group: 'light',
    navBase: '251, 252, 253', sw: ['#f4f6f7', '#d0d6dc', '#5b7c99'],
    v: {
      bg: 'linear-gradient(160deg, #f4f6f7 0%, #e6eaed 100%)',
      surface: '#fbfcfd', 'surface-2': '#eef1f4', 'surface-3': '#e6eaee', 'art-bg': '#fff',
      text: '#363d44', 'text-muted': '#626b74', 'text-muted2': '#8b939c', 'text-faint': '#a9b0b7',
      border: '#e3e7eb', 'border-strong': '#d0d6dc', 'border-input': '#ccd3d9', ring: '#fbfcfd',
      accent: '#5b7c99',
    },
  },
  {
    id: 'matcha', name: '抹茶', group: 'light',
    navBase: '253, 254, 249', sw: ['#f6f8ee', '#d3dcbe', '#7a9c4a'],
    v: {
      bg: 'linear-gradient(160deg, #f6f8ee 0%, #e9efdb 100%)',
      surface: '#fdfef9', 'surface-2': '#eff3e4', 'surface-3': '#e7ecd9', 'art-bg': '#fff',
      text: '#3c4433', 'text-muted': '#6a7460', 'text-muted2': '#909a86', 'text-faint': '#aeb7a5',
      border: '#e6ebd8', 'border-strong': '#d3dcbe', 'border-input': '#ced8b8', ring: '#fdfef9',
      accent: '#7a9c4a',
    },
  },
  {
    id: 'oat', name: '燕麦', group: 'light',
    navBase: '254, 253, 249', sw: ['#faf7f0', '#dcd2bd', '#8a7a55'],
    v: {
      bg: 'linear-gradient(160deg, #faf7f0 0%, #efe9dd 100%)',
      surface: '#fefdf9', 'surface-2': '#f3eee3', 'surface-3': '#ece6d8', 'art-bg': '#fff',
      text: '#45413a', 'text-muted': '#756f64', 'text-muted2': '#9a9488', 'text-faint': '#b8b2a6',
      border: '#ece5d6', 'border-strong': '#dcd2bd', 'border-input': '#d6cbb4', ring: '#fefdf9',
      accent: '#8a7a55',
    },
  },
  {
    id: 'sepia', name: '复古', group: 'light',
    navBase: '253, 248, 236', sw: ['#f6efe2', '#d4c19f', '#a2703c'],
    v: {
      bg: 'linear-gradient(160deg, #f6efe2 0%, #e9dcc4 100%)',
      surface: '#fdf8ec', 'surface-2': '#f0e6d2', 'surface-3': '#e8dcc4', 'art-bg': '#fffaf0',
      text: '#43382a', 'text-muted': '#75634a', 'text-muted2': '#9a886d', 'text-faint': '#b8a68a',
      border: '#e6d8bd', 'border-strong': '#d4c19f', 'border-input': '#cdb890', ring: '#fdf8ec',
      accent: '#a2703c',
    },
  },

  /* ============ 深色系（光晕用黑光） ============ */
  {
    id: 'dark', name: '夜间', group: 'dark',
    navBase: '42, 38, 33', sw: ['#211c17', '#18140f', '#76a3ff'],
    v: {
      bg: 'linear-gradient(160deg, #211c17 0%, #18140f 100%)',
      surface: '#2a251f', 'surface-2': '#38312a', 'surface-3': '#322c25', 'art-bg': '#f6f2ea',
      text: '#f1ead9', 'text-muted': '#c5baa7', 'text-muted2': '#a39582', 'text-faint': '#857b68',
      'text-report': '#97896d',
      border: '#4a4238', 'border-strong': '#5e5448', 'border-input': '#554b3e', ring: '#2a251f',
      shadow1: 'rgba(0, 0, 0, 0.30)', shadow2: 'rgba(0, 0, 0, 0.22)', shadow3: 'rgba(0, 0, 0, 0.16)',
      'shadow-hover': 'rgba(0, 0, 0, 0.55)',
      'toast-bg': '#3e372e',
      'tip-text': '#e8b970', 'tip-btn-border': '#4e3a20',
      'blacktip-bg': '#2b2316', 'blacktip-border': '#4e3a20', 'blacktip-text': '#eec27d',
      like: '#ff8577', 'like-bg': '#3d231f', 'like-border': '#5e352c',
    },
  },
  {
    id: 'midnight', name: '夜阑', group: 'dark', from: 'dark',
    navBase: '33, 34, 58', sw: ['#21223a', '#4a4a80', '#8b7cf0'],
    v: {
      bg: 'linear-gradient(160deg, #191a2e 0%, #12131f 100%)',
      surface: '#21223a', 'surface-2': '#2b2c48', 'surface-3': '#33345a', 'art-bg': '#f4f2ee',
      text: '#ece9f5', 'text-muted': '#b6b2cc', 'text-muted2': '#918ca8', 'text-faint': '#6f6a86',
      border: '#2e2f4c', 'border-strong': '#3d3e63', 'border-input': '#3a3b5e', ring: '#21223a',
      accent: '#8b7cf0', 'toast-bg': '#34355a',
      like: '#ff8f9c', 'like-bg': '#3a2436', 'like-border': '#553044',
    },
  },
  {
    id: 'ocean-night', name: '深海', group: 'dark', from: 'night',
    navBase: '22, 35, 47', sw: ['#0e1a26', '#2a3f52', '#4cc2e0'],
    v: {
      bg: 'linear-gradient(160deg, #0e1a26 0%, #0a121c 100%)',
      text: '#dceaf5', 'text-muted': '#9fb6c9', 'text-muted2': '#7b95a9', 'text-faint': '#5c7386',
      border: '#1c2c3a', 'border-strong': '#2a3f52', 'border-input': '#26394a',
      surface: '#16232f', 'surface-2': '#1d2d3b', 'surface-3': '#182634', ring: '#16232f',
      accent: '#4cc2e0',
    },
  },
  {
    id: 'ink', name: '墨林', group: 'dark', from: 'night',
    navBase: '23, 32, 27', sw: ['#121714', '#2b3a31', '#5fc98d'],
    v: {
      bg: 'linear-gradient(160deg, #121714 0%, #0c100e 100%)',
      text: '#e2ece5', 'text-muted': '#a8b8ad', 'text-muted2': '#869689', 'text-faint': '#64756a',
      border: '#1d2822', 'border-strong': '#2b3a31', 'border-input': '#26332c',
      surface: '#17201b', 'surface-2': '#1f2a24', 'surface-3': '#1a231e', ring: '#17201b',
      accent: '#5fc98d',
    },
  },
  {
    id: 'rose-night', name: '玫瑰夜', group: 'dark', from: 'night',
    navBase: '38, 22, 27', sw: ['#241419', '#45242c', '#e8778f'],
    v: {
      bg: 'linear-gradient(160deg, #241419 0%, #190d11 100%)',
      text: '#f4dfe4', 'text-muted': '#c8a8b1', 'text-muted2': '#a48791', 'text-faint': '#7d646d',
      border: '#33191f', 'border-strong': '#45242c', 'border-input': '#3b1f26',
      surface: '#26161b', 'surface-2': '#301c22', 'surface-3': '#2a181d', ring: '#26161b',
      accent: '#e8778f',
    },
  },
  {
    id: 'forest-night', name: '森语', group: 'dark', from: 'night',
    navBase: '26, 36, 29', sw: ['#131c16', '#2c3b2f', '#9bd167'],
    v: {
      bg: 'linear-gradient(160deg, #131c16 0%, #0b120e 100%)',
      text: '#e0ecdf', 'text-muted': '#a6b8a8', 'text-muted2': '#86988a', 'text-faint': '#667a6b',
      border: '#1e2a20', 'border-strong': '#2c3b2f', 'border-input': '#26332a',
      surface: '#1a241d', 'surface-2': '#223026', 'surface-3': '#1d2822', ring: '#1a241d',
      accent: '#9bd167',
    },
  },
  {
    id: 'night-flight', name: '夜航', group: 'dark', from: 'night',
    navBase: '27, 31, 51', sw: ['#161a2e', '#2e3350', '#f0b45c'],
    v: {
      bg: 'linear-gradient(160deg, #161a2e 0%, #0f1220 100%)',
      text: '#e4e6f5', 'text-muted': '#aeb2cd', 'text-muted2': '#8f93b0', 'text-faint': '#6d7190',
      border: '#20243a', 'border-strong': '#2e3350', 'border-input': '#282d46',
      surface: '#1b1f33', 'surface-2': '#232840', 'surface-3': '#1f2338', ring: '#1b1f33',
      accent: '#f0b45c',
    },
  },
  {
    id: 'charcoal', name: '炭', group: 'dark', from: 'night',
    navBase: '35, 35, 38', sw: ['#1c1c1e', '#3a3a3e', '#f08a4b'],
    v: {
      bg: 'linear-gradient(160deg, #1c1c1e 0%, #131314 100%)',
      text: '#ececec', 'text-muted': '#b4b4b6', 'text-muted2': '#929294', 'text-faint': '#717173',
      border: '#2a2a2d', 'border-strong': '#3a3a3e', 'border-input': '#333336',
      surface: '#232326', 'surface-2': '#2b2b2f', 'surface-3': '#26262a', ring: '#232326',
      accent: '#f08a4b',
    },
  },
]

/* ---------- 生成 CSS ---------- */
;(function buildThemeCSS() {
  const lines = []
  THEMES.forEach((t) => {
    lines.push('      html[data-theme="' + t.id + '"] {')
    // 继承基底
    if (t.from === 'night') {
      Object.keys(THEME_DARK_BASE).forEach((k) => {
        lines.push('        --' + k + ': ' + THEME_DARK_BASE[k] + ';')
      })
    }
    // 主题自己的覆盖值
    if (t.v) {
      Object.keys(t.v).forEach((k) => {
        lines.push('        --' + k + ': ' + t.v[k] + ';')
      })
    }
    lines.push('        --nav-base: ' + t.navBase + ';')
    lines.push(
      "        --nav-halo: " + (t.group === 'dark' ? '0, 0, 0' : '255, 255, 255') + ';'
    )
    lines.push('      }')
  })
  const style = document.createElement('style')
  style.id = 'theme-gen'
  style.textContent = lines.join('\n')
  document.head.appendChild(style)
  // 暴露给设置页，避免主题列表在两处各写一遍
  window.LW_THEMES = THEMES
})()
