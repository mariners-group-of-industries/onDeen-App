module.exports = {
  project: {
    ios: {},
    android: {
      packageName: 'com.ondeen.user',
    },
  },
  dependencies: {
    'rn-fetch-blob': {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ['./assets/fonts'],
};
