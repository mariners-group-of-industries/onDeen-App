import React from 'react';
import { StatusBar, View, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyStatusBar = ({ backgroundColor = '#fff', barStyle = "dark-content" }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.statusBar, { backgroundColor: backgroundColor, paddingTop: Platform.OS === 'ios' ? insets.top : 0 }]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <SafeAreaView style={{ flex: 1 }}>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: 0, // Height will be managed dynamically for iOS using safeAreaInsets
    backgroundColor: '#fff',
  },
});

export default MyStatusBar;