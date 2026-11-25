import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { TouchableOpacity, ImageBackground, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableLabel from '../../components/customLabels';
import WishlistButton from '../../components/WishlistButton';
import ImageWithFallback from '../../components/ImageWithFallback';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';

const WishlistCart = ({ data }) => {
    const navigation = useNavigation()

    const formatDate = dateString => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const _renderItem = useMemo(() => {
        return ({ item }) => {
            const imageSource = item?.primary_image
                ? { uri: item?.primary_image }
                : require('../../assets/images/dummy1.png');
            const formattedStartDate = item?.start_date
                ? formatDate(item?.start_date)
                : null;
            const handleEventPress = () => {
                navigation.navigate('CourseDetails', {
                    eventId: item?.id,
                    eventName: item?.title,
                });
            };

            return (
                <TouchableOpacity
                    accessible={false}
                    activeOpacity={0.6}
                    onPress={handleEventPress}
                    style={[styles.carouselSecondaryItem, {
                        marginBottom: 10
                    }]}>
                    <ImageBackground
                        source={imageSource}
                        style={styles.carouselSecondaryImage}
                        imageStyle={styles.imageBorderRadius}>
                        <View style={{ marginHorizontal: 10 }}>
                            <View key={item.id} style={{
                                flexDirection: 'row',
                                paddingTop: 15,
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    maxWidth: '82%',
                                    alignItems: 'center',
                                }}>
                                    <View style={styles.imageTouchableContainer}>
                                        <ImageWithFallback
                                            imageurl={item?.category_image}
                                            style={{ height: 22, width: 22 }}
                                        />
                                    </View>
                                    <TouchableLabel
                                        label={item.category_title}
                                        onPress={() => console.log('Hello')}
                                        containerStyle={styles.categoryTitleContainer}
                                        labelStyle={styles.customLableCarouselTags}
                                        numberOfLines={1}
                                    />
                                </View>
                                <View style={{
                                    alignSelf: 'flex-end',
                                    justifyContent: 'flex-end',
                                    alignContent: 'flex-end',
                                }}>
                                    <View style={{ backgroundColor: '#00000066', padding: 5, borderRadius: 50, }}>
                                        <WishlistButton item={item} type="wishlist" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={styles.carouselsubSecondaryContainer}>
                        <View>
                            <View style={styles.dateIconContainer}>
                                <Text numberOfLines={2} style={styles.carouselTitle}>
                                    {item.title || 'Untitled Event'}
                                </Text>
                            </View>
                            <View style={styles.dateIconSecondContainer}>
                                <View key={item.id} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5
                                }}>
                                    <Icon name={'calendar-blank-outline'} size={16} color="#000000" />
                                    <Text style={styles.carouselDate}>{formattedStartDate}</Text>
                                </View>
                                <View>
                                    <TouchableLabel
                                        label={item.price_type == 1 ? `£ ${item?.price}` : 'FREE'}
                                        onPress={() => { }}
                                        containerStyle={
                                            item.price_type == 1
                                                ? styles.customLableCarouselSecondaryContainer
                                                : styles.priceContainerFree
                                        }
                                        labelStyle={styles.customLableSecondaryCarousel}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        };
    }, [data]);

    return (
        <FlatList
            data={data}
            renderItem={_renderItem}
            keyExtractor={(item, index) => String(item?.id ?? item?.event_id ?? index)}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            // getItemLayout={(data, index) => ({
            //     length: screenWidth * 0.624,
            //     offset: screenWidth * 0.624 * index,
            //     index,
            // })}
        />
    );
};

export default WishlistCart;
