import { useEffect } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export const useStatusBar = ({
  backgroundColor,
  barStyle = 'dark-content',
}: {
  backgroundColor: string;
  barStyle?: StatusBarStyle;
}) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      StatusBar.setBarStyle(barStyle, true);
      StatusBar.setBackgroundColor(backgroundColor, true);
    }
  }, [isFocused, backgroundColor, barStyle]);
};
