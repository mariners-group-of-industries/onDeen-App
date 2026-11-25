import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import Carousel, { Pagination } from 'react-native-snap-carousel';
import ImageViewing from 'react-native-image-viewing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar, Platform } from 'react-native';
import styles from './styles';

export default function SecondCarousel({ carouselData }) {
    const firstCarouselRef = useRef(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const { width: screenWidth } = Dimensions.get('window');
    const [fullscreenVisible, setFullscreenVisible] = useState(false);
    const images = Array.isArray(carouselData)
        ? carouselData.filter(item => typeof item === 'string' && item.trim())
        : [];

    if (images.length === 0) {
        return null;
    }

    const _renderItem1 = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setFullscreenVisible(true)}>
            <View style={styles.carouselItem} key={item.id}>
                <ImageBackground
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="cover">
                    {images.length > 1 && (
                        <View style={styles.paginationContainer}>
                            <View style={styles.paginationSubContainer}>
                                <Text style={styles.indexText}>
                                    {activeSlide + 1} / {images.length}
                                </Text>
                            </View>
                            <Pagination
                                dotsLength={images.length}
                                activeDotIndex={activeSlide}
                                containerStyle={styles.pagination}
                                dotStyle={styles.activeDot}
                                inactiveDotStyle={styles.inactiveDot}
                                inactiveDotOpacity={0.4}
                                inactiveDotScale={0.6}
                                animatedFriction={10}
                                animatedTension={200}
                                tappableDots={false}
                            />
                        </View>
                    )}
                </ImageBackground>
            </View>
        </TouchableOpacity>
    );

    return (
        <View>
            <Carousel
                ref={firstCarouselRef}
                data={images}
                renderItem={_renderItem1}
                sliderWidth={screenWidth}
                itemWidth={screenWidth}
                inactiveSlideScale={0.8}
                inactiveSlideOpacity={0.7}
                pagingEnabled={true}
                pinchGestureEnabled={true}
                onSnapToItem={index => {
                    setActiveSlide(index);
                }}
                useScrollView={true}
                getItemLayout={(data, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
                removeClippedSubviews={false}
                activeSlideAlignment="center"
                layout="default"
                windowSize={5}
                maxToRenderPerBatch={5}
                swipeThreshold={5}
                enableSnap={true}
                enableMomentum={false}
            />

            {/* Fullscreen Image Viewer */}
            {fullscreenVisible && (
                <View style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                    <ImageViewing
                        images={images.map((img) => ({ uri: img }))}
                        imageIndex={activeSlide}
                        visible={fullscreenVisible}
                        onRequestClose={() => {
                            setFullscreenVisible(false);
                            // Reset status bar when closing
                            StatusBar.setBarStyle('dark-content', true);
                            if (Platform.OS == 'android') {
                                StatusBar.setBackgroundColor('#ffffff', true);
                            }
                        }}
                        onImageIndexChange={(index) => {
                            setActiveSlide(index);
                            firstCarouselRef.current?.snapToItem(index);
                        }}
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            setFullscreenVisible(false);
                            // Reset status bar when closing
                            StatusBar.setBarStyle('dark-content', true);
                            if (Platform.OS == 'android') {
                                StatusBar.setBackgroundColor('#ffffff', true);
                            }
                        }}
                    >
                        <Ionicons name="arrow-back" size={30} color="white" />
                    </TouchableOpacity>

                    {/* Index Display */}
                    <View style={styles.indexContainer}>
                        <Text style={styles.indexText}>
                            {activeSlide + 1} / {images.length}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}
