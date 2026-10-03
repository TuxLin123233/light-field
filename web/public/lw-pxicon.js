// 自绘像素图标
//
// 为什么不用 emoji：emoji 是各平台自己渲染的，同一个表情在
// 苹果 / 安卓 / Windows 上长得完全不一样，大小、留白、颜色都不可控，
// 而且**动不了**。这个站本来就是像素画站，图标用像素画最合身。
//
// 每个图标就是一个字符网格 + 一张调色板，和站内家具、头像同一套写法。
// 动起来靠「多帧循环」—— 和帧动画一个路子，不做 CSS 变换，
// 这样在任何地方（canvas / 按钮 / 列表）表现都一致。
//
// 用法：
//   LWIcon.make('brush', 20)            画一张静态的
//   LWIcon.make('brush', 20, {animate:true})   自动播放
//   LWIcon.apply(root)                  把 <i data-px="brush"></i> 全部替换成图标
//   LWIcon.setLevel('off'|'low'|'std'|'rich')

;(function () {
  if (window.LWIcon) return

  var LEVEL_KEY = 'lw-anim-level'
  var LEVELS = ['off', 'low', 'std', 'rich']

  function readLevel() {
    try {
      var v = localStorage.getItem(LEVEL_KEY)
      return LEVELS.indexOf(v) >= 0 ? v : 'std'
    } catch (e) {
      return 'std'
    }
  }
  var level = readLevel()

  /* 把档位写到 <html data-anim-level="..."> 上。
     这样 CSS 也能跟着它开关动画，不用每一层各写一遍 JS 判断。
     off  = 全关（含过渡）
     low  = 只关「无限循环」和装饰性动画，保留必要的入场
     std  = 默认
     rich = 默认 + 图标加快、循环动画多跑一点 */
  function applyLevelAttr(lv) {
    try {
      document.documentElement.setAttribute('data-anim-level', lv)
    } catch (e) {}
  }
  applyLevelAttr(level)

  /* 动画档位决定图标动不动、动多快 */
  function iconAnimates() {
    if (level === 'off' || level === 'low') return false
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    } catch (e) {}
    return true
  }
  function speed() {
    return level === 'rich' ? 0.75 : 1
  }

  /* ================= 调色板 =================
     一份通用色板，所有图标共用。字符 → 颜色。 */
  var C = {
    k: '#2f2a22',
    d: '#5f5245',
    g: '#847864',
    l: '#bfb6a7',
    w: '#ffffff',
    W: '#fbf7ef',
    r: '#f0584a',
    R: '#c0453b',
    o: '#f5a84f',
    y: '#f6d34e',
    Y: '#d89a4a',
    G: '#f9ecc0',
    e: '#45b581',
    E: '#2e7a52',
    c: '#8adcb2',
    b: '#5e91f2',
    B: '#2b5cc0',
    s: '#9ec2ff',
    p: '#a174dc',
    P: '#6c44ad',
    n: '#eda6d6',
    t: '#96714e',
    T: '#5c452d',
    u: '#f58a7a',
    U: '#93322c',
    q: '#f8c184',
    K: '#1e3f80',
    V: '#f9e38a',
    Z: '#a87132',
    J: '#1f5a3a',
    h: '#c39ae8',
    L: '#4f2f7d',
    M: '#b28a63',
    D: '#3f2f1f',
    N: '#c97fb5',
    H: '#f58fb0',
  }

  /* ================= 图标定义 =================
     每项是「一帧或多帧」，帧是字符数组。
     字符含义见上面的 C。'.' 是透明。 */

  var ICONS = {
    brush: {
      base: [
        '..........kk',
        '.........kok',
        '........koyk',
        '.......koyk.',
        '......koyk..',
        '.....koyk...',
        '....kokk....',
        '...kdk......',
        '..kdk.......',
        '.kdk........',
        'kdk.........',
        'kk..........',
      ],
      frames: [
        [
          '..........kk',
          '.........kok',
          '........koyk',
          '.......koyk.',
          '......koyk..',
          '.....koyk...',
          '....kokk....',
          '...kdk......',
          '..kdk.......',
          '.kdk........',
          'kdk.........',
          'kk..........',
        ],
        [
          '..........kk',
          '.........kok',
          '........koyk',
          '.......koyk.',
          '......koyk..',
          '.....koyk...',
          '....kokk....',
          '...kdk......',
          '..kdk.......',
          '.kdk........',
          'kdk.........',
          '............',
        ],
      ],
    },
    dust: {
      frames: [
        [
          '.....V......',
          '....VYV.....',
          '...VYGYV....',
          '..VYGGGYV...',
          'VyGGWGGGYV..',
          '..YYGGGYY...',
          '...YYGYY....',
          '....YYY.....',
          '.....Y......',
          '............',
        ],
        [
          '............',
          '.....V......',
          '....VYV.....',
          '...VYGYV....',
          '..VYGGGYV...',
          '...YYGYY....',
          '....YYY.....',
          '.....Y......',
          '............',
          '............',
        ],
      ],
    },
    house: {
      frames: [
        [
          '.......gg...',
          '......g.g...',
          '.....urur...',
          '....urrrru..',
          '...urrrrrru.',
          '..urrrrrrrru',
          '.MtTtttttTtt',
          '.tt.kkkkk.tt',
          '.tt.kWWWk.tt',
          '.tt.kWkWk.tt',
          '.tt.kWWWk.tt',
          '.ttMkkkkkMtt',
          '.TTTTTTTTTTT',
        ],
        [
          '.....gg.....',
          '......g.....',
          '.....uruu...',
          '....urrrru..',
          '...urrrrrru.',
          '..urrrrrrrru',
          '.MtTtttttTtt',
          '.tt.kkkkk.tt',
          '.tt.kWWWk.tt',
          '.tt.kWkWk.tt',
          '.tt.kWWWk.tt',
          '.ttMkkkkkMtt',
          '.TTTTTTTTTTT',
        ],
      ],
    },
    palette: {
      frames: [
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '............',
          '............',
        ],
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '.....R......',
          '............',
        ],
        [
          '...kkkkkk...',
          '..kWWWWWWk..',
          '.kWWrWWWWWk.',
          '.kWWWWWbWWk.',
          '.kWWWWWWWWk.',
          '.kWWyWWWWWk.',
          '..kWWWWWek..',
          '...kkkkkk...',
          '............',
          '.....u......',
        ],
      ],
    },
    mail: {
      frames: [
        [
          '............',
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWkkWWWWkkWk',
          'kWWkkWWkkWWk',
          'kWWWkkkkWWWk',
          'kWWWWkkWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '............',
          '............',
        ],
        [
          '.........uu.',
          'kkkkkkkkkrrk',
          'kWWWWWWWWrrk',
          'kWkkWWWWkkWk',
          'kWWkkWWkkWWk',
          'kWWWkkkkWWWk',
          'kWWWWkkWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '............',
          '............',
        ],
      ],
    },
    trophy: {
      frames: [
        [
          '..yyyyyyyy..',
          '..YGGGGGGY..',
          '..YGGGGGGY..',
          '..ZGGGGGGZ..',
          '...ZGGGGZ...',
          '....ZGGZ....',
          '.....YY.....',
          '.....YY.....',
          '....yYYy....',
          '..yyZZZZyy..',
          '............',
        ],
        [
          '.VyyyyyyyyV.',
          '.yYGGGGGGYy.',
          '.YYGGGGGGYY.',
          '..ZGGGGGGZ..',
          '...ZGGGGZ...',
          '....ZGGZ....',
          '.....YY.....',
          '.....YY.....',
          '....yYYy....',
          '..yyZZZZyy..',
          '............',
        ],
      ],
    },
    chat: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWWWWWWWWWk',
          'kWWbbWWWWWWk',
          'kWbbbbWWWWWk',
          'kWWbbWWWWWWk',
          'kWWWWWWWWWWk',
          'kkkkkkkkkkkk',
          '.....kk.....',
          '....kk......',
        ],
      ],
    },
    gear: {
      frames: [
        [
          '....k..k....',
          '...kgkkgk...',
          '..kgggggggk.',
          '.kgggkkkggk.',
          'kgggkWWWkggk',
          'kggkkWWWkkk.',
          'kggkkWWWkkk.',
          'kgggkWWWkggk',
          '.kgggkkkggk.',
          '..kgggggggk.',
          '...kgkkgk...',
          '....k..k....',
        ],
        [
          '.....kk.....',
          '..k..ggk..k.',
          '.kgkggggkgk.',
          '.kggkkkkggk.',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          'kggkWWWkgggk',
          '.kggkkkkggk.',
          '.kgkggggkgk.',
          '..k..ggk..k.',
          '.....kk.....',
        ],
      ],
    },
    sun: {
      frames: [
        [
          '.....V......',
          '............',
          '...V...V....',
          '....qqq.....',
          '...qoooq....',
          '..qoyoooq...',
          '...YoooY....',
          '....YYY.....',
          '...V...V....',
          '............',
          '.....V......',
        ],
        [
          '............',
          '.....V......',
          '...V.o.V....',
          '....qoq.....',
          '..VqooYq V..',
          '..ooyo oq...',
          '..YYooqY V..',
          '....YoY.....',
          '...V.o.V....',
          '.....Y......',
          '............',
        ],
      ],
    },
    map: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWcWcWWWWWk',
          'kWcWcWcWWWWk',
          'kWWcWcWWWWWk',
          'kWWWWWWWcWWk',
          'kWWWWWWcWcWk',
          'kWWWWWWWcWWk',
          'kWWWWWWWWWWk',
          'kWWWrWWWWWWk',
          'kkkkkkkkkkkk',
        ],
        [
          'kkkkkkkkkkkk',
          'kWWWWWWWWWWk',
          'kWWcWcWWWWWk',
          'kWcWcWcWWWWk',
          'kWWcWcWWWWWk',
          'kWWWWWWWcWWk',
          'kWWWWWWcWcWk',
          'kWWWWWWWcWWk',
          'kWWWrWWWWWWk',
          'kWWRWrWWWWWk',
          'kkk.RRR.kkkk',
        ],
      ],
    },
    lock: {
      frames: [
        [
          '....gggg....',
          '...g....g...',
          '...g....g...',
          '...g....g...',
          '..yYyyyyYy..',
          '..YYYYYYYY..',
          '..YYYkkYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..ZZZZZZZZ..',
        ],
        [
          '....gggg....',
          '...g....g...',
          '...g....g...',
          '...g....g...',
          '..yYyyyyYy..',
          '..YYYYYYYY..',
          '..YYYkkYYY..',
          '..YYYYYYYY..',
          '..YYYYYYYY..',
          '..ZZZZZZZZ..',
        ],
      ],
    },
    heart: {
      frames: [
        [
          '..uu....uu..',
          '.uRRu..uRRu.',
          'uRRRRuuRRRRu',
          'rRRRRRRRRRRr',
          'RRRRRRRRRRRR',
          '.RRRRRRRRRR.',
          '..RRRRRRRR..',
          '...RRRRRR...',
          '....RRRR....',
          '.....RR.....',
        ],
        [
          '............',
          '..uu....uu..',
          '.uRRu..uRRu.',
          'uRRRRuuRRRRu',
          'rRRRRRRRRRRr',
          'RRRRRRRRRRRR',
          '.RRRRRRRRRR.',
          '..RRRRRRRR..',
          '...RRRUUR...',
          '....RR......',
        ],
      ],
    },
    line: {
      frames: [
        [
          '..........ss',
          '.........sB.',
          '........sB..',
          '.......sB...',
          '......sB....',
          '.....sB.....',
          '....sB......',
          '...sB.......',
          '..sB........',
          '.sB.........',
        ],
        [
          '..........ss',
          '.........s..',
          '........s...',
          '.......s....',
          '......s.....',
          '.....s......',
          '....s.......',
          '...s........',
          '..s.........',
          '.sB.........',
        ],
      ],
    },
    eraser: {
      frames: [
        [
          '............',
          '......WWWW..',
          '.....WnnnnW.',
          '....WnnnnnnW',
          '...WnnnnnnN.',
          '..WnnnnnNN..',
          '..nnnnNN....',
          '..NNNN......',
          '............',
          '............',
        ],
        [
          '............',
          '.......WWWW.',
          '......WnnnnW',
          '.....WnnnnnN',
          '....WnnnnnN.',
          '...WnnnnNN..',
          '...nnnNN....',
          '...NNN......',
          '............',
          '............',
        ],
      ],
    },
    fill: {
      frames: [
        [
          '....ssss....',
          '...s....s...',
          '..s......s..',
          '.s........s.',
          '.BssssssssB.',
          '..B......B..',
          '...ssssss...',
          '......bb....',
          '.....sBBs...',
          '............',
        ],
        [
          '....ssss....',
          '...s....s...',
          '..s......s..',
          '.s........s.',
          '.BssssssssB.',
          '..B......B..',
          '...ssssss...',
          '......bb....',
          '.....sBbs...',
          '.......B....',
        ],
      ],
    },
    picker: {
      frames: [
        [
          '.........kk.',
          '........kggk',
          '.......kggk.',
          '......kggk..',
          '.....kggk...',
          '....kbbk....',
          '...kbbk.....',
          '..kbBk......',
          '.kbk........',
          '..k.........',
        ],
        [
          '.........kk.',
          '........kggk',
          '.......kggk.',
          '......kggk..',
          '.....kggk...',
          '....kbbk....',
          '...kbbk.....',
          '..kbBk......',
          '.kBk........',
          '.B..........',
        ],
      ],
    },
    hand: {
      frames: [
        [
          '...W.W.W....',
          '...n.n.n....',
          '...n.n.n....',
          '..WnWnWnW...',
          '..nWWWWWn...',
          '..nWWWWWn...',
          '.WnWWWWWnW..',
          '.NWWWWWWWN..',
          '..NWWWWWN...',
          '...NNNNN....',
        ],
        [
          '...W.W.W....',
          '...n.n.n....',
          '..WnWnWnW...',
          '..nWWWWWn...',
          '..nWWWWWn...',
          '.WnWWWWWnW..',
          '.NWWWWWWWN..',
          '..NWWWWWN...',
          '...NNNNN....',
          '............',
        ],
      ],
    },
    move: {
      frames: [
        [
          '.....s......',
          '....sbs.....',
          '...sBbBs....',
          '.....b......',
          '..s..b..s...',
          '.sbssbssbs..',
          '..B..b..B...',
          '.....b......',
          '...ssbss....',
          '....BBB.....',
        ],
        [
          '.....s......',
          '....sbs.....',
          '...sBbBs....',
          '.....b......',
          '..s..b..s...',
          '.sbssbssbs..',
          '..B..b..B...',
          '.....b......',
          '....sbs.....',
          '.....B......',
        ],
      ],
    },
    arrowRight: {
      frames: [
        [
          '............',
          '............',
          '.....s......',
          '......s.....',
          '.......s....',
          'sssssssbss..',
          '.......B....',
          '......s.....',
          '.....s......',
          '............',
        ],
        [
          '............',
          '............',
          '............',
          '......s.....',
          '.......s....',
          '.ssssssbsss.',
          '.......B....',
          '......s.....',
          '............',
          '............',
        ],
      ],
    },
    arrowLeft: {
      frames: [
        [
          '............',
          '............',
          '......s.....',
          '.....s......',
          '....s.......',
          '..ssbsssssss',
          '....B.......',
          '.....s......',
          '......s.....',
          '............',
        ],
        [
          '............',
          '............',
          '............',
          '.....s......',
          '....s.......',
          '.sssbssssss.',
          '....B.......',
          '.....s......',
          '............',
          '............',
        ],
      ],
    },
    arrowDown: {
      frames: [
        [
          '.....s......',
          '.....b......',
          '.....b......',
          '.....b......',
          '.....b......',
          '.....b......',
          '..sssbsss...',
          '...BbbbB....',
          '....BbB.....',
          '.....B......',
        ],
        [
          '............',
          '.....s......',
          '.....b......',
          '.....b......',
          '.....b......',
          '..sssbsss...',
          '...BbbbB....',
          '....BbB.....',
          '.....B......',
          '............',
        ],
      ],
    },
    star: {
      frames: [
        [
          '.....V......',
          '.....y......',
          '....VYV.....',
          'VyyyYYYyyyV.',
          '.YYYYYYYYY..',
          '..yYYZYYy...',
          '.VYYY.YYYV..',
          '.yZY...YYy..',
          'VY......YY..',
          '............',
        ],
        [
          '............',
          '.....V......',
          '....VYV.....',
          '.VyyYYYyyyV.',
          '..YYYYYYYY..',
          '...yYYZYy...',
          '..VYYY.YYyV.',
          '..yZY...YYy.',
          '.VY......YY.',
          '............',
        ],
      ],
    },
    check: {
      frames: [
        [
          '............',
          '............',
          '............',
          '..........cc',
          '.........cE.',
          '........cE..',
          '.......cE...',
          '..cc..cE....',
          '...EccE.....',
          '....EE......',
        ],
        [
          '............',
          '............',
          '..........cc',
          '.........cE.',
          '........cE..',
          '.......cE...',
          '..cc..cE....',
          '...EccE.....',
          '....EE......',
          '............',
        ],
      ],
    },
    question: {
      frames: [
        [
          '...ssss.....',
          '..sB..Bs....',
          '.sB....Bs...',
          '........bs..',
          '.......sB...',
          '......sB....',
          '.....sB.....',
          '............',
          '.....ss.....',
          '.....BB.....',
        ],
        [
          '............',
          '...ssss.....',
          '..sB..Bs....',
          '.sB....Bs...',
          '........bs..',
          '.......sB...',
          '......sB....',
          '.....sb.....',
          '.....BB.....',
          '............',
        ],
      ],
    },
    pencil: {
      frames: [
        [
          '.........VV.',
          '........VYYV',
          '.......VYYY.',
          '......VYYY..',
          '.....VYYY...',
          '....VYYY....',
          '...VYYY.....',
          '..VYYY......',
          '.VYZY.......',
          'VYY........',
        ],
        [
          '..........V.',
          '.........VYV',
          '........VYY.',
          '.......VYY..',
          '......VYY...',
          '.....VYY....',
          '....VYY.....',
          '...VYY......',
          '..VYY.......',
          '.VYY........',
        ],
      ],
    },
    trash: {
      frames: [
        [
          '...gggg.....',
          '..gggggg....',
          '.gggggggg...',
          '..kkkkkk....',
          '..kWWWWk....',
          '..kWkkWk....',
          '..kWWWWk....',
          '..kWWWWk....',
          '..kkkkkk....',
          '............',
        ],
        [
          '...gggg.....',
          '..gggggg....',
          '.gggggggg...',
          '............',
          '..kkkkkk....',
          '..kWWWWk....',
          '..kWkkWk....',
          '..kWWWWk....',
          '..kkkkkk....',
          '............',
        ],
      ],
    },
    gift: {
      frames: [
        [
          '...uu.uu....',
          '..urrurru...',
          '.urrrrrrru..',
          'uRrrrrrrrRu.',
          '..yYYZYYy...',
          '..Yyy.yyY...',
          '..yYYyYYy...',
          '..yYYYYYy...',
          '..yYYYYYy...',
          '..YYYYYYY...',
        ],
        [
          '...uu.uu....',
          '..urrurru...',
          '.VyrrrrryV..',
          'uRrrrrrrrRu.',
          '..yYYZYYy...',
          '..Yyy.yyY...',
          '..yYYyYYy...',
          '..yYYYYYy...',
          '..yYYYYYy...',
          '..YYYYYYY...',
        ],
      ],
    },
    medal: {
      frames: [
        [
          '..ss....ss..',
          '..bb....bb..',
          '..bb....bb..',
          '..Bbs..sbB..',
          '...YYyyYY...',
          '..yYyYYyYy..',
          '..YYYYYYYY..',
          '..ZYyYYyYZ..',
          '...ZYYYYZ...',
          '....ZZZZ....',
        ],
        [
          '...ss..ss...',
          '...bb..bb...',
          '...bb..bb...',
          '..sbb..bbs..',
          '...YYyyYY...',
          '..yYyYYyYy..',
          '..YYYYYYYY..',
          '..ZYyYYyYZ..',
          '...ZYYYYZ...',
          '....ZZZZ....',
        ],
      ],
    },
    shield: {
      frames: [
        [
          '.ssssssssss.',
          '.bssssssssb.',
          '.bsbssssbsb.',
          '.bssbbbbssb.',
          '.bssbbbbssb.',
          '.Bsssbbsssb.',
          '..BsssssssB.',
          '...BsssssB..',
          '....BsssB...',
          '.....BBB....',
        ],
        [
          '.ssssssssss.',
          '.bwwwwwwwwb.',
          '.bwbwwwwbwb.',
          '.bwwbbbbwwb.',
          '.bwwbbbbwwb.',
          '.Bwwwbbwwwb.',
          '..BwwwwwwwB.',
          '...BwwwwwB..',
          '....BwwwB...',
          '.....BBB....',
        ],
      ],
    },
    undo: {
      frames: [
        [
          '............',
          '....ssss....',
          '...sB..Bs...',
          '..sB....Bs..',
          '.sB......B..',
          '.b........s.',
          '.Bs......sB.',
          '..BssssssB..',
          '............',
          '............',
        ],
        [
          '............',
          '...ssss.....',
          '..sB..Bs....',
          '.sB....Bs...',
          'sB......B...',
          'b........s..',
          'Bs......sB..',
          '.BssssssB...',
          '............',
          '............',
        ],
      ],
    },
    film: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'k.k.k.k.k.kk',
          'kwbsbsbsbwWk',
          'kWbWWWWWbWWk',
          'kWbbbbbbbWWk',
          'kWWWWWWWWWWk',
          'kWcccccccWWk',
          'kWcWWWWWcWWk',
          'k.k.k.k.k.kk',
          'kkkkkkkkkkkk',
        ],
        [
          'kkkkkkkkkkkk',
          'kk.k.k.k.k.k',
          'kWsbsbsbsWwk',
          'kWbWWWWWbWWk',
          'kWbbbbbbbWWk',
          'kWWWWWWWWWWk',
          'kWcccccccWWk',
          'kWeWWWWWeWWk',
          'kk.k.k.k.k.k',
          'kkkkkkkkkkkk',
        ],
      ],
    },
    butterfly: {
      frames: [
        [
          '............',
          '.hh.....hh..',
          'hpph...hpph.',
          'Pppph.hpppP.',
          '.PPpphppPP..',
          '...ppppp....',
          '.hhppPpphh..',
          'hpppP.Pppph.',
          'PppP...PppP.',
          '.PP.....PP..',
        ],
        [
          '............',
          'hh.......hh.',
          '.phh...hhp..',
          '.Ppph.hppP..',
          '..PpphppP...',
          '...ppppp....',
          '..hppPpph...',
          '.hppP.Ppph..',
          '.pPP...PPp..',
          'hP.......Ph.',
        ],
      ],
    },
    dice: {
      frames: [
        [
          'kkkkkkkk....',
          'kWWWWWWk....',
          'kWkWWkWk....',
          'kWWWWWWk....',
          'kWWkkWWk....',
          'kWWWWWWk....',
          'kWWkWWkk....',
          'kkkkkkkk....',
          '............',
          '............',
        ],
        [
          'kkkkkkkk....',
          'kWkWWkWk....',
          'kWWWWWWk....',
          'kWWkWWkk....',
          'kWWWWWWk....',
          'kWkWWkWk....',
          'kWWWWWWk....',
          'kkkkkkkk....',
          '............',
          '............',
        ],
      ],
    },
    download: {
      frames: [
        [
          '....ssss....',
          '....b..b....',
          '....b..b....',
          '....BssB....',
          '............',
          '...ssssss...',
          '....BbbB....',
          '.....BB.....',
          '............',
          '..ssssssss..',
        ],
        [
          '............',
          '....ssss....',
          '....b..b....',
          '....b..b....',
          '....bssb....',
          '...sbbbbs...',
          '....BbbB....',
          '.....bb.....',
          '..sssBBsss..',
          '............',
        ],
      ],
    },
    cake: {
      frames: [
        [
          '.....V......',
          '....VoV.....',
          '.....t......',
          '..WWWnWW....',
          '.WWnWnWnW...',
          '.nnnnnnnn...',
          '.nnnnnnnn...',
          'WNNNNNNNNW..',
          '............',
          '............',
        ],
        [
          '.....q......',
          '....VoV.....',
          '.....t......',
          '..WWWnWW....',
          '.WWnWnWnW...',
          '.nnnnnnnn...',
          '.nnnnnnnn...',
          'WNNNNNNNNW..',
          '............',
          '............',
        ],
      ],
    },
    announce: {
      frames: [
        [
          '............',
          '......VV....',
          '.....Vyy....',
          '..VVVyyy....',
          'VVyyyyyyV...',
          'YYyyyyyyY...',
          '..YYYyyy....',
          '.....Yyy....',
          '......YY....',
          '............',
        ],
        [
          '............',
          '......VV....',
          '.....Vyy....',
          '..VVVyyy.s..',
          'VVyyyyyyVb.s',
          'YYyyyyyyYb.B',
          '..YYYyyy.B..',
          '.....Yyy....',
          '......YY....',
          '............',
        ],
      ],
    },
    handshake: {
      frames: [
        [
          '............',
          '..MM........',
          '.MnnM.MMM...',
          'MnnnnMtnnM..',
          '.Tnnnnnnnt..',
          '..Tnnnnnnt..',
          '...TTnnnTT..',
          '.....TTT....',
          '............',
          '............',
        ],
        [
          '............',
          '..MM........',
          '.MnnM.MMM...',
          'MnnnnMtnnM..',
          '.Tnnnnnnnt..',
          '..Tnnnnnnt..',
          '...TtnnNTT..',
          '....TTT.....',
          '............',
          '............',
        ],
      ],
    },
    party: {
      frames: [
        [
          '...u...V....',
          '..u.u.V.V...',
          '...u...V....',
          '.....s......',
          '..sssBsss...',
          '...B...B....',
          '..s.....s...',
          '.g.......g..',
          '............',
          '............',
        ],
        [
          '..u.....V...',
          '...u...V....',
          '..u...V.V...',
          '.....s......',
          '..sssBsss...',
          '...B...B....',
          '..s.....s...',
          '.g.......g..',
          '............',
          '............',
        ],
      ],
    },
    link: {
      frames: [
        [
          '............',
          '..ss....ss..',
          '.s..s..s..s.',
          '.B..B..B..B.',
          '..ss.ss.ss..',
          '...bsbbsb...',
          '..sB.BB.Bs..',
          '.s..s..s..s.',
          '.B..B..B..B.',
          '..ss....ss..',
        ],
        [
          '............',
          '..ss....ss..',
          '.s..s..s..s.',
          '.B..bssbs.B.',
          '..ssbbbbbs..',
          '...bbbbbb...',
          '..sbbbbbBs..',
          '.s.BbBBb..s.',
          '.B..B..B..B.',
          '..ss....ss..',
        ],
      ],
    },
    raise: {
      frames: [
        [
          '...WW.......',
          '..WnnW......',
          '...nn.......',
          '..MttM......',
          '.MttttM.....',
          '.TttttT.....',
          '..tTTt......',
          '..t..t......',
          '..t..t......',
          '.MT..TM.....',
        ],
        [
          '...WW.......',
          '..WnnW......',
          '...nn.......',
          '..MttM......',
          '.MttttM.....',
          '.TttttT.....',
          '..tTTt......',
          '..t..t......',
          '.MT..TM.....',
          'MT....TM....',
        ],
      ],
    },
    town: {
      frames: [
        [
          '...uu.......',
          '..urru......',
          '.urrrru.....',
          '.tTttTt.....',
          '.t.kk.t.....',
          '.t.kW.t.....',
          '.TMttMT.....',
          '...cc.......',
          '..wccw......',
          '.weeeew.....',
        ],
        [
          '....uu......',
          '...urru.....',
          '..urrrru....',
          '..tTttTt....',
          '..t.kk.t....',
          '..t.kW.t....',
          '..TMtTMT....',
          '...cc.......',
          '..wccw......',
          '.weeeew.....',
        ],
      ],
    },
    bolt: {
      frames: [
        [
          '.....VV.....',
          '....VY......',
          '...Vy.......',
          '..VYYVVV....',
          '.....yY.....',
          '....VY......',
          '...VY.......',
          '..VY........',
          '............',
          '............',
        ],
        [
          '.....VV.....',
          '....VY......',
          '...Vy.......',
          '..VYYVVV....',
          '.....yY.....',
          '....VY......',
          '...VY.......',
          '..VY........',
          '.VY........',
          '............',
        ],
      ],
    },
    flag: {
      frames: [
        [
          'uu..........',
          'rruuuuuu....',
          'rr.rr..ru...',
          'rr.rr..rR...',
          'rruRRuuR....',
          'rr..........',
          'rr..........',
          'rr..........',
          'RR..........',
          '............',
        ],
        [
          'uu..........',
          '.ruuuuuuu...',
          'ur..rr.rr...',
          'Rr..rr.rr...',
          '.ruuRRuRR...',
          'ur..........',
          'rr..........',
          'rr..........',
          'RR..........',
          '............',
        ],
      ],
    },
    ban: {
      frames: [
        [
          '...uuuuuu...',
          '..uR....Ru..',
          '.uR.uu...Ru.',
          '.r...Ru...r.',
          'ur....Ru..ru',
          'rr.....Ru.rr',
          'Rr......RurR',
          '.r........r.',
          '.Ru......uR.',
          '..Ru....uR..',
        ],
        [
          '...uuuuuu...',
          '..uR....Ru..',
          '.uR......ru.',
          '.r.......rr.',
          'ur......uRru',
          'rr.....uR.rr',
          'Rr....uR..rR',
          '.r...uR...r.',
          '.Ru.uR...uR.',
          '..Ru....uR..',
        ],
      ],
    },
    frame: {
      frames: [
        [
          'kkkkkkkkkkkk',
          'ktttttttttk.',
          'ktWWWWWWWtk.',
          'ktWbbbWWWtk.',
          'ktWbbbbWWtk.',
          'ktWWbbbWWtk.',
          'ktWWWWWWWtk.',
          'ktWWWWggWtk.',
          'ktttttttttk.',
          'kkkkkkkkkkkk',
        ],
        [
          'kkkkkkkkkkkk',
          'ktttttttttk.',
          'ktWWWWWWWtk.',
          'ktWWWbbbWtk.',
          'ktWWWbbbbtk.',
          'ktWWWbbbWtk.',
          'ktWWWWWWWtk.',
          'ktWWWWggWtk.',
          'ktttttttttk.',
          'kkkkkkkkkkkk',
        ],
      ],
    },
    user: {
      frames: [
        [
          '...kkkkkk...',
          '..knnnnnnk..',
          '..knkkkknk..',
          '..knkWWknk..',
          '..knkkkknk..',
          '..knnkknnk..',
          '...kkkkkk...',
          '..kkkkkkkk..',
          '.kbbbbbbbbk.',
          'kbbbbbbbbbbk',
          'kbbbbbbbbbbk',
          'kkkkkkkkkkkk',
        ],
        [
          '............',
          '...kkkkkk...',
          '..knnnnnnk..',
          '..knkkkknk..',
          '..knkWWknk..',
          '..knkkkknk..',
          '..knnkknnk..',
          '...kkkkkk...',
          '..kkkkkkkk..',
          '.kbbbbbbbbk.',
          'kbbbbbbbbbbk',
          'kkkkkkkkkkkk',
        ],
      ],
    },
    fire: {
      frames: [
        [
          '.....q......',
          '....qyq.....',
          '...qyyRq....',
          '..qyyRRo....',
          '..oyRRRo....',
          '.qyRRRRRq...',
          '.oyRRRRRo...',
          '.YRRRRRRY...',
          '..YRRRRY....',
          '...YYYY.....',
        ],
        [
          '....q.......',
          '...qyq......',
          '...oyyq.....',
          '..qyyRoq....',
          '..oyRRRo....',
          '.qyRRRRRq...',
          '.oyRRRRRo...',
          '.YRRRRRRY...',
          '..YRRRRY....',
          '...YYYY.....',
        ],
      ],
    },
    /* ---------- 小镇入口的大图标 ----------
       网格比普通图标大一圈（14 宽），因为要放在大卡片上。
       动画也做得明显一些：烟在飘、汤在滚、火在跳。 */

    /* 小屋：烟囱冒烟，窗户亮着灯 */
    home: {
      frames: [
        [
          '..........gg..',
          '.........g..g.',
          '..........gg..',
          '.......rrrrr..',
          '......rurrrrr.',
          '.....rurrrrrr.',
          '....rurrrrrrr.',
          '...rrrrrrrrrr.',
          '...MtTtttttTt.',
          '...tt.kkkkk.tt',
          '...tt.kGGGk.tt',
          '...tt.kGkGk.tt',
          '...tt.kGGGk.tt',
          '...ttMkkkkkMtt',
          '...TTTTTTTTTT.',
        ],
        [
          '.........gg...',
          '..........gg..',
          '.........g..g.',
          '.......rrrrr..',
          '......rurrrrr.',
          '.....rurrrrrr.',
          '....rurrrrrrr.',
          '...rrrrrrrrrr.',
          '...MtTtttttTt.',
          '...tt.kkkkk.tt',
          '...tt.kGGGk.tt',
          '...tt.kGkGk.tt',
          '...tt.kGGGk.tt',
          '...ttMkkkkkMtt',
          '...TTTTTTTTTT.',
        ],
      ],
    },

    /* 家具商店：遮阳棚的条纹在流动，柜台上摆着货 */
    shop: {
      frames: [
        [
          '..............',
          '..rwwrwwrwwr..',
          '..rwwrwwrwwr..',
          '..rwwrwwrwwr..',
          '..MtTtttttTtM.',
          '..t..........t',
          '..t.b...y..c.t',
          '..t..........t',
          '..MtTtttttTtM.',
          '..t..........t',
          '..t...YYYY...t',
          '..t..........t',
          '..MtTtttttTtM.',
          '..T..........T',
          '..T..........T',
        ],
        [
          '..............',
          '..wwrwwrwwrww.',
          '..wwrwwrwwrww.',
          '..wwrwwrwwrww.',
          '..MtTtttttTtM.',
          '..t..........t',
          '..t.y...c..b.t',
          '..t..........t',
          '..MtTtttttTtM.',
          '..t..........t',
          '..t...YYYY...t',
          '..t..........t',
          '..MtTtttttTtM.',
          '..T..........T',
          '..T..........T',
        ],
      ],
    },

    /* 卡牌屋：三张牌轮流传上来 */
    cardgame: {
      frames: [
        [
          '..............',
          '........kkkk..',
          '.......kWWWWk.',
          '......kWrrWWk.',
          '......kWrrWWk.',
          '.....kWWWWWWk.',
          '.....kWWbbWWk.',
          '....kWWWWWWWk.',
          '....kWWyyWWWk.',
          '....kWWWWWWWk.',
          '.....kkkkkkk..',
          '..............',
          '..............',
          '..............',
          '..............',
        ],
        [
          '..............',
          '..............',
          '.......kkkk...',
          '......kWWWWk..',
          '.....kWrrWWk..',
          '.....kWrrWWk..',
          '....kWWWWWWk..',
          '....kWWbbWWk..',
          '...kWWWWWWWk..',
          '...kWWyyWWWk..',
          '...kWWWWWWWk..',
          '....kkkkkkk...',
          '..............',
          '..............',
          '..............',
        ],
      ],
    },

    /* 大锅饭：汤在滚，火在跳，热气往上飘 */
    cooking: {
      frames: [
        [
          '..............',
          '.....gg..gg...',
          '....g..gg..g..',
          '.....gg..gg...',
          '..............',
          '..kkkkkkkkkk..',
          '.kWWWWWWWWWWk.',
          '.kWrrWWyyWWWk.',
          '.kWWWyyWWrrWk.',
          '.kWyyWWWWWWWk.',
          '..kkkkkkkkkk..',
          '....o..o..o...',
          '...oRo.oRo.oR.',
          '...oRo.oRo.oR.',
          '....o..o..o...',
        ],
        [
          '.....gg..gg...',
          '....g..gg..g..',
          '.....gg..gg...',
          '..............',
          '..............',
          '..kkkkkkkkkk..',
          '.kWWWWWWWWWWk.',
          '.kWyyWWrrWWWk.',
          '.kWWWrrWWyyWk.',
          '.kWrrWWWWWWWk.',
          '..kkkkkkkkkk..',
          '...o..o..o....',
          '..oRo.oRo.oR..',
          '..oRo.oRo.oR..',
          '...o..o..o....',
        ],
      ],
    },

    /* 跑酷：小人在跑，腿在动 */
    running: {
      frames: [
        [
          '..............',
          '..............',
          '.......nn.....',
          '......nnnn....',
          '......nk n....',
          '......nnnn....',
          '.....bbbbb....',
          '....bbbbbb....',
          '...b.bbbb.b...',
          '...b.bbbb.b...',
          '.....bbbb.....',
          '.....b..b.....',
          '....bb...b....',
          '...bb.....b...',
          '..bb.......b..',
        ],
        [
          '..............',
          '..............',
          '.......nn.....',
          '......nnnn....',
          '......nk n....',
          '......nnnn....',
          '.....bbbbb....',
          '....bbbbbb....',
          '...b.bbbb.b...',
          '...b.bbbb.b...',
          '.....bbbb.....',
          '....b....b....',
          '...bb.....b...',
          '..bb......bb..',
          '.bb........bb.',
        ],
      ],
    },

    /* 冒险世界：一个俯视的方块地形，云影在地面上移动 */
    adventuring: {
      frames: [
        [
          '..............',
          '..JJJJ..JJJJ..',
          '.JccccJJccccJ.',
          '.JcJJccJJccJJ.',
          'JJJJJJJJJJJJJJ',
          'ccccJJJJJJcccc',
          'cJJcJJJJJJcJJc',
          'ccccJJJJJJcccc',
          'ccccJJssJJcccc',
          'ccccJJssJJcccc',
          'JJJJJJJJJJJJJJ',
          '.ssss..JJJJJJ.',
          '.ssss..JJJJJJ.',
          '.MMMM..MMMMMM.',
          '.TTTT..TTTTTT.',
        ],
        [
          '..............',
          '..JJJJ..JJJJ..',
          '.JccccJJccccJ.',
          '.JcJJccJJccJJ.',
          'JJJJJJJJJJJJJJ',
          '.JJJJJJJJJJJJJ',
          '.cJJcJJJJJJcJc',
          '.JJJJJJJJJJJJJ',
          '.JJJJJJssJJJJJ',
          '.JJJJJJssJJJJJ',
          'JJJJJJJJJJJJJJ',
          '.ssss..JJJJJJ.',
          '.MMMM..JJJJJJ.',
          '.MMMM..MMMMMM.',
          '.TTTT..TTTTTT.',
        ],
      ],
    },

    /* ---------- 卡牌屋 / 大锅饭 用的角色和食物 ----------
       原来这 15 张是 DOTOWN 的外部素材。DOTOWN 的条款允许用在游戏里，
       但**禁止再配布素材本身** —— 而它们跟着公开仓库一起发布了，
       性质上更接近「再配布」。所以照着自己的像素风格重画了一套，
       版权问题一次性归零，风格也和站里其它图标统一了。

       都画成 14×14，因为卡片上要放到 40px 左右。 */

    /* --- 小妖（卡牌屋的 10 层）--- */
    mon_pigeon: { frames: [[
      '..............','....gg..gg....','...ggg..ggg...','..gggggggggg..',
      '..ggllggllgg..','..gggkggkggg..','..gggggggggg..','...gggggggg...',
      '....gggggg....','...gggggggg...','..gggggggggg..','..gg..gg..gg..',
      '..g....g...g..','..............',
    ]] },
    mon_abu: { frames: [[
      '..............','.....pppp.....','....pppppp....','...pppppppp...',
      '..ppllppllpp..','..pppkppkppp..','..pppppppppp..','..pppkkkkppp..',
      '...pppppppp...','....pppppp....','...pppppppp...','..ppp.pp.ppp..',
      '..pp...p...pp.','..............',
    ]] },
    mon_hound: { frames: [[
      '..............','..tt......tt..','..tttt..tttt..','..tttttttttt..',
      '..ttllttlltt..','..tttkttkttt..','..tttttttttt..','..ttkkkkkktt..',
      '..tttttttttt..','...tttttttt...','...tttttttt...','..ttt.tt.ttt..',
      '..tt...t...tt.','..............',
    ]] },
    mon_cat: { frames: [[
      '..k........k..','..kk......kk..','..kkkkkkkkkk..','..kwwwwwwwwk..',
      '..kwllwwllwk..','..kwkwwwwkwk..','..kwwwwwwwwk..','..kwwkwwkwwk..',
      '..kwwwwwwwwk..','..kwwwwwwwwk..','...kwwwwwwk...','...kkkkkkkk...',
      '..kk......kk..','..............',
    ]] },
    mon_monkey: { frames: [[
      '..kk......kk..','..kbb....bbk..','..kbbbbbbbbk..','..kbqqqqqqbk..',
      '..kqllqqllqk..','..kqkqqqqkqk..','..kqqqqqqqqk..','..kqqkkkkqqk..',
      '..kqqqqqqqqk..','...kqqqqqqk...','...kqqqqqqk...','..kqq.qq.qqk..',
      '..kq...q...qk.','..............',
    ]] },
    mon_king: { frames: [[
      '..y..y..y..y..','..yyyyyyyyyy..','..YbbbbbbbbY..','..YbqqqqqqbY..',
      '..YqllqqllqY..','..YqkqqqqkqY..','..YqqqqqqqqY..','..YqqkkkkqqY..',
      '..YqqqqqqqqY..','...YqqqqqqY...','...YqqqqqqY...','..Yqq.qq.qqY..',
      '..Yq...q...qY.','..............',
    ]] },
    mon_frenzy: { frames: [[
      '..rr......rr..','..rRRR..RRRr..','..rRRRRRRRRr..','..rRqqqqqqRr..',
      '..rqllqqllqr..','..rqkqqqqkqr..','..rqqqqqqqqr..','..rqqkkkkqqr..',
      '..rqqqqqqqqr..','...rqqqqqqr...','...rqqqqqqr...','..rqq.qq.qqr..',
      '..rq...q...qr.','..............',
    ]] },
    mon_ghost: { frames: [[
      '..............','....ssssss....','...ssssssss...','..ssllssllss..',
      '..ssskssksss..','..ssssssssss..','..ssskkkksss..','..ssssssssss..',
      '..ssssssssss..','..ssssssssss..','..ssssssssss..','..s.sss.sss.s.',
      '..s..s...s..s.','..............',
    ]] },
    mon_guard: { frames: [[
      '....UUUUUU....','...UUUUUUUU...','..UUllUUllUU..','..UUkUUUkUUU..',
      '..UUUUUUUUUU..','..UUUkkkkUUU..','..UUUUUUUUUU..','..UUUUUUUUUU..',
      '...UUUUUUUU...','...UUUUUUUU...','..UUU.UU.UUU..','..UU...U...UU.',
      '..UU...U...UU.','..............',
    ]] },
    mon_doom: { frames: [[
      '..kk......kk..','..kLL....LLk..','..kLLLLLLLLk..','..kLccccccLk..',
      '..kcll cclcLk.','..kckcccckcLk.','..kccccccccLk.','..kcckkkkccLk.',
      '..kccccccccLk.','...kcccccck...','...kcccccck...','..kcc.cc.cck..',
      '..kc...c...ck.','..............',
    ]] },

    /* --- 餐品（大锅饭的 5 道）--- */
    food_mushroom: { frames: [[
      '..............','.....rrrr.....','...rrrrrrrr...','..rrwrrrrwrr..',
      '.rrrrrwrrrrrr.','.rrrrrrrrrrrr.','..wwwwwwwwww..','...wwwwwwww...',
      '...wwwwwwww...','...wwwwwwww...','...wwwwwwww...','...wwwwwwww...',
      '..wwwwwwwwww..','..............',
    ]] },
    food_cake: { frames: [[
      '..............','......y.......','.....yoy......','......t.......',
      '......t.......','..nnnnnnnnnn..','.nwnwnwnwnwnn.','.nnnnnnnnnnnn.',
      '.nrnrnrnrnrnn.','.nnnnnnnnnnnn.','.nwnwnwnwnwnn.','.nnnnnnnnnnnn.',
      'nnnnnnnnnnnnnn','..............',
    ]] },
    food_ice: { frames: [[
      '..............','......s.......','.....sss......','....sssss.....',
      '...sssssss....','..ssswwssss...','..sswwwwssss..','..ssswwsssss..',
      '..sssssssss...','...ssssssss...','....ssssss....','.....ssss.....',
      '......ss......','..............',
    ]] },
    food_bun: { frames: [[
      '..............','....wwwwww....','..wwwwwwwwww..','.wwwwwwwwwwww.',
      '.wwwwwwwwwwww.','wwwwwwwwwwwwww','wwwwwwwwwwwwww','.wwwwwwwwwwww.',
      '.wwwwwwwwwwww.','..wwwwwwwwww..','...wwwwwwww...','....wwwwww....',
      '.....wwww.....','..............',
    ]] },
    food_bento: { frames: [[
      '..............','kkkkkkkkkkkkkk','kwwwwwwwwwwwwk','kwrrrwyyywwwwk',
      'kwrrrwyyywwwwk','kwwwwwwwwwwwwk','kwwwwwwwwwwwwk','kyyywwgggwwwwk',
      'kyyywwgggwwwwk','kwwwwwwwwwwwwk','kwwwwwwwwwwwwk','kwrrrwwyyywwwk',
      'kkkkkkkkkkkkkk','..............',
    ]] },

  }

  /* ================= 绘制 ================= */

  function drawFrame(ctx, frame, s, ox, oy) {
    for (var y = 0; y < frame.length; y++) {
      var row = frame[y]
      for (var x = 0; x < row.length; x++) {
        var ch = row.charAt(x)
        if (ch === '.' || ch === ' ') continue
        var col = C[ch]
        if (!col) continue
        ctx.fillStyle = col
        ctx.fillRect(ox + x * s, oy + y * s, s, s)
      }
    }
  }

  /* 每个 canvas 一个独立定时器，存起来好统一停掉 */
  var live = []

  /* 「点一下播一轮」的图标。
     用 document 级事件委托，而不是给每个图标找祖先绑监听 ——
     站内图标外面套什么的都有（button / a / label / 什么都不套），
     逐个找祖先容易漏。委托只需要绑一次，什么都盖得住。 */
  var PRESSERS = []
  var pressBound = false
  function bindPressDelegate() {
    if (pressBound) return
    pressBound = true
    var fire = function (e) {
      var t = e.target
      if (!t || t.nodeType !== 1) return
      for (var i = PRESSERS.length - 1; i >= 0; i--) {
        var p = PRESSERS[i]
        var cv = p.cv
        if (!cv || !cv.isConnected) continue
        var host = cv.parentNode
        /* 三种情况都算命中：
             点在图标自己身上
             点在包着图标的那个按钮/链接上
             点在按钮里的文字上（图标和文字并排时很常见） */
        var hit = host && (host === t || host.contains(t) || (t.contains && t.contains(host)))
        if (!hit) continue
        p.playOnce()
        break
      }
    }
    document.addEventListener('pointerdown', fire, true)
    document.addEventListener('click', fire, true)
  }

  function stopAll() {
    for (var i = 0; i < live.length; i++) {
      var p = live[i]
      try {
        if (p._poll) clearInterval(p._poll)
        if (p._mo) p._mo.disconnect()
        if (p.stop) p.stop()
        else if (p.timer) clearInterval(p.timer)
      } catch (e) {}
    }
    live.length = 0
  }

  /* ================= 动画由什么驱动 =================
     ★ 不是所有图标都该一直动。
     一直动有三个坏处：费电、低端机掉帧、视觉上很吵
     （一屏十几个东西都在动，反而看不出重点）。

     所以按用途分开：
       idle   一直播 —— 只给「氛围型」的用（光尘星、天气太阳）
       active 宿主带 .on/.active/aria-selected 时才播 —— 导航、工具、芯片
       hover  鼠标悬停才播 —— 桌面上的删除、外链这类
       press  点一下播完整一轮就停 —— 成功对勾、发送
       none   静止

     默认是 active：占位元素若是按钮/链接，选中态自动生效；
     普通文字里的图标则一直不动，直到被显式触发。 */
  var IDLE_BUDGET = 6 // 同屏最多几个「一直动」的，超了自动降级成 active

  function make(name, size, opts) {
    var def = ICONS[name]
    if (!def) return null
    var o = opts || {}
    var frames = def.frames && def.frames.length ? def.frames : def.base ? [def.base] : null
    if (!frames || !frames.length) return null

    /* ★ 先裁掉四周的空白行/列。
       我画图标时为了对齐留了不少 '.'，但每个图标留的多少不一样：
       arrowRight 的内容只占中间一小块，star 却几乎铺满 ——
       不裁的话，同样给 16px，看起来一个大一个小。
       裁完之后每个图标都是「内容顶满边框」，视觉重量才一致。 */
    var allRows = []
    for (var fi = 0; fi < frames.length; fi++) allRows = allRows.concat(frames[fi])
    var minX = 1e9, minY = 1e9, maxX = -1, maxY = -1
    for (var fi2 = 0; fi2 < frames.length; fi2++) {
      var fr = frames[fi2]
      for (var y = 0; y < fr.length; y++) {
        var row = fr[y]
        for (var x = 0; x < row.length; x++) {
          var ch = row.charAt(x)
          if (ch === '.' || ch === ' ' || !C[ch]) continue
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    // 裁的时候用**所有帧的并集**，不能逐帧裁 ——
    // 那样每帧尺寸不同，动画会一跳一跳
    if (maxX < 0) return null
    var PAD = 0
    minX = Math.max(0, minX - PAD); minY = Math.max(0, minY - PAD)
    maxX += PAD; maxY += PAD
    frames = frames.map(function (fr) {
      var out2 = []
      for (var yy = minY; yy <= maxY && yy < fr.length; yy++) {
        var r = fr[yy] || ''
        out2.push(r.slice(minX, maxX + 1))
      }
      return out2
    })

    var grid = frames[0]
    var gw = 0
    for (var i = 0; i < grid.length; i++) gw = Math.max(gw, grid[i].length)
    var gh = grid.length

    /* ★ 尺寸分两层处理，别混在一起：
          · **背板**用整数倍放大（k 取整），保证每个像素格子均匀、不糊
          · **CSS 尺寸**用请求的真实值，保证排到界面里大小如约
       一开始两者都用整数倍，结果 12 格宽的图标请求 18px 会吸附到 24px
       （round(18/12)=2），偏大三分之一；请求 22px 也还是 24px。
       像素画里背板必须整数倍，但显示尺寸可以交给浏览器
       用 image-rendering: pixelated 做最近邻缩放 —— 这正是像素画的常规做法。 */
    var k = Math.max(2, Math.round((size || 20) / Math.max(gw, gh)))
    var bw = gw * k
    var bh = gh * k
    var dpr = Math.min(window.devicePixelRatio || 1, 3)

    /* 显示尺寸：宽度用请求值，高度按网格比例 ——
       12×9 这种非正方形图标直接给正方形尺寸会被拉变形。 */
    var want = Math.max(8, Math.round(size || 20))
    var ratio = gh / gw
    var cssW = want
    var cssH = Math.max(6, Math.round(want * ratio))

    var cv = document.createElement('canvas')
    cv.width = Math.round(bw * dpr)
    cv.height = Math.round(bh * dpr)
    cv.style.width = cssW + 'px'
    cv.style.height = cssH + 'px'
    cv.className = 'lwicon'
    cv.setAttribute('data-icon', name)
    var ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false

    var idx = 0
    function paint() {
      ctx.clearRect(0, 0, bw, bh)
      drawFrame(ctx, frames[idx % frames.length], k, 0, 0)
    }
    paint()

    var mode = o.on || (o.animate === true ? 'idle' : o.animate === false ? 'none' : 'active')
    var multi = frames.length > 1

    /* 一个图标一个「播放器」：想动就 start，不想动就 stop。
       停的时候回到第 0 帧 —— 留一个中间帧会显得像卡住了。 */
    var player = {
      cv: cv,
      timer: 0,
      mode: mode,
      alive: true,
      start: function () {
        if (!multi || player.timer || !iconAnimates()) return
        // 元素不在文档里就别开，避免离屏空转
        if (!cv.isConnected) return
        var fps = (o.fps || (mode === 'press' ? 8 : 3)) * speed()
        player.timer = setInterval(function () {
          /* ★ 这里**不要**判断 document.hidden。
             浏览器自己就会把后台标签页的 setInterval 节流到大约
             每秒一次，省电是自动的；自己再判一次不但多余，
             还会在无头环境里（document.hidden 恒为 true）把所有
             动画都掐掉 —— 那样连测试都测不出来。
             真正要判的是「这个 canvas 还在不在文档里」。 */
          if (!cv.isConnected) {
            player.stop()
            return
          }
          idx++
          paint()
          /* 一次性播放的到期检查。
             用「到时间了没」而不是「idx 到没到帧数」——
             前者和帧率无关，改 fps 不会算错。 */
          if (player.oneShotUntil && Date.now() >= player.oneShotUntil) {
            player.oneShotUntil = 0
            player.stop()
          } else if (!player.oneShotUntil && mode === 'press' && idx >= frames.length) {
            player.stop()
          }
        }, Math.round(1000 / fps))
      },
      stop: function (reset) {
        if (player.timer) clearInterval(player.timer)
        player.timer = 0
        player.oneShotUntil = 0
        if (reset !== false && multi) {
          idx = 0
          paint()
        }
      },
      /** 播一轮然后回到首帧。
          复用常驻播放器，只加一个「播到什么时候停」的到期时间。
          之前用一次性 setTimeout 链自己算帧，在无头环境下不跑；
          而常驻播放器这套 setInterval 是验证过能跑的，别另起一套。 */
      playOnce: function () {
        if (!multi) return
        var fps = (o.fps || 8) * speed()
        var dur = (frames.length * 1000) / fps + 80
        player.stop()
        idx = 0
        player.oneShotUntil = Date.now() + dur
        player.start()
      },
    }
    live.push(player)

    function host() {
      return cv.parentNode && cv.parentNode.nodeType === 1 ? cv.parentNode : null
    }
    /* 宿主「选中了没」。
       往上找 3 层 —— 站内这些类的挂法不统一：
         .tool.active（按钮自己）
         .tw-tab.on（按钮自己）
         .ch-chip.on（按钮自己）
         .bottom-nav a.router-link-active（<a> 包着 <i>）
       所以不能只看一层。找 3 层足够，再往上就可能碰上
       「整个列表容器带 .on」这种误判。 */
    var ON_CLASSES = ['on', 'active', 'sel']
    function onish(el) {
      if (!el || el.nodeType !== 1) return false
      for (var i = 0; i < ON_CLASSES.length; i++) {
        if (el.classList && el.classList.contains(ON_CLASSES[i])) return true
      }
      if (el.getAttribute) {
        if (el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-pressed') === 'true') return true
      }
      return false
    }
    /* ★ 只看自己和**直接父元素**，不再往上找三层。
       之前找三层是为了兼容「选中类挂在包裹层」的情况，
       但那会让「某个祖先碰巧带 .on」的图标全都动起来 ——
       底部导航就踩过这个：四个图标不管在哪个页面都在播。
       需要更宽判断的场合（比如导航），用显式的 mode='nav'。 */
    function hostActive() {
      var h = host()
      if (onish(h)) return true
      return onish(h && h.parentNode)
    }
    /* 导航专用：Vue Router 会把 .active 加在**匹配的那个 <a>** 上，
       所以只要看最近的 a 有没有 .active 就够了，精确且不会误判。 */
    function navActive() {
      var h = host()
      if (!h || !h.closest) return false
      var a = h.closest('a')
      return !!(a && a.classList.contains('active'))
    }

    /* ★ 绑定要等 canvas 真的进了 DOM 再做。
       make() 只负责造 canvas，是调用方（apply / 页面）负责 append 的 ——
       在这里同步绑的话：
         · cv.isConnected 还是 false → idle 模式的 start() 直接 return
         · cv.parentNode 是 null    → host() 拿到 null，
                                      active 观察不到、hover 和 press 也绑不上
       三种驱动会一起失效。推到下一个 tick 就都对了。 */
    function bindInteraction() {
      if (!cv.isConnected) return
      if (multi && iconAnimates() && mode !== 'none') {
        if (mode === 'idle') {
          // 同屏「一直动」的图标数量封顶，超了自动降级成 active
          var running = 0
          for (var q = 0; q < live.length; q++) if (live[q].timer) running++
          if (running >= IDLE_BUDGET) mode = player.mode = 'active'
          else player.start()
        }

        if (mode === 'nav') {
          var check = navActive
          if (check()) player.start()
          player._poll = setInterval(function () {
            if (!cv.isConnected) {
              clearInterval(player._poll)
              player._poll = 0
              player.stop()
              return
            }
            if (check()) player.start()
            else player.stop()
          }, 400)
        }

        if (mode === 'active') {
          /* ★ 用低频轮询而不是 MutationObserver。
             观察器要预先写死「盯哪个祖先的属性」，但站内选中类挂的层级
             不统一（有的在按钮上、有的在包它的 <a> 上），盯少了不生效、
             盯多了要挂一堆观察器。
             改成每 400ms 看一眼自己选没选中 —— 十来个图标就是每秒几十次
             比大小，开销可以忽略，而且永远不会漏。 */
          if (hostActive()) player.start()
          player._poll = setInterval(function () {
            if (!cv.isConnected) {
              clearInterval(player._poll)
              player._poll = 0
              player.stop()
              return
            }
            if (hostActive()) player.start()
            else player.stop()
          }, 400)
        }

        if (mode === 'hover' || mode === 'active' || mode === 'nav') {
          var h2 = host()
          if (h2) {
            h2.addEventListener('pointerenter', function (e) {
              if (e.pointerType === 'touch') return
              player.start()
            })
            h2.addEventListener('pointerleave', function () {
              if ((mode !== 'active' && mode !== 'nav') || !(mode === 'nav' ? navActive() : hostActive())) player.stop()
            })
          }
        }

        // press 模式常驻不动，只在被点时播一轮（见下面的全局委托）
        if (mode === 'press' || o.playOnClick) {
          PRESSERS.push(player)
          bindPressDelegate()
          /* press 已实测通过：点之前静止、点之后播完整一轮。
             ★ 说一下为什么中途差点误判成坏了：
               我当时的检测函数只统计画面的**透明度**分布，
               而图标是实心方块 —— 每一帧哪些像素不透明完全一样，
               于是签名恒定，看起来像「一帧都没变」。
               改成把 RGB 也算进签名之后，立刻看到 3 种画面。
               教训：验证画面有没有变，一定要把颜色纳进去，
               不能只看 alpha。 */
        }
      }
    }
    setTimeout(bindInteraction, 0)

    return cv
  }

  /* ================= emoji → 像素图标 =================
     把界面里的 emoji 换掉，但**不是全换**：
       · 设置页整个不动（用户明确要求）
       · 更新日志不动 —— 那是历史记录
       · 聊天里的表情选择器不动 —— 那是用户主动发的贴纸，
         换成图标等于把这个功能删了
       · <input> / <textarea> / <option> 里的不动 —— 那里不是图标是文本
     替换发生在**文本节点**上，只认整颗 emoji，不动周围的文字。

     on 指定这些图标怎么动：界面图标默认 active（选中/悬停才动），
     避免一屏几十个东西一起动。 */
  var EMOJI_MAP = {
    '✨': ['dust', 'idle'],
    '🎨': ['palette', 'hover'],
    '🏆': ['trophy', 'hover'],
    '🏠': ['house', 'hover'],
    '🏘': ['town', 'hover'],
    '💬': ['chat', 'hover'],
    '🖼': ['frame', 'hover'],
    '🛡': ['shield', 'hover'],
    '🏅': ['medal', 'hover'],
    '👤': ['user', 'hover'],
    '🖌': ['brush', 'hover'],
    '✏': ['pencil', 'hover'],
    '✍': ['pencil', 'hover'],
    '✒': ['pencil', 'hover'],
    '🗑': ['trash', 'press'],
    '♻': ['undo', 'press'],
    '↩': ['undo', 'press'],
    '↺': ['undo', 'press'],
    '🔄': ['undo', 'press'],
    '✅': ['check', 'press'],
    '✔': ['check', 'press'],
    '☑': ['check', 'press'],
    '❌': ['cross', 'press'],
    '✖': ['cross', 'press'],
    '✕': ['cross', 'press'],
    '⚠': ['question', 'hover'],
    '❓': ['question', 'hover'],
    '❔': ['question', 'hover'],
    '🎞': ['film', 'hover'],
    '🎬': ['film', 'hover'],
    '🦋': ['butterfly', 'idle'],
    '🎁': ['gift', 'hover'],
    '🎲': ['dice', 'press'],
    '🎂': ['cake', 'idle'],
    '📢': ['announce', 'press'],
    '📣': ['announce', 'press'],
    '🤝': ['handshake', 'hover'],
    '🙋': ['raise', 'hover'],
    '🎉': ['party', 'press'],
    '🎊': ['party', 'press'],
    '🔗': ['link', 'press'],
    '🔍': ['question', 'hover'],
    '⬇': ['download', 'press'],
    '📥': ['download', 'press'],
    '⚡': ['bolt', 'idle'],
    '🔥': ['fire', 'idle'],
    '🚩': ['flag', 'hover'],
    '🏳': ['flag', 'hover'],
    '🚫': ['ban', 'hover'],
    '⛔': ['ban', 'hover'],
    '🚪': ['arrowRight', 'hover'],
    '♡': ['heart', 'idle'],
    '♥': ['heart', 'idle'],
    '❤': ['heart', 'idle'],
    '💛': ['heart', 'idle'],
    '💙': ['heart', 'idle'],
    '💚': ['heart', 'idle'],
    '💜': ['heart', 'idle'],
    '🤍': ['heart', 'idle'],
    '🖤': ['heart', 'idle'],
    '🧡': ['heart', 'idle'],
    '☀': ['sun', 'idle'],
    '🌤': ['sun', 'idle'],
    '🌞': ['sun', 'idle'],
    '⛅': ['sun', 'idle'],
    '🌧': ['sun', 'idle'],
    '❄': ['sun', 'idle'],
    '🔒': ['lock', 'hover'],
    '🔓': ['lock', 'hover'],
    '✉': ['mail', 'hover'],
    '📧': ['mail', 'hover'],
    '📬': ['mail', 'hover'],
    '📩': ['mail', 'hover'],
    '🗺': ['map', 'hover'],
    '📷': ['frame', 'press'],
    '🎯': ['frame', 'press'],
    '📏': ['line', 'hover'],
    '📐': ['line', 'hover'],
    '🧽': ['eraser', 'press'],
    '🩹': ['eraser', 'press'],
    '💧': ['fill', 'press'],
    '🪣': ['fill', 'press'],
    '🎨': ['palette', 'hover'],
    '💉': ['picker', 'press'],
    '💊': ['picker', 'press'],
    '✋': ['hand', 'hover'],
    '🤚': ['hand', 'hover'],
    '🫂': ['hand', 'hover'],
    '🤏': ['hand', 'hover'],
    '✥': ['move', 'hover'],
    '✛': ['move', 'hover'],
    '⤢': ['move', 'hover'],
    '⤡': ['move', 'hover'],
    '⬛': ['frame', 'none'],
    '⬜': ['frame', 'none'],
    '📌': ['flag', 'hover'],
    '📋': ['frame', 'hover'],
    '📄': ['frame', 'hover'],
    '📜': ['frame', 'hover'],
    '📦': ['gift', 'hover'],
    '⑦': ['bolt', 'none'],
    '→': ['arrowRight', 'hover'],
    '←': ['arrowLeft', 'hover'],
    '↓': ['arrowDown', 'hover'],
    '↑': ['arrowDown', 'hover'],
    '➡': ['arrowRight', 'hover'],
    '⬅': ['arrowLeft', 'hover'],
    '⬆': ['arrowDown', 'hover'],
    '▶': ['arrowRight', 'hover'],
    '◀': ['arrowLeft', 'hover'],
    '▸': ['arrowRight', 'hover'],
    '◂': ['arrowLeft', 'hover'],
    '›': ['arrowRight', 'hover'],
    '‹': ['arrowLeft', 'hover'],
    '…': ['question', 'none'],
    '★': ['star', 'idle'],
    '☆': ['star', 'idle'],
    '⭑': ['star', 'idle'],
  }

  /* 这些容器下面的 emoji 一律不换 —— 加了 data-px-skip 也可以 */
  var SKIP_SELECTOR = '[data-px-skip], input, textarea, select, option, code, pre, .ch-emoji, .emoji-pick, .ch-sticker'
  var SKIP_PATH = ['/settings', '/changelog']

  function shouldSkipTextNode(node) {
    var el = node.parentNode
    if (!el || el.nodeType !== 1) return true
    if (el.closest && el.closest(SKIP_SELECTOR)) return true
    // 已经在图标宿主里了
    if (el.closest && el.closest('[data-px-done]')) return true
    return false
  }

  function pathSkipped() {
    var p = location.pathname || ''
    for (var i = 0; i < SKIP_PATH.length; i++) {
      if (p.indexOf(SKIP_PATH[i]) === 0) return true
    }
    return false
  }

  var EMOJI_RE = null
  function buildRe() {
    if (EMOJI_RE) return EMOJI_RE
    var keys = Object.keys(EMOJI_MAP)
    // 长的排前面，避免「🖼️」被「🖼」先吃掉
    keys.sort(function (a, b) { return b.length - a.length })
    var esc = keys.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    EMOJI_RE = new RegExp('(' + esc.join('|') + ')\\uFE0F?', 'g')
    return EMOJI_RE
  }

  /**
   * 把一段范围内的 emoji 换成像素图标。
   * 只处理文本节点，不动 input 的值和代码块。
   */
  function swapEmoji(root) {
    if (pathSkipped()) return 0
    var scope = root || document.body
    if (!scope) return 0
    var re = buildRe()
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/[\u2000-\uFFFF]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT
        if (shouldSkipTextNode(n)) return NodeFilter.FILTER_REJECT
        re.lastIndex = 0
        return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })
    var targets = []
    while (walker.nextNode()) targets.push(walker.currentNode)
    if (!targets.length) return 0

    var count = 0
    for (var i = 0; i < targets.length; i++) {
      var node = targets[i]
      var text = node.nodeValue
      re.lastIndex = 0
      if (!re.test(text)) continue
      var frag = document.createDocumentFragment()
      var last = 0
      var m
      re.lastIndex = 0
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
        var hit = EMOJI_MAP[m[1]]
        if (hit) {
          var ic = document.createElement('i')
          ic.className = 'px-ico-host px-ico-inline'
          ic.setAttribute('data-px', hit[0])
          /* 不写 data-px-size —— 让 sizeFor 按所在位置的字号算。
             emoji 本来就是跟着 font-size 走的，写死会大小不一。 */
          ic.setAttribute('data-px-on', hit[1])
          ic.setAttribute('aria-hidden', 'true')
          frag.appendChild(ic)
          count++
        } else {
          frag.appendChild(document.createTextNode(m[0]))
        }
        last = m.index + m[0].length
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
      if (node.parentNode) node.parentNode.replaceChild(frag, node)
    }
    return count
  }

  /* ================= 自动替换 =================
     页面上写 <i class="px-ico" data-px="dust"></i> 就会被换成图标。
     size 从 data-px-size 取，默认 20。 */
  /* 图标该多大。
     显式写了 data-px-size 就用它；
     没写就**跟随父元素的字号** ——
     emoji 本来就是跟着 font-size 走的，替换之后如果一律 16px，
     那些原本 30px 的地方（对话框图标、大标题前的图标）就会变小一圈。 */
  function sizeFor(el, fallback) {
    var attr = el.getAttribute('data-px-size')
    if (attr) return Number(attr) || fallback
    try {
      var host = el.parentNode
      var fs = host ? parseFloat(getComputedStyle(host).fontSize) : 0
      if (fs && fs > 0) return Math.round(Math.min(40, Math.max(12, fs * 1.15)))
    } catch (e) {}
    return fallback
  }

  function apply(root, opts) {
    var scope = root || document
    var nodes = scope.querySelectorAll('[data-px]:not([data-px-done])')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      var name = el.getAttribute('data-px')
      var size = sizeFor(el, 20)
      /* data-px-on 指定动画由什么驱动：
         idle / active / hover / press / none（不写默认 active） */
      var o = {}
      for (var k in opts || {}) o[k] = opts[k]
      var on = el.getAttribute('data-px-on')
      if (on) o.on = on
      var cv = make(name, size, o)
      if (!cv) continue
      el.setAttribute('data-px-done', '1')
      el.classList.add('px-ico-host')
      el.textContent = ''
      el.appendChild(cv)
    }
  }

  /* ================= 对外接口 ================= */
  window.LWIcon = {
    make: make,
    apply: apply,
    swapEmoji: swapEmoji,
    emojiMap: EMOJI_MAP,
    names: function () {
      var out = []
      for (var k in ICONS) if (Object.prototype.hasOwnProperty.call(ICONS, k)) out.push(k)
      return out
    },
    /** 换档位。off/low 停掉所有图标动画，rich 加快 */
    setLevel: function (lv) {
      if (LEVELS.indexOf(lv) < 0) return
      level = lv
      try {
        localStorage.setItem(LEVEL_KEY, lv)
      } catch (e) {}
      applyLevelAttr(lv)
      stopAll()
      // 通知 anim/fx 那几层也换档
      try {
        window.dispatchEvent(new CustomEvent('lw-anim-level', { detail: lv }))
      } catch (e) {}
      apply(document)
    },
    getLevel: function () { return level },
    levels: function () { return LEVELS.slice() },
    stopAll: stopAll,
    animates: iconAnimates,
    /** 让某个宿主元素里的图标播一轮 —— 用在「操作成功」这类一次性反馈 */
    play: function (el) {
      var sel = el && el.querySelectorAll ? el.querySelectorAll('canvas.lwicon') : []
      for (var i = 0; i < sel.length; i++) sel[i].dispatchEvent(new Event('click'))
    },
    /** 手动让某个 canvas 播一轮（内部用） */
    playOnce: function (cv) {
      for (var i = 0; i < live.length; i++) {
        if (live[i].cv === cv) {
          live[i].playOnce()
          return true
        }
      }
      return false
    },
  }
})()
