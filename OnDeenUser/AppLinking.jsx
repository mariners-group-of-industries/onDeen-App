// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

function Home() {
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Home</Text>
    </View>
  );
}

function Product({ route }) {
  console.log(route, 'routeroute');
  const { id, ref } = route.params || {};
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Product ID: {id}</Text>
      <Text>Ref: {ref ?? '-'}</Text>
    </View>
  );
}

const linking = {
  prefixes: ['https://ondeen.app', 'ondeen://'],
  config: {
    screens: {
      Home: '',
      // handle both `/open?id=25` and `/open/:id`
      Product: {
        path: 'open/:id?',
        parse: {
          id: (id) => {
            // If it's base64 (like MjU=), decode → "25"
            try {
              if (/^[A-Za-z0-9+/=]+$/.test(id)) {
                return atob(id);
              }
              return id;
            } catch {
              return id;
            }
          }
        }
      }
    }
  }
};

export default function AppLinking() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Product" component={Product} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
