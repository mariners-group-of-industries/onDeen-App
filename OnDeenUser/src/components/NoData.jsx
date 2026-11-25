import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NoDataImage from '../assets/svg/noDataNew.svg'; // Replace with the correct SVG path
import { fontFamilies } from '../assets/fonts/fonts';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import { useNavigation } from '@react-navigation/native';
import { useFilter } from '../context/FilterContext';

const NoData = ({ title = 'No Data Found', heading, buttonTitle, onPress: onPressOverride }) => {
    const { resetFilter } = useFilter();

    const navigation = useNavigation()
    const onPress = () => {
        if (onPressOverride) {
            onPressOverride();
            return;
        }
        resetFilter()
        navigation.navigate('MainNavigator');
    }
    return (
        <View style={styles.container}>
            <NoDataImage width={186} height={186} />
            <Text style={styles.heading}>{heading}</Text>
            {/* <Text style={styles.title}>{title}</Text> */}
            <GradientButton
                containerStyle={styles.bookBtnContainer}
                onPress={onPress}
                title={buttonTitle}
                colors={['#DB3171', '#FFCC33']}
                start={{ x: 0.9, y: 0 }}
                end={{ x: 0.1, y: 1 }}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: fontScale(12),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        lineHeight: 14,
        marginTop: 12
    },
    heading: {
        fontSize: fontScale(24),
        color: '#0E0D0E',
        fontFamily: fontFamilies.allroundgothicSemiBold,
        lineHeight: 26,
        paddingHorizontal: widthScale(48),
        marginTop: 18,
        textAlign: 'center'
    },
    bookBtnContainer: {
        borderRadius: widthScale(90),
        // maxHeight: heightScale(48),
        maxWidth: widthScale(190),
        marginTop: heightScale(12),
        marginVertical: heightScale(4),
        // bottom: heightScale(24),
        // marginHorizontal: widthScale(13),
    },
});

export default NoData;
