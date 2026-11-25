import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {membershipPurchasedListAPI} from '../../redux/slices/membershipSlice';
import {fontScale} from '../../helpers/scale';
import LatestHeader from '../../components/LatestHeader';
import Loader from '../../components/loader';
import {RootState} from '../../redux/store';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import NoData from '../../components/NoData';

const ActiveMembership = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {purchasedMemberships, status} = useSelector(
    (state: RootState) => state.membership,
  );

  const [refreshing, setRefreshing] = useState(false);

  const fetchMemberships = async () => {
    setRefreshing(true);
    await dispatch(membershipPurchasedListAPI());
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const renderItem = ({item}) => {
    const {title, sub_title, price, description, ends_on, purchased_on} = item;

    const gradientColors = ['#FFD5E3', '#DD89F5']; // One consistent gradient

    return (
      <LinearGradient
        colors={gradientColors}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.gradientBorder}>
        <LinearGradient
          colors={gradientColors}
          start={{x: 0.2, y: 0}}
          end={{x: 0.5, y: 1}}
          style={styles.itemContainer}>
          <View style={styles.itemContainersecond}>
            <View style={{width: '65%'}}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.offer}>{sub_title}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 24,
                }}>
                <Text style={styles.expiry}>
                  Renew on: {new Date(ends_on).toDateString()}
                </Text>
                <Text style={styles.expiry}>
                  Starts on: {new Date(purchased_on).toDateString()}
                </Text>
              </View>
            </View>

            <View style={{width: '30%', alignItems: 'flex-end'}}>
              <Text style={styles.price}>{price}</Text>
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>
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

  {
    purchasedMemberships.length === 0 && (
      <View style={styles.centered}>
        <NoData
          title={'Book events happening near you'}
          heading={'NO EVENTS FOUND'}
          // onPress={() => navigation.navigate('Homewithroute')}
          // buttonTitle={'Explore Events'}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {paddingTop: insets.top}]}>
      <LatestHeader
        statusBarColor={'#FDFBFF'}
        title="Membership"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        upgradeMembership={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchMemberships}
          />
        }>
        <View style={{paddingHorizontal: 48, paddingVertical: 8}}>
          <Text style={styles.exploreText}>Active</Text>
        </View>

        {purchasedMemberships.length === 0 ? (
          <View style={styles.centered}>
            <NoData
              heading={'You dont have active memberships yet.'}
              buttonTitle={'Refresh'}
              onPress={fetchMemberships}
            />
          </View>
        ) : (
          <FlatList
            data={purchasedMemberships}
            renderItem={renderItem}
            keyExtractor={item => item?.id?.toString()}
            contentContainerStyle={{paddingBottom: 40}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActiveMembership;
