import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './styles';
import CustomHeader from '../../components/customHeader';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import TouchableLabel from '../../components/customLabels';
import Trenddown from '../../assets/svg/trenddownprofile.svg';
import Calendarheart from '../../assets/svg/calendarheart.svg';
import Graduationhat from '../../assets/svg/graduationhat.svg';
import { useDispatch, useSelector } from 'react-redux';
import { getDatewithmonthname } from '../../common/datetimeformate';
import { getProfileDetails } from '../../redux/slices/getprofileSlice';
import { fontFamilies } from '../../assets/themes/fonts';

const ProfileScreen = () => {
  const [tab, setTab] = useState(1);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    hitapitogetdatafilter();
  }, []);

  const hitapitogetdatafilter = async () => {
    setRefreshing(true);
    dispatch(getProfileDetails());
    setRefreshing(false);
  };

  const { profiledatails } = useSelector((state) => state.profiledatails);
  useFocusEffect(
    React.useCallback(() => {
      hitapitogetdatafilter();
      return () => { };
    }, [])
  );

  const insets = useSafeAreaInsets();

  const navigatetCreateAccount = () => {
    navigation.navigate('CreateAccount', {
      mobile_number: profiledatails?.mobile_number,
      country_code: profiledatails?.country_code,
      cca2: profiledatails?.cca2,
      latitude: '',
      longitude: '',
      address: '',
      update: true,
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 12,
          backgroundColor: '#FFF',
        },
      ]}
    >
      <CustomHeader
        statusBarColor="#FFE5EF"
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        secondRightImageStyle={styles.containerImageEdit}
        title="Organizer profile"
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        showforeventDetails={true}
        secondRightImageSource={'2'}
        profiledots={true}
        containerStyle={{
          paddingVertical: heightScale(5),
          justifyContent: 'space-between',
        }}
        onClickAskedQuestion={() => { }}
        editEvent={() => { }}
        cencelEvent={() => { }}
        endEvent={() => { }}
      />

      {/* Add RefreshControl to ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        backgroundColor={'#FFF'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={hitapitogetdatafilter} // Call your refresh function
            colors={['#DF416B']} // Set color of the spinner
          />
        }
      >
        <View
          style={{
            backgroundColor: '#FFF',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={() => navigatetCreateAccount()}>
              <Image
                style={styles.profile}
                source={{
                  uri: profiledatails?.profile_image || profiledatails?.profile_image,
                }}
              />
            </TouchableOpacity>
            <Text style={styles.speakerName}>{profiledatails?.organization_name} </Text>
            <View style={styles.addressContainer}>
              <Text style={styles.speakerTitle}> {profiledatails?.email_id}</Text>
            </View>
            <Text style={styles.speakerTitle}>
              {' '}
              {profiledatails?.country_code} {profiledatails?.mobile_number}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: widthScale(24),
              gap: 4,
              backgroundColor: '#FFF',
            }}
          >
            <View style={styles.levelContainer}>
              <View style={styles.levelSubContainer}>
                <View style={styles.journeyLevelContainer}>
                  <Text style={styles.journeyLevelHeading}>Tickets {'\n'}sold</Text>
                  <Trenddown />
                </View>
                <Text style={styles.journeyLevelLabel}>{profiledatails?.ticket_solds}</Text>
              </View>
            </View>
            <View style={styles.levelContainer}>
              <View
                style={[
                  styles.levelSubContainer,
                  { backgroundColor: '#FFF4D4' },
                ]}
              >
                <View style={styles.journeyLevelContainer}>
                  <Text style={styles.journeyLevelHeading}>Events {'\n'}created</Text>
                  <Calendarheart />
                </View>
                <Text style={styles.journeyLevelLabel}>{profiledatails?.event_created}</Text>
              </View>
            </View>
            <View style={styles.levelContainer}>
              <View style={styles.levelSubContainer}>
                <View style={styles.journeyLevelContainer}>
                  <Text style={styles.journeyLevelHeading}>Total {'\n'}Courses</Text>
                  <Graduationhat />
                </View>
                <Text style={styles.journeyLevelLabel}>{profiledatails?.total_cources}</Text>
              </View>
            </View>
          </View>
        </View>
        <>
          <Text style={styles.reviewsLabel}>PROFILE INFO</Text>
          <View style={{ margin: 8 }}>
            <View style={styles.reviewsContainer}>
              <View style={{ flexDirection: 'row', justifyContent: "flex-end" }}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.ratingContent}>Manager Name</Text>
                  <Text style={styles.ratingHeading}>{profiledatails?.manager_name}</Text>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.ratingContent}>Contact No.</Text>
                  <Text style={styles.ratingHeading}>{profiledatails?.mobile_number}</Text>
                </View>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Address</Text>
                <Text style={styles.ratingHeading}>{profiledatails?.location}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Organization Foundation date</Text>
                <Text style={styles.ratingHeading}>{getDatewithmonthname(profiledatails?.foundation_date)}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Post Code</Text>
                <Text style={styles.ratingHeading}>{profiledatails?.post_code}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Which sect best represents your organization?</Text>
                <Text style={styles.ratingHeading}>{profiledatails?.school_thought}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Which of the following best represents your organization?</Text>
                <Text style={styles.ratingHeading}>{profiledatails?.sect_representation}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>

            <View style={styles.reviewsContainer}>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingContent}>Registered Charity No.</Text>
                <Text style={styles.ratingHeading}>{profiledatails?.charity_no}</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}><View style={styles.separatorLine} /></View>
          </View>
        </>
        <>
          <Text style={styles.reviewsLabel}>ADDITIONAL INFORMATIONS</Text>
          <View style={{ margin: 8 }}>
            {Array.isArray(profiledatails?.categories) && (
              <>
                <Text style={[styles.ratingHeading, { paddingHorizontal: widthScale(21), paddingBottom:3, marginBottom: -20, fontFamily: fontFamilies.SFProRoundedBlackSemiBold, }]}>CATEGORY SUBCATEGORY</Text>
                <View style={[styles.reviewsContainer, { flexDirection: 'column', gap: 0 }]}>
                  {profiledatails?.categories?.map((category) => (
                    <View style={{ gap: 4 }} key={category.category_id}>
                      <Text style={styles.ratingHeading}>{category.category_name}</Text>
                      {category.subcategories.map((subcategory) => (
                        <View style={[styles.ratingContainer, { marginTop: 0, marginHorizontal: 0, paddingVertical: 4 }]} key={subcategory.subcategory_id} >
                          <Text style={styles.ratingHeading}>{subcategory.subcategory_name}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          <View style={{ margin: 8 }}>
            {Array.isArray(profiledatails?.categories) && (
              <>
                <Text style={[styles.ratingHeading, { paddingLeft: 18, paddingHorizontal: widthScale(21), marginBottom: -20, fontFamily: fontFamilies.SFProRoundedBlackSemiBold, }]}>QUESTION & ANSWER</Text>
                <View style={[styles.reviewsContainer, { flexDirection: 'column', gap: 0 }]}>
                  {profiledatails?.additional_information?.map((info) => (
                    <View style={{ gap: 4 }} key={info.question_id}>
                      <Text style={styles.ratingContent}>{info.question}</Text>
                      <Text style={styles.ratingHeading}>{info.answer}</Text>
                      <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </>
        <>
          <Text style={styles.reviewsLabel}>REVIEWS</Text>
          <View style={{ margin: 8 }}>
            <View style={styles.ratingContainer}>
              <Text style={styles.organizationName}>Salman habibi</Text>
              <Text>8 reviews</Text>
            </View>
            <View style={styles.reviewsContainer}>
              <View style={{}}>
                <TouchableLabel
                  label={'T'}
                  onPress={() => { }}
                  containerStyle={{
                    backgroundColor: '#F0F0F0',
                  }}
                  labelStyle={{}}
                />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingHeading}>Worth it</Text>
                <Text style={styles.ratingContent}>
                  Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                  com modo consequat.
                </Text>
                <Text style={styles.ratingPerson}>Taniya</Text>
              </View>
            </View>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
            </View>
            <View style={styles.reviewsContainer}>
              <View style={{}}>
                <TouchableLabel
                  label={'A'}
                  onPress={() => { }}
                  containerStyle={{
                    backgroundColor: '#E9E1FF',
                  }}
                  labelStyle={{}}
                />
              </View>
              <View style={{ gap: 4 }}>
                <Text style={styles.ratingHeading}>Great event, good staff</Text>
                <Text style={styles.ratingContent}>
                  Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                  com modo consequat.
                </Text>
                <Text style={styles.ratingPerson}>Anonymous</Text>
              </View>
            </View>
          </View>
        </>
      </ScrollView>
    </SafeAreaView >
  );
};

export default ProfileScreen;