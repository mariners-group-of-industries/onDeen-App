import React, { useEffect, useRef } from 'react';
import { useColorScheme, Text } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';

import RootNavigator from './src/navigation/RootNavigator';
import { store, persistor } from './src/redux/store';
import i18n from './src/locales/i18n';
import { navigationRef } from './src/checkpurpose/NavigationService';

import { DropdownProvider } from './src/context/DropdownContext';
import { ToastProvider } from './src/context/ToastContext';
import ErrorBoundaryComponent from './src/utils/FallbackComponent';
import { FilterProvider } from './src/context/FilterContext';
import Toast from 'react-native-toast-message';

import { BASE_URL, ENABLE_FCM_NOTIFICATIONS, PAYMENTKEY } from './src/helpers/Constant';
import {
  requestUserPermission,
  setupForegroundHandler,
  setupBackgroundHandler,
  setupNotificationOpenedHandler
} from './src/NotificationServices/firebaseNotificationService';
import { setupNotificationInteractionHandler } from './src/NotificationServices/notificationHandler';
import AppAutologout from './src/security/AppAutologout';

const decodeEventLinkId = (value) => {
  if (!value) {
    return value;
  }

  if (/^\d+$/.test(String(value))) {
    return value;
  }

  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let buffer = 0;
    let bits = 0;

    for (const char of String(value).replace(/=+$/, '')) {
      const index = chars.indexOf(char);
      if (index < 0) {
        return value;
      }
      buffer = (buffer << 6) | index;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }

    return /^\d+$/.test(output) ? output : value;
  } catch {
    return value;
  }
};

const getLinkingPrefixes = () => {
  const prefixes = ['https://ondeen.app', 'ondeen://'];
  const apiBaseUrl = String(BASE_URL || '').trim().replace(/\/+$/, '');

  if (apiBaseUrl && !prefixes.includes(apiBaseUrl)) {
    prefixes.push(apiBaseUrl);
  }

  return prefixes;
};

const App = () => {
  const scheme = useColorScheme();
  const notificationCleanupRef = useRef(null);

  useEffect(() => {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = {
      color: scheme === 'dark' ? '#fff' : '#000',
    };
  }, [scheme]);

  useEffect(() => {
    return () => {
      notificationCleanupRef.current?.();
      notificationCleanupRef.current = null;
    };
  }, []);

  const handleNavigationReady = () => {
    if (!ENABLE_FCM_NOTIFICATIONS || notificationCleanupRef.current) {
      return;
    }

    requestUserPermission();
    setupForegroundHandler();
    setupBackgroundHandler();
    setupNotificationOpenedHandler(navigationRef);
    notificationCleanupRef.current = setupNotificationInteractionHandler(navigationRef);
  };

  const linking = {
    prefixes: getLinkingPrefixes(),
    config: {
      screens: {
        MainNavigator: '',
        CourseDetails: {
          path: 'open/:id?',
          parse: {
            id: (id) => {
              return decodeEventLinkId(id);
            },
          },
        },
        SpeakerScreen: {
          path: 'speaker/:speakerId',
          parse: {
            speakerId: (speakerId) => Number(speakerId),
          },
        },
      },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={PAYMENTKEY}
        merchantIdentifier="merchant.com.ondeen.user"
        urlScheme="ondeen">
        <I18nextProvider i18n={i18n}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ToastProvider>
              <Provider store={store}>
                <ErrorBoundaryComponent>
                  <PersistGate loading={null} persistor={persistor}>
                    <DropdownProvider>
                      <FilterProvider>
                        <NavigationContainer linking={linking} ref={navigationRef} onReady={handleNavigationReady}>
                          <RootNavigator />
                          <AppAutologout/>
                          <Toast />
                        </NavigationContainer>
                      </FilterProvider>
                    </DropdownProvider>
                  </PersistGate>
                </ErrorBoundaryComponent>
              </Provider>
            </ToastProvider>
          </SafeAreaProvider>
        </I18nextProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
