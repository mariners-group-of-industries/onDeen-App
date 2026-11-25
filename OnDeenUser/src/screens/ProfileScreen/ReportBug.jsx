import React, { useState } from 'react';
import {
  ScrollView,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LatestHeader from '../../components/LatestHeader';
import { useNavigation } from '@react-navigation/native';
import ContactForm from './ContactForm';

const ReportBug = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation()
  const fetchNotesData = () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={{ backgroundColor: '#FFF', flex: 1 }}>
      <LatestHeader
        statusBarColor="#fff"
        title="Report an issue"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}

      />
      <ScrollView
        style={{ backgroundColor: '#fff' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNotesData} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ContactForm type={2} />
      </ScrollView>
    </ContainerComponent>
  );
};

export default ReportBug;
