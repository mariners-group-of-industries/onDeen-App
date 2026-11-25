import React, {useRef, useState} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  FlatList,
  Image,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import SearchBar from '../../components/searchBar';
import ListItem from '../../helpers/listItems';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GradientButton from '../../components/gradientButton';
import {useNavigation} from '@react-navigation/native';
import {
  homeCarouselData1,
  homeCarouselData2,
  homeData,
  searchResults,
} from '../../helpers/Constant';

const HomeScreen = () => {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const navigation = useNavigation();
  const firstCarouselRef = useRef(null);
  const secondCarouselRef = useRef(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredResults = searchResults.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const _renderItem1 = ({item}) => (
    <View style={styles.carouselItem}>
      <ImageBackground source={item.image} style={styles.carouselImage}>
        <View style={styles.touchableLabelContainer}>
          <TouchableLabel
            leftImage={require('../../assets/images/thunder.png')}
            label={'Filling Fast'}
            onPress={() => {}}
            containerStyle={styles.customLableCarouselContainer}
            labelStyle={styles.customLableCarousel}
          />
          <TouchableLabel
            label={'Unisex'}
            onPress={() => {}}
            containerStyle={styles.customLableCarouselContainer}
            labelStyle={styles.customLableCarousel}
          />
          <TouchableLabel
            label={'Paid Event'}
            onPress={() => {}}
            containerStyle={styles.customLableCarouselContainer}
            labelStyle={styles.customLableCarousel}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={[styles.heartIcon]}>
            <Image
              source={require('../../assets/images/heart.png')}
              resizeMode="contain"
              tintColor={'#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={['#FFAECC', '#FFD861']}
          style={styles.carouselGradient}>
          <View style={styles.carouselsubContainer}>
            <View>
              <View style={styles.dateIconContainer}>
                <Icon
                  name={'calendar-blank-outline'}
                  size={16}
                  color="#000000"
                />
                <Text style={styles.carouselDate}>{item.date}</Text>
              </View>
              <Text style={styles.carouselTitle}>{item.title}</Text>
              <TouchableLabel
                label={item.price}
                onPress={() => {}}
                labelStyle={styles.customLable}
                containerStyle={styles.customLabelContainer}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {}}
              style={styles.arrowContainer}>
              <Image
                source={require('../../assets/images/roundedArrow.png')}
                resizeMode="contain"
                style={styles.arrowImage}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  const _renderItem2 = ({item}) => (
    <View style={styles.carouselSecondaryItem}>
      <ImageBackground
        source={item.image}
        style={styles.carouselSecondaryImage}>
        <View style={styles.touchableLabelSecondaryContainer}>
          <TouchableLabel
            label={'Free'}
            onPress={() => {}}
            containerStyle={styles.customLableCarouselSecondaryContainer}
            labelStyle={styles.customLableSecondaryCarousel}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={[styles.heartIconSecondary]}>
            <Image
              source={require('../../assets/images/heart.png')}
              resizeMode="contain"
              tintColor={'#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.carouselSecondaryGradient}>
          <Image
            source={require('../../assets/images/newEvents.png')}
            resizeMode="contain"
          />
          <View style={styles.carouselsubSecondaryContainer}>
            <View style={styles.textContainer}>
              <View style={styles.dateIconContainer}>
                <Text style={styles.carouselDate}>{item.date}</Text>
              </View>
              <Text style={styles.carouselTitle}>{item.title}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
              <Image
                source={require('../../assets/images/roundedArrow.png')}
                resizeMode="contain"
                style={styles.arrowImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeholder="Search event, classes, Tour & meetups etc."
            onSearch={handleSearch}
            results={filteredResults}
            containerStyle={styles.searchBar}
            inputStyle={styles.searchInput}
            resultStyle={styles.searchResult}
            listStyle={styles.searchList}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.exploreText}>Explore top event by type</Text>
          <FlatList
            data={homeData}
            horizontal={true}
            renderItem={({item}) => (
              <ListItem
                name={item.name}
                image={item.image}
                onPress={() => {
                  navigation.navigate('Events', {
                    eventId: item.id,
                    eventName: item.name,
                  });
                }}
              />
            )}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={styles.topeventsContainer}>
          <View style={styles.upcomingContainer}>
            <Image
              source={require('../../assets/images/topEvents.png')}
              style={{width: '100%'}}
              resizeMode="contain"
            />
          </View>
          {/* Carousel Section */}
          <View style={styles.carouselContainer}>
            <Carousel
              ref={firstCarouselRef}
              data={homeCarouselData1}
              renderItem={_renderItem1}
              sliderWidth={screenWidth}
              itemWidth={screenWidth * 0.93}
              inactiveSlideScale={0.8}
              inactiveSlideOpacity={0.7}
              pagingEnabled={true}
              pinchGestureEnabled={true}
              removeClippedSubviews={true}
              onSnapToItem={index => setActiveSlide(index)}
              useScrollView={true}
              getItemLayout={(data, index) => ({
                length: screenWidth * 0.93,
                offset: screenWidth * 0.93 * index,
                index,
              })}
              layout="default"
              windowSize={5}
              maxToRenderPerBatch={5}
              swipeThreshold={5}
              enableSnap={true}
              enableMomentum={true}
            />
            <View style={styles.paginationContainer}>
              <View
                style={{
                  borderRadius: 50,
                  padding: 5,
                  backgroundColor: '#161616',
                }}>
                <Text style={styles.indexText}>{` ${activeSlide + 1} / ${
                  homeCarouselData1.length
                }`}</Text>
              </View>
              <Pagination
                dotsLength={homeCarouselData1.length}
                activeDotIndex={activeSlide}
                containerStyle={styles.pagination}
                dotStyle={styles.activeDot}
                inactiveDotStyle={styles.inactiveDot}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            </View>
          </View>
          <View style={styles.carouselSecondaryConatiner}>
            <View style={styles.popularContainer}>
              <View>
                <Text style={styles.popularText}>Popular events</Text>
                <Text style={styles.popularText}>this week</Text>
              </View>
              <View>
                <LinearGradient
                  colors={['#DB3171', '#FFCC33']}
                  start={{x: 0.5, y: 0}}
                  end={{x: 0.5, y: 1}}
                  style={styles.gradientBorder}>
                  <TouchableLabel
                    label={'VIEW ALL'}
                    onPress={() => {}}
                    containerStyle={styles.viewallContainer}
                    labelStyle={styles.viewallLabel}
                    rightImage={require('../../assets/images/arrow-up-right.png')}
                    rightImageStyle={{left: 4, height: 20, width: 20}}
                  />
                </LinearGradient>
              </View>
            </View>

            <Carousel
              ref={secondCarouselRef}
              data={homeCarouselData2}
              renderItem={_renderItem2}
              sliderWidth={screenWidth}
              itemWidth={screenWidth * 0.624}
              inactiveSlideScale={0.9}
              inactiveSlideOpacity={0.95}
              pinchGestureEnabled={true}
              removeClippedSubviews={true}
              useScrollView={true}
              getItemLayout={(data, index) => ({
                length: screenWidth * 0.624,
                offset: screenWidth * 0.624 * index,
                index,
              })}
              activeSlideAlignment="start"
              layout="default"
              windowSize={5}
              maxToRenderPerBatch={5}
              swipeThreshold={5}
              enableSnap={true}
              enableMomentum={true}
            />
          </View>
          <View style={styles.premiumContainer}>
            <View style={styles.premiumImageContainer}>
              <Image
                source={require('../../assets/images/premium.png')}
                resizeMode="contain"
              />
            </View>
            <View style={styles.txtbtnConatiner}>
              <Text style={styles.introText}>Introducing Ondeen +plus</Text>
              <Text style={styles.subscribeText}>Subscribe and unlock</Text>
              <Text style={styles.subscribeText}>premium features</Text>
              <GradientButton
                onPress={() => {}}
                title={'View Pricing'}
                containerStyle={styles.priceBtn}
                textStyle={styles.priceText}
              />
            </View>
          </View>
        </View>
        <View style={styles.exploreInterestContainer}>
          <Text style={styles.interestText}>Explore by interest</Text>
          <Text style={styles.topicText}>Select topic of your</Text>
          <Text style={styles.topicText}>interest in</Text>
          <View style={styles.interestLabelContainer}>
            <View style={styles.interesetFirstRow}>
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'Duas'}
                onPress={() => {}}
              />
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'Development'}
                onPress={() => {}}
              />
            </View>
            <View style={styles.interesetSecondRow}>
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'Career'}
                onPress={() => {}}
              />
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'FINANCE'}
                onPress={() => {}}
              />
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'LIFESTYLE'}
                onPress={() => {}}
              />
            </View>
            <View style={styles.interesetThirdRow}>
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'TEACHING'}
                onPress={() => {}}
              />
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'Health & fitness'}
                onPress={() => {}}
              />
            </View>
            <View style={styles.interesetFourthRow}>
              <TouchableLabel
                containerStyle={styles.interestLabel}
                labelStyle={styles.interestLabelText}
                label={'Personal development'}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
