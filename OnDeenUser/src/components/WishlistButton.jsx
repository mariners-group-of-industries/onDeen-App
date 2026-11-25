import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlistAPI, getWishlistAPI } from '../redux/slices/wishlistSlice';
import Toast from './toastMessage';
import HeartIcon from '../../src/assets/svg/mainpageheart.svg';
import HeartNew from '../../src/assets/svg/heartNew.svg';
import { fetchEventById, fetchOrganizerById } from '../redux/slices/eventsSlice';
import { fetchHomepageData } from '../redux/slices/homepageSlice';
import { fetchSpeakerById } from '../redux/slices/speakerSlice';
import { logout, setIsSkippedLogin, setLoginState } from '../redux/slices/loginSlice';
import GuestModal from '../modals/guestModal';
import { clearLastEventId } from '../helpers/storage';

const WishlistButton = ({ item, IsScreen, heartIconSecondary, type = '', handleRefresh, organizerid = '', speackerid = '' }) => {
  const [selectid, setselectid] = useState(item?.is_wishlisted == 1 ? item?.id : 0);
  const [toastMessage, setToastMessage] = useState(null);
  const [isGuestModalVisible, setIsGuestModalVisible] = useState(false); // Manage modal visibility
  const isSkippedLogin = useSelector((state) => state?.user?.isSkippedLogin);
  const dispatch = useDispatch();
  const handleAddToWishlist = async () => {
    const previousId = selectid;
    const nextId = selectid == item?.id ? 0 : item?.id;
    setselectid(nextId);

    try {
      const response = await dispatch(addToWishlistAPI({ event_id: item?.id, type }));
      if (response?.payload?.status) {
        if (type === 'homepage') {
          dispatch(fetchHomepageData());
        } else if (type === 'eventbyid') {
          dispatch(fetchEventById(item?.id));
        } else if (type === 'allevents') {
          await handleRefresh();
        } else if (type === 'organizerid') {
          dispatch(fetchOrganizerById(organizerid));
        } else if (type === 'speackerid') {
          dispatch(fetchSpeakerById(speackerid));
        } else if (type === 'wishlist') {
          dispatch(getWishlistAPI());
        }
        return;
      }
      setselectid(previousId);
      setToastMessage(
        response?.payload?.response?.message ||
        response?.payload?.message ||
        'Unable to update wishlist',
      );
    } catch (error) {
      setselectid(previousId);
      setToastMessage('Unable to update wishlist');
    }
  };

  const handleCancel = () => {
    setIsGuestModalVisible(false);
  };

  const handleConfirmLogout = async () => {
    setIsGuestModalVisible(false);
    dispatch(setIsSkippedLogin(false));
    dispatch(setLoginState(false));
    await clearLastEventId();
    dispatch(logout());
  };

  useEffect(() => {
    setselectid(item?.is_wishlisted == 1 ? item?.id : 0);
  }, [item?.is_wishlisted]);

  return (
    <>
      <Toast message={toastMessage} />
      <TouchableOpacity
        accessibilityLabel={selectid === item?.id ? 'Remove from wishlist' : 'Add to wishlist'}
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={() => {
          if (isSkippedLogin) {
            setIsGuestModalVisible(true);
            return;
          }
          else {
            handleAddToWishlist();
          }
        }}
        style={[styles.heartIcon, heartIconSecondary]}
      >
        {IsScreen === 'coursedetails' ? (
          <HeartNew
            width={24}
            height={24}
            fill={selectid === item?.id ? '#DB3171' : 'transparent'}
          />
        ) : (
          <HeartIcon
            width={24}
            height={24}
            fill={selectid === item?.id ? '#DB3171' : 'transparent'}
          />
        )}
      </TouchableOpacity>
      <GuestModal
        isVisible={isGuestModalVisible}
        title="Confirm Login"
        message="You are currently using the app in guest mode. To access all features, please log in."
        onCancel={handleCancel}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  heartIcon: {
    // width: 36,
    // height: 36,
    // justifyContent: 'center',
    // alignItems: 'center',
    // borderRadius: 32,
    // bottom: 6,
    // backgroundColor: '#00000066',
  },
});

export default WishlistButton;
