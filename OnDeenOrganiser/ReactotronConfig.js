import Reactotron from 'reactotron-react-native';

Reactotron
  .configure({
    name: 'React Native App',
    host: 'localhost', 
    port: 9090,        
  })
  .useReactNative()   
  .connect();         
