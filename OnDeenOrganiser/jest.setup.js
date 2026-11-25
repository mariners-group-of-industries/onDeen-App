require('react-native-gesture-handler/jestSetup');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('reactotron-react-native', () => ({
  configure: jest.fn().mockReturnThis(),
  useReactNative: jest.fn().mockReturnThis(),
  connect: jest.fn().mockReturnThis(),
}));

jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');

  return {
    ...actual,
    persistStore: jest.fn(() => ({
      flush: jest.fn(),
      pause: jest.fn(),
      persist: jest.fn(),
      purge: jest.fn(),
    })),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };

  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  };
});
