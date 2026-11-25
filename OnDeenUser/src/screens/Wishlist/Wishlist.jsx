import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import styles from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWishlistAPI } from '../../redux/slices/wishlistSlice';
import NoData from '../../components/NoData';
import { RefreshControl } from 'react-native-gesture-handler';
import LatestHeader from '../../components/LatestHeader';
import { fontScale } from '../../helpers/scale';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import Loader from '../../components/loader';
import { clearLastEventId } from '../../helpers/storage';
import WishlistCart from './WishlistCart';

const Wishlist = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loader

  const wishlist = useSelector((state) => state.wishlist?.wishlist || []);
  const isSkippedLogin = useSelector((state) => state.user.isSkippedLogin);

  useEffect(() => {
    if (isSkippedLogin) {
      dispatch(setIsSkippedLogin(false));
      dispatch(setLoginState(false));
      clearLastEventId();
      dispatch(logout());
    }
  }, [isSkippedLogin, navigation]);

  const hitapitogetdatafilter = useCallback(async (showRefresh = true) => {
    if (showRefresh) {
      setRefreshing(true);
    }
    try {
      await dispatch(getWishlistAPI());
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter(false);
      return () => { };
    }, [hitapitogetdatafilter]),
  );

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBackgroundColor('#fff');
      return () => { 
        StatusBar.setBackgroundColor('#fff');
      };
    }, []),
  );


  const ContainerComponent = SafeAreaView;
  const wishlistItems = useMemo(() => {
    const groups = [
      wishlist?.wishlist,
      wishlist?.tour_wishlist,
      wishlist?.course_wishlist,
    ];
    const uniqueItems = new Map();

    groups.forEach(group => {
      if (!Array.isArray(group)) {
        return;
      }
      group.forEach((item, index) => {
        const key = String(item?.id ?? item?.event_id ?? `${item?.title || 'event'}-${index}`);
        if (!uniqueItems.has(key)) {
          uniqueItems.set(key, item);
        }
      });
    });

    return Array.from(uniqueItems.values());
  }, [wishlist]);

  if (initialLoading) {
    return (
      <ContainerComponent style={[{ flex: 1, backgroundColor: '#fff' }]}>
        <LatestHeader
          statusBarColor="#fff"
          title="Wishlist"
          leftIconName="chevron-left"
          onLeftPress={() => navigation.goBack()}
          titleStyle={{
            color: '#000000',
            fontSize: fontScale(16),
          }}
        />
        <Loader
          isLoading={true}
          containerStyle={{ backgroundColor: '#fff' }}
          animationSource={require('../../assets/loader.json')}
        />
      </ContainerComponent>
    );
  }

  return (
    <ContainerComponent style={[{ flex: 1, backgroundColor: '#fff' }]}>
      <LatestHeader
        statusBarColor="#fff"
        title="Wishlist"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          alignItems: wishlistItems.length > 0 ? 'flex-start' : 'center',
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 2,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter}
          />
        }>
        {wishlistItems.length > 0 && (
            <View style={styles.carouselContainer}>
              <WishlistCart data={wishlistItems} navigation={navigation} />
            </View>
          )}

        {wishlistItems.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12 }}>
            <NoData
              title={'Please add Items to your wishlist'}
              heading={'NO EVENTS FOUND'}
              onPress={() => {
                navigation.navigate('Homewithroute');
              }}
              buttonTitle={'Explore Events'}
            />
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
    </ContainerComponent>
  );
};

export default Wishlist;
