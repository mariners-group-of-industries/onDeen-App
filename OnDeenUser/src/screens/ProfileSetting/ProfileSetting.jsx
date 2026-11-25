import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout, setIsSkippedLogin, setLoginState } from '../../redux/slices/loginSlice';
import Logout from '../../assets/svg/logout.svg';
import Webcam from '../../assets/svg/webcam.svg';
import Privacy from '../../assets/svg/shield.svg';
import EditProfile from '../../assets/svg/user.svg';
import Triangle from '../../assets/svg/triangle.svg';
import Help from '../../assets/svg/help.svg';
import Bg from '../../assets/svg/Layer_1.svg';
import { resetOtpState } from '../../redux/slices/verifyOtpSlice';
import { resetRegisterState } from '../../redux/slices/registerUserSlice';
import { resetProfileState } from '../../redux/slices/profileSlice';
import { logoutUser } from '../../redux/slices/logoutSlice';
import { persistor } from '../../redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import LatestHeader from '../../components/LatestHeader';
import GuestModal from '../../modals/guestModal';
import styles from './styles';
import { clearLastEventId } from '../../helpers/storage';
import { deleteAccount } from '../../redux/slices/deleteAccountSlice';
import Toast from '../../components/toastMessage';
import Loader from '../../components/loader';
import { useStatusBar } from '../../components/statusbar';
import { useToastForPopup } from '../../context/ToastContext';
import { userLogout } from '../../redux/callapis/CommonService';
import { fontColor } from '../../../assets/fonts/fonts';

const ProfileSettings = () => {
  useStatusBar({ backgroundColor: fontColor.LITETHEME, barStyle: 'dark-content' });
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { message, status } = useSelector(
    (state) => state.deleteAccountSlice,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleDelete, setIsModalVisibleDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useToastForPopup();

  const handleLogout = async () => {
    logoutAndRemoveFCMToken()
    // dispatch(logoutUser());
    await AsyncStorage.removeItem('isNewUser');
    await AsyncStorage.removeItem('otherData');
    dispatch(resetOtpState());
    dispatch(resetRegisterState());
    dispatch(resetProfileState());
    await clearLastEventId();
    dispatch(logout());
    await persistor.purge();
    toggleModal();
    // navigation.replace('Signup'); // Navigate to Login screen after logout
  };

  const handleDelete = async () => {
    logoutAndRemoveFCMToken()
    await dispatch(deleteAccount());
    setIsModalVisibleDelete(false)
    showToast(message);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Proceed with the rest of the logout flow
    // dispatch(logoutUser());
    await AsyncStorage.removeItem('isNewUser');
    await AsyncStorage.removeItem('otherData');
    dispatch(resetOtpState());
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    dispatch(resetRegisterState());
    dispatch(resetProfileState());
    await clearLastEventId();
    dispatch(logout());
    await persistor.purge();
    // navigation.replace('Signup'); // Navigate to login screen
  };

  const logoutAndRemoveFCMToken = async () => {
    try {
      // const data = {
      //   "push_token": ftoken
      // };
      const resultAction = await userLogout();
      if (resultAction?.status) {
        // showToast(resultAction?.message || 'Added Successfully');
      } else {
        // showToast(resultAction?.message || 'Failed');
      }
    } catch (err) {
      console.log(err, 'err');
      showToast(typeof err == 'string' ? err : 'Unexpected error');
    }
  }


  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleModalDelete = () => {
    setIsModalVisibleDelete(!isModalVisibleDelete);
  };

  // const handlemyMembership = () => {
  //   navigation.navigate('MyMembership');
  // };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlePrivacySetting = () => {
    navigation.navigate('PrivacySetting');
  };
    const handleContactSupport = () => {
    navigation.navigate('HelpSupportPage');
  };

      const handleReportBug = () => {
    navigation.navigate('ReportBug');
  };

  const handlemyMembership = () => {
    navigation.navigate('OneToOneSession');
  };

  if (status == 'loading') {
    return (
      <Loader />
    );
  }
  const ContainerComponent = SafeAreaView;

  return (
    <ContainerComponent style={styles.container}>
      <LatestHeader
        statusBarColor="#F9F6FD"
        title="Profile"
        // secondRightImageSource={'2'}
        containerStyle={{
          paddingVertical: heightScale(5),
          justifyContent: 'space-between',
        }}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        onClickAskedQuestion={() => navigation.goBack()}
        editEvent={() => navigation.goBack()}
        cencelEvent={() => navigation.goBack()}
        endEvent={() => navigation.goBack()}
        eventsdots={true}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        showforeventDetails={true}
      />
      <Toast message={toastMessage} />
      <TouchableOpacity
        onPress={handleEditProfile}
        activeOpacity={0.7}
        style={styles.editProfileContainer}>
        <EditProfile />
        <Text style={styles.editprofileText}>Edit profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handlemyMembership}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Webcam />
        <Text style={styles.editprofileText}>One-to-One Session</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChangePassword')}
        style={styles.editProfileCommonContainer}>
        <EditProfile />
        <Text style={styles.editprofileText}>Change password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePrivacySetting}
        style={styles.editProfileCommonContainer}>
        <Privacy />
        <Text style={styles.editprofileText}>Privacy setting</Text>
      </TouchableOpacity>
            <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleContactSupport}
        style={styles.editProfileCommonContainer}>
        <Help />
        <Text style={styles.editprofileText}>Help & Support</Text>
      </TouchableOpacity> 
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleReportBug}
        style={styles.editProfileCommonContainer}>
        <Triangle />
        <Text style={styles.editprofileText}>Report an issue</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Help />
        <Text style={styles.editprofileText}>Help & Support</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        onPress={() => {
          navigation.navigate('ActiveMembership');
        }}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <AppVersion />
        <Text style={styles.editprofileText}>My Active Membership</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        onPress={toggleModal}
        // onPress={()=>{}}
        activeOpacity={0.7}
        style={styles.editProfileCommonContainer}>
        <Logout />
        <Text style={styles.editprofileText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={toggleModalDelete}
        activeOpacity={0.7}
        style={styles.deleteAccountContainer}>
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
      <GuestModal
        isVisible={isModalVisible}
        title="Confirm Logout"
        message="Are you sure you want to log out? This action cannot be undone."
        onCancel={toggleModal}
        onConfirm={handleLogout}
      />
      <GuestModal
        isVisible={isModalVisibleDelete}
        title="Delete Account"
        message="Are you sure you want to Delete this Account? This action cannot be undone."
        onCancel={toggleModalDelete}
        onConfirm={handleDelete}
      />

      <Bg style={styles.logoImage} />
    </ContainerComponent>
  );
};

export default ProfileSettings;
