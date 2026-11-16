/**
 * ============================================================
 *  ZONE THEMES — colors and props for each world zone.
 * ============================================================
 * Keys match section ids in src/content.js. To add a zone:
 *   1. add a section in content.js (e.g. id: 'blog', kind: 'text')
 *   2. add a theme here with the same key (or skip it to get DEFAULT)
 * Zones line up left to right in content order; the road, terrain and sky transitions extend automatically.
 * props: builders in props.js, run in order. Put landmarks (the readable ones) first.
 *
 * hills: 0 = flat ground, 1 = full hills behind the road.
 * night: 0..1, fades in stars.
 */

const DEFAULT = {
  label: 'ZONE',
  sky: '#64b5ff',
  fog: '#a9dbff',
  fogNear: 42,
  fogFar: 120,
  hemiSky: '#d6ecff',
  hemiGround: '#5a7a3a',
  hemiI: 1.15,
  light: '#fff6e0',
  lightI: 1.7,
  sun: '#fff1a8',
  sunY: 26,
  night: 0,
  cloud: '#ffffff',
  textColor: '#ffd23f',
  accent: '#ff5c8a',
  ground: {
    top: ['#5cbf4b', '#4fae42', '#67c956'],
    side: ['#8b5a2b', '#7a4d24'],
    path: ['#e2c27f', '#d4b26e'],
  },
  mountain: ['#6b8fc4', '#5a7db0', '#7a9ccf'],
  snow: '#f4f8ff',
  leaves: ['#2f8f3a', '#3ea84a', '#2a7a33'],
  trunk: '#6b4423',
  hills: 1,
  props: ['trees', 'bushes', 'flowers'],
};

const THEMES = {
  intro: {
    label: 'SHAURYA',
    props: ['welcome', 'trees', 'bushes', 'flowers'],
  },

  about: {
    label: 'ABOUT',
    sky: '#ffad66',
    fog: '#ffd0a0',
    hemiSky: '#ffe2bd',
    hemiGround: '#8a6a3a',
    light: '#ffd29a',
    sun: '#fff0a0',
    sunY: 12,
    cloud: '#ffe7d1',
    textColor: '#ffffff',
    accent: '#ffd23f',
    ground: {
      top: ['#c9b44a', '#b9a43f', '#d6c055'],
      side: ['#8a5a33', '#7a4c2b'],
      path: ['#ecd09c', '#dfc18a'],
    },
    mountain: ['#b06a5a', '#9c5b4e', '#c07a66'],
    snow: '#ffe6cc',
    leaves: ['#e07b2a', '#d9542b', '#f0a830'],
    trunk: '#5a3a22',
    props: ['studio', 'trees', 'bushes', 'flowers'],
  },

  services: {
    label: 'SERVICES',
    sky: '#7c6ad6',
    fog: '#a596ee',
    hemiSky: '#d8cfff',
    hemiGround: '#3f5a6a',
    hemiI: 1.0,
    light: '#ffe2f4',
    lightI: 1.4,
    sun: '#ffd6f0',
    sunY: 16,
    night: 0.25,
    cloud: '#e4dcff',
    textColor: '#ffd23f',
    accent: '#3fd0ff',
    ground: {
      top: ['#4aa6a0', '#3f948f', '#56b5ae'],
      side: ['#5a4a7a', '#4d3f6a'],
      path: ['#cfc8ee', '#bfb6e2'],
    },
    mountain: ['#4b3f8f', '#3f347c', '#584b9e'],
    snow: '#ece6ff',
    leaves: ['#3fbf9f', '#2fa38a'],
    trunk: '#4a3a5a',
    props: ['bagTower', 'liquidTower', 'boltTower', 'crystals', 'bushes'],
  },

  projects: {
    label: 'STORES',
    sky: '#141a3a',
    fog: '#232a55',
    fogNear: 36,
    fogFar: 105,
    hemiSky: '#6a78c8',
    hemiGround: '#20243a',
    hemiI: 0.75,
    light: '#a8b6ff',
    lightI: 0.9,
    sun: '#f2f2ff',
    sunY: 24,
    night: 1,
    cloud: '#36406e',
    textColor: '#3fd0ff',
    accent: '#ff5c8a',
    ground: {
      top: ['#3a3f55', '#343849', '#40455c'],
      side: ['#262a3a', '#20232f'],
      path: ['#767d9a', '#6a718c'],
    },
    mountain: ['#1f2547', '#1a1f3d', '#252c52'],
    snow: '#3a4277',
    leaves: ['#2f6a5a'],
    trunk: '#2a2a3a',
    hills: 0,
    props: ['storeBillboards', 'shopStreet', 'lamps'],
  },

  app: {
    label: 'APP',
    sky: '#123a3c',
    fog: '#1f5a57',
    hemiSky: '#a6f0d6',
    hemiGround: '#183a30',
    hemiI: 0.9,
    light: '#d8ffe9',
    lightI: 1.2,
    sun: '#e9fff4',
    sunY: 20,
    night: 0.6,
    textColor: '#95bf47',
    accent: '#95bf47',
    ground: {
      top: ['#2f6f5c', '#2a6453', '#357a65'],
      side: ['#24443a', '#1e3a31'],
      path: ['#9fd3bf', '#8fc5b1'],
    },
    mountain: ['#1d4a48', '#18403e', '#235654'],
    snow: '#c8fff0',
    leaves: ['#3fbf8f', '#2fa37a', '#4fd09f'],
    trunk: '#3a3a2a',
    props: ['appCart', 'discountTags', 'servers', 'trees'],
  },

  faq: {
    label: 'FAQ',
    sky: '#e46f7c',
    fog: '#f4a6a0',
    hemiSky: '#ffd6d0',
    hemiGround: '#6a4a5a',
    light: '#ffd0b8',
    sun: '#fff0c8',
    sunY: 10,
    night: 0.15,
    textColor: '#ffffff',
    accent: '#ffd23f',
    ground: {
      top: ['#7fae5a', '#73a050', '#8bbd64'],
      side: ['#7a5a43', '#6a4c38'],
      path: ['#f2d6b0', '#e8c89e'],
    },
    mountain: ['#9a5a7a', '#8a4e6c', '#aa6a88'],
    snow: '#ffe4ec',
    leaves: ['#e88aa8', '#f2a4bc', '#d8789a'],
    trunk: '#5a3a40',
    props: ['signStation', 'trees', 'bushes', 'flowers'],
  },

  contact: {
    label: 'HELLO',
    sky: '#1c4e6b',
    fog: '#2d6a85',
    hemiSky: '#9cc8e8',
    hemiGround: '#24453a',
    hemiI: 0.9,
    light: '#cfe6ff',
    lightI: 1.1,
    sun: '#eef4ff',
    sunY: 22,
    night: 0.8,
    cloud: '#4f7896',
    textColor: '#ffd23f',
    accent: '#ffd23f',
    ground: {
      top: ['#2f7a5a', '#286d50', '#368766'],
      side: ['#4a3a2a', '#3f3124'],
      path: ['#a4ccb6', '#94bea7'],
    },
    mountain: ['#1d3d5a', '#18344d', '#24496a'],
    snow: '#cfe6ff',
    leaves: ['#1f5a44', '#1a4e3b', '#24684f'],
    trunk: '#4a3322',
    props: ['mailbox', 'flag', 'campfire', 'pines', 'fireflies'],
  },
};

export function getTheme(id) {
  const t = THEMES[id] || { label: String(id).toUpperCase().slice(0, 10) };
  return {
    ...DEFAULT,
    ...t,
    ground: { ...DEFAULT.ground, ...(t.ground || {}) },
    id,
  };
}
