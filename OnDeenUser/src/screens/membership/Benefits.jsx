import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import Benefi from '../../assets/svg/benefits.svg';
import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '../../components/gradientButton';
import { useDispatch } from 'react-redux';
import { membershipPurchase } from '../../redux/slices/membershipSlice';
import VerificationScreen from './VerificationScreen';
import Toast from '../../components/toastMessage';
import { useToastForPopup } from '../../context/ToastContext';

export default function Benefits({ selectmembership }) {
  const id = selectmembership?.id;
  const [showAll, setShowAll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [model, setModel] = useState(false);
  const [responce, setResponce] = useState(null);
  const [responcedata, setResponcedata] = useState(null);

  // const displayedBenefits = showAll ? benefits : benefits.slice(0, 5);
  const dispatch = useDispatch();
  const showToast = useToastForPopup();

  const firstMembership = Array.isArray(selectmembership) ? selectmembership[0] : selectmembership;
  const currentMembership = firstMembership || selectmembership;


  const stripHtmlTags = htmlString => {
    return htmlString
      .replace(/<\/?(p|br)[^>]*>/g, '\n') // Replace <p> and <br> with newline
      .replace(/<[^>]+>/g, '') // Remove any other HTML tags
      .split('\n') // Split into array based on new lines
      .map(item => item.trim()) // Trim extra spaces
      .filter(item => item); // Remove empty values
  };

  const benefits = useMemo(() => {
    if (!currentMembership?.description) return [];
    return stripHtmlTags(currentMembership.description);
  }, [currentMembership?.description]);

  const MINIMUM_EXPANDABLE_LENGTH = 4; // Show "View More" only if more than 4 benefits
  const shouldShowToggle = benefits.length > MINIMUM_EXPANDABLE_LENGTH;

  const previewBenefits = benefits.slice(0, 3);
  const displayedBenefits = showAll ? benefits : previewBenefits;

  // Hide section entirely if there’s no valid description
  // if (benefits.length === 0) {
  //   return null;
  // }


  const handlePurchase = () => {
    dispatch(membershipPurchase({ id }))
      .unwrap()
      .then(res => {
        setResponcedata(res);
        if (res?.status === true) {
          setResponce(res?.message || 'Membership purchased successfully');
          setModel(true);
          showToast(res?.message || 'Membership purchased successfully');
        } else {
          setResponce(res?.message || 'Something went wrong');
          setModel(true);
          showToast(res?.message || 'Something went wrong');
        }
      })
      .catch(error => {
        setResponce(error || 'Something went wrong');
        setModel(true);
        showToast(error || 'Something went wrong');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Premium Benefits</Text>
      <Modal
        animationType="none"
        transparent={true}
        visible={model}
        statusBarTranslucent
        onRequestClose={() => {
          setModel(!model);
        }}>
        <VerificationScreen
          responcedata={responcedata}
          responce={responce}
          setModel={setModel}
        />
      </Modal>
      <LinearGradient
        colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBorder}>
        <LinearGradient
          colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.itemContainer]}
          activeOpacity={0.7}>
          <View style={styles.benefitsContainer}>
            {benefits.length > 0 ? (
              benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Benefi size={40} />
                  <Text style={styles.benefitItem}>{benefit.trim()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBenefits}>No benefits available</Text>
            )}
          </View>
        </LinearGradient>
      </LinearGradient>
      {shouldShowToggle && (
        <View style={styles.infoBtnContainer}>
          <Pressable
            onPress={() => setShowAll(!showAll)}
            style={styles.viewallContainer}>
            <Text style={styles.viewallLabel}>
              {showAll ? 'View Less' : 'View More'}
            </Text>
          </Pressable>
        </View>
      )}
      <View
        style={{
          backgroundColor: '#FDFBFF',
          marginTop: 28,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <GradientButton
          containerStyle={{
            borderRadius: 24,
            paddingVertical: heightScale(16),
            paddingHorizontal: widthScale(24),
            gap: 4,
          }}
          onPress={handlePurchase}
          title={'Upgrade Now'}
          colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
          start={{ x: -1.39, y: 0 }}
          end={{ x: 2.39, y: 1 }}
          textStyle={styles.buttonText}
        />
        <Text
          style={{
            fontFamily: fontFamilies.SFProRoundedBlackRegular,
            color: '#565656',
            fontSize: fontScale(12),
            lineHeight: 20,
          }}>
          All payments are secured, Cancel anytime!
        </Text>
      </View>
      <Toast message={toastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  itemContainer: {
    borderRadius: 24,
  },
  header: {
    marginBottom: 10,
    color: '#F2954A',
    fontSize: fontScale(18),
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 20,
  },
  benefitsContainer: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  benefitItem: {
    color: '#161616',
    paddingLeft: 10,
    fontSize: fontScale(12),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    paddingTop: 4,
    // lineHeight:14
  },
  viewallLabel: {
    fontSize: fontScale(12),
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    lineHeight: 12,
    textAlign: 'center',
  },
  viewallContainer: {
    height: heightScale(28),
    width: widthScale(114),
    borderRadius: widthScale(90),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FDFBFF',
    gap: 4,
    borderWidth: 1,
    borderColor: '#DB3171',
    alignSelf: 'center',
    marginTop: 10, // Ensuring button is not at the edge
  },
  gradientBorder: {
    borderRadius: widthScale(24),
    padding: widthScale(1.3),
  },
  infoBtnContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Dimensions.get('window').height * 0.16,
    zIndex: 1,
  },
  buttonText: {
    fontSize: fontScale(16),
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    color: '#FFFFFF',
    lineHeight: 18,
  },
});
