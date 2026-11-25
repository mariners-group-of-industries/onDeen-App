import React from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';

interface StatusBarManagerProps {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  translucent?: boolean;
}

const StatusBarManager: React.FC<StatusBarManagerProps> = ({
  backgroundColor = '#F9F6FD',
  barStyle = 'dark-content',
  translucent = false,
}) => {
  return (
    <StatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={translucent}
    />
  );
};

export default StatusBarManager;
