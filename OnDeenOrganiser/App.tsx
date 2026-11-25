import React from 'react';
import { LogBox, NativeModules } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import { ToastProvider } from './src/context/ToastContext';

if (__DEV__) {
  LogBox.ignoreLogs([
    'Support for defaultProps will be removed from function components',
  ]);
  LogBox.ignoreAllLogs(true);

  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (typeof scriptURL === 'string' && /^https?:\/\//.test(scriptURL)) {
    require('./ReactotronConfig');
  }
}

const App: React.FC = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ToastProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer>
              <Toast />
              <RootNavigator />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default App;
