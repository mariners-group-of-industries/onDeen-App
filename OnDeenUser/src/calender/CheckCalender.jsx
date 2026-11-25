
import React, { useState } from 'react';
import { View } from 'react-native';
import CalendarEventAdder from './CalendarEventAdder';
import CalendarEventList from './CalendarEventList';

export default function CheckCalender() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Trigger list refresh when event added
  const handleEventAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#ccc' }}>
        <CalendarEventAdder onEventAdded={handleEventAdded} />
      </View>
      <View style={{ flex: 1 }}>
        <CalendarEventList refreshKey={refreshKey} />
      </View>
    </View>
  );
}
