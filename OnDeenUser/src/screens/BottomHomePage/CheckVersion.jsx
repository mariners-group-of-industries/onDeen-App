import React, { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import VersionUpdateModal from './VersionUpdateModal';
import { checkVersionApi } from '../../redux/callapis/CommonService';
import DeviceInfo from 'react-native-device-info';
import { ENABLE_VERSION_UPDATE_CHECK } from '../../helpers/Constant';

const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.ondeen.user&pcampaignid=web_share';
const APP_STORE_LINK = 'https://apps.apple.com/us/app/ondeen/id6740039443?uo=2';

export default function CheckVersion() {
  const [showModal, setShowModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);

  const checkAppVersion = async () => {
    if (!ENABLE_VERSION_UPDATE_CHECK) {
      return;
    }

    const currentVersion = DeviceInfo.getVersion();

    const payload =
      Platform.OS === 'android'
        ? { android_version: currentVersion }
        : { ios_version: currentVersion };

    try {
      const res = await checkVersionApi({ data: payload });

      const {
        android_update,
        force_android_update,
        ios_update,
        force_ios_update,
      } = res?.response || {};

      const isForceUpdate =
        (Platform.OS === 'android' && force_android_update === '1') ||
        (Platform.OS === 'ios' && force_ios_update === '1');

      const isOptionalUpdate =
        (Platform.OS === 'android' && android_update === '1') ||
        (Platform.OS === 'ios' && ios_update === '1');

      if (isForceUpdate) {
        setForceUpdate(true);
        setShowModal(true);
      } else if (isOptionalUpdate) {
        setForceUpdate(false);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (error) {
      console.error('🚨 Version check failed:', error);
    }
  };

  useEffect(() => {
    if (!ENABLE_VERSION_UPDATE_CHECK) {
      return;
    }

      checkAppVersion();
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
      <VersionUpdateModal
        visible={showModal}
        forceUpdate={forceUpdate}
        onUpdate={handleUpdatePress}
        onLater={handleLaterPress}
      />
  );
}
