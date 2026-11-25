import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { membershiplistAPI } from '../../redux/slices/membershipSlice';
import MemebershipItem from './MemebershipItem';
import Benefits from './Benefits';
import styles from './styles';
import { fontScale, heightScale } from '../../helpers/scale';
import CustomHeader from '../../components/CustomHeader';
import { myMembershiplistAPI } from '../../redux/slices/mymembershipSlice';
import LatestHeader from '../../components/LatestHeader';

const MyMembership = ({ route }) => {
  const [check, setcheck] = useState(0);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mymembership } = useSelector(
    (state) => state.mymembership
  );

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectmembership, setSelectmembership] = useState('');

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(myMembershiplistAPI({ event_id: 1 }));
    setRefreshing(false);


  };

  const membershipdata = mymembership && Array.isArray(mymembership?.membership) ? mymembership?.membership : [];

  useEffect(() => {
    hitapitogetdatafilter();
  }, []);

  

  const renderItem = ({ item, index }) => {
    return (
      <MemebershipItem
        item={item}
        sub_title={item.sub_title}
        title={item.title}
        offer={item.offer}
        price={item.price}
        image={{ uri: item.image }}
        id={item.id}
        // tabbgcolor={tabbgcolor}
        setcheck={setcheck}
        check={check}
        setSelectmembership={setSelectmembership}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LatestHeader
        statusBarColor={'#FDFBFF'}
        title="Membership"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }
        contentContainerStyle={styles.scrollViewContent}>
        <View>
          <Text style={styles.chousemembership}>Choose a plan</Text>
          <FlatList
            data={membershipdata}
            renderItem={renderItem}
            keyExtractor={item => item.id?.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {
          selectmembership?.description &&
          <Benefits selectmembership={selectmembership} />
        }
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyMembership;
