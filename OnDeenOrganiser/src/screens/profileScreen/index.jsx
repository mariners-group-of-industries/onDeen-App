import React, { useEffect, useState } from 'react';
import {View, Text, Image, TouchableOpacity, Alert, ScrollView, RefreshControl} from 'react-native';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {logout} from '../../redux/slices/loginSlice';
import Info from '../../assets/svg/setting/info.svg';
import Lifebuoy from '../../assets/svg/setting/lifebuoy.svg';
import Login from '../../assets/svg/setting/login.svg';
import Shield from '../../assets/svg/setting/shield.svg';
import User from '../../assets/svg/setting/user.svg';
import { cleangetprofile, getProfileDetails } from '../../redux/slices/getprofileSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = () => {
  
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          await AsyncStorage.removeItem('isNewUser');
          await AsyncStorage.removeItem('otherData');
          dispatch(cleangetprofile());
          dispatch(logout());
          // navigation.navigate('Login');
        },
      },
    ]);
  };



  const [tab, setTab] = useState(1)
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    hitapitogetdata();
  }, []);

  const hitapitogetdata = async () => {
    setRefreshing(true);
    dispatch(getProfileDetails());
    setRefreshing(false);
  };

 
  const { profiledatails } = useSelector((state) => state.profiledatails);
  
  return (
    <View style={styles.container}>
     < ScrollView refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={hitapitogetdata}
        />
      } style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Settings</Text>
      <TouchableOpacity
        accessibilityLabel="Manage one-to-one sessions"
        accessibilityRole="button"
        onPress={() => navigation.navigate('OneToOneSessions')}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Icon name="account-clock-outline" size={22} color="#161616" />
        <Text style={styles.editprofileText}>One-to-One Sessions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel="Manage notification preferences"
        accessibilityRole="button"
        onPress={() => navigation.navigate('NotificationPreferences')}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Icon name="bell-outline" size={22} color="#161616" />
        <Text style={styles.editprofileText}>Notification preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel="Manage Speakers"
        accessibilityRole="button"
        onPress={() => navigation.navigate('SpeakerManagement')}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Icon name="account-group-outline" size={22} color="#161616" />
        <Text style={styles.editprofileText}>Speakers</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ProfileScreen');
        }}
        activeOpacity={0.7}
        style={styles.editProfileContainer}>
        <User />
        <Text style={styles.editprofileText}>View Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          // navigation.navigate('ProfileScreen');
        }}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Shield />
        <Text style={styles.editprofileText}>Privacy setting</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          // navigation.navigate('ProfileScreen');
        }}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Lifebuoy />
        <Text style={styles.editprofileText}>Help & Support</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Info />
        <Text style={styles.editprofileText}>App Version</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Login />
        <Text style={styles.editprofileText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

export default ProfileScreen;
