import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  FlatList,
  BackHandler,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {membershiplistAPI} from '../../redux/slices/membershipSlice';
import MemebershipItem from './MemebershipItem';
import Benefits from './Benefits';
import styles from './styles';
import {fontScale, heightScale} from '../../helpers/scale';
import CustomHeader from '../../components/CustomHeader';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import {RootState} from '../../redux/store';

const Membership = ({route}) => {
  const [check, setcheck] = useState(null);
  const {t} = useTranslation();
  // const {isFromRegister} = route.params;
  // console.log('isFromRegister',isFromRegister);

  const insets = useSafeAreaInsets();
  const {membership, status} = useSelector(state => state.membership);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectmembership, setSelectmembership] = useState(null);

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(membershiplistAPI({event_id: 1}));
    setRefreshing(false);
  };

  const membershipdata =
    membership && Array.isArray(membership?.membership?.membership)
      ? membership?.membership?.membership
      : [];

  useEffect(() => {
    hitapitogetdatafilter();
  }, []);

  useEffect(() => {
    if (membershipdata.length > 0) {
      setcheck(membershipdata[0].id);
      setSelectmembership(membershipdata[0]);
    }
  }, [membershipdata]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const shouldBlockBack = route?.params?.lastscreen !== 'MyMembership';

        if (shouldBlockBack) {
          return true; // Block back
        } else {
          return false; // Allow back
        }
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [route?.params?.lastscreen]),
  );

  const membershipdata1 = [
    {
      tabbgcolor: ['rgba(255, 213, 227, 1)', 'rgba(221, 137, 245, 1)'],
    },
    {
      tabbgcolor: ['rgba(255, 216, 97, 1)', 'rgba(255, 174, 204, 1)'],
    },
    {
      tabbgcolor: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
    },
    {
      tabbgcolor: ['rgba(255, 213, 227, 1)', 'rgba(221, 137, 245, 1)'],
    },
    {
      tabbgcolor: ['rgba(255, 216, 97, 1)', 'rgba(255, 174, 204, 1)'],
    },
    {
      tabbgcolor: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
    },
    {
      tabbgcolor: ['rgba(255, 213, 227, 1)', 'rgba(221, 137, 245, 1)'],
    },
    {
      tabbgcolor: ['rgba(255, 216, 97, 1)', 'rgba(255, 174, 204, 1)'],
    },
    {
      tabbgcolor: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
    },
  ];

  const renderItem = ({item, index}) => {
    const tabbgcolor =
      item?.tabbgcolor ||
      membershipdata1[index].tabbgcolor ||
      `rgba(255, 213, 227, 1)', 'rgba(221, 137, 245, 1)`; // Fallback to membershipdata1 if not available
    return (
      <MemebershipItem
        item={item}
        sub_title={item.sub_title}
        title={item.title}
        offer={item.offer}
        price={item.price}
        image={{uri: item.image}}
        id={item.id}
        tabbgcolor={tabbgcolor}
        setcheck={setcheck}
        check={check}
        setSelectmembership={setSelectmembership}
      />
    );
  };

  if (status === 'loading') {
    return (
      <Loader
        isLoading={true}
        containerStyle={{backgroundColor: '#FDFBFF'}}
        animationSource={require('../../../src/assets/loader.json')}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <LatestHeader
        statusBarColor={'#FDFBFF'}
        title="Choose your plan"
        // skipimage={true}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.navigate('MainNavigator')}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        isTextClickable={false}
        showIcon={route?.params?.lastscreen == 'MyMembership' ? true : false}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }>
        <View style={{paddingHorizontal: 48, paddingVertical: 8}}>
          <Text style={styles.exploreText}>GET ACCESS TO </Text>
          <Text style={styles.exploreText}> ALL PREMIUM BENEFITS</Text>
        </View>
        <View>
          <Text style={styles.chousemembership}>Choose a plan</Text>
          <FlatList
            data={membershipdata}
            renderItem={renderItem}
            keyExtractor={item => item.id?.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {/* {selectmembership?.description && ( */}
        <Benefits selectmembership={selectmembership} />
        {/* )} */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Membership;
