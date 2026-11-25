import React, { useEffect, useState } from 'react';
import { Platform, Linking, View, Button } from 'react-native';
import { useSelector } from 'react-redux';
import { checkVersionApi } from '../../redux/callapis/CommonService';
import VersionUpdateModal from './VersionUpdateModal';
import { ENABLE_VERSION_UPDATE_CHECK } from '../../helpers/Constant';

// Replace with your actual version info
const CURRENT_ANDROID_VERSION = '1.1.1';
const CURRENT_IOS_VERSION = '1.1';

// Replace with your actual app store links
const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.yourapp';
const APP_STORE_LINK = 'https://apps.apple.com/app/idXXXXXXXXX';

export default function CheckVersionUpdate() {
  const isSkippedLogin = useSelector((state) => state?.user?.isSkippedLogin);

  const [showModal, setShowModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const checkAppVersion = async () => {
    if (!ENABLE_VERSION_UPDATE_CHECK) {
      return;
    }

    const payload =
      Platform.OS === 'android'
        ? { android_version: CURRENT_ANDROID_VERSION }
        : { ios_version: CURRENT_IOS_VERSION };

    try {
      const res = await checkVersionApi({ data: payload });

      const {
        android_update,
        force_android_update,
        ios_update,
        force_ios_update,
      } = res?.response || {};

      const shouldUpdate =
        (Platform.OS === 'android' && android_update === '1') ||
        (Platform.OS === 'ios' && ios_update === '1');

      const isForce =
        (Platform.OS === 'android' && force_android_update === '1') ||
        (Platform.OS === 'ios' && force_ios_update === '1');

      if (shouldUpdate || isForce) {
        setForceUpdate(isForce);
        setShowModal(true);
      } else {
        console.log('✅ App is up to date.');
      }
    } catch (error) {
      console.error('🚨 Version check failed:', error);
    }
  };

  useEffect(() => {
    if (!ENABLE_VERSION_UPDATE_CHECK) {
      return;
    }

    if (!isSkippedLogin) {
      checkAppVersion();
    }
  }, []);

  if (!ENABLE_VERSION_UPDATE_CHECK) {
    return null;
  }

  const handleUpdatePress = () => {
    const storeLink = Platform.OS === 'android' ? PLAY_STORE_LINK : APP_STORE_LINK;
    Linking.openURL(storeLink).catch(err =>
      console.error('❌ Could not open store link:', err)
    );
  };

  const handleLaterPress = () => {
    setShowModal(false);
  };

  return (
    <View style={{backgroundColor:'red',height:300}}>
      {/* Manual trigger button */}
      <Button title="Check for Update" onPress={checkAppVersion} />

      {/* Update modal */}
      <VersionUpdateModal
        visible={showModal}
        forceUpdate={forceUpdate}
        onUpdate={handleUpdatePress}
        onLater={handleLaterPress}
      />
    </View>
  );
}
