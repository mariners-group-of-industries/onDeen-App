import React from 'react';
import {
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import LinearGradient from 'react-native-linear-gradient';
import { fontFamilies } from '../../assets/fonts/fonts';
import GradientButton from '../../components/gradientButton';
import { getDateFormate, getTimeandhours } from '../../components/datetimeformate';

const MemebershipItem = ({
    item,
}) => (
    <>
    <LinearGradient
        colors={['rgba(255, 216, 97, 1)', 'rgba(255, 174, 204, 1)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBorder}
    >
        <LinearGradient
            colors={['rgba(255, 216, 97, 1)', 'rgba(255, 174, 204, 1)']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            activeOpacity={0.7}
            style={[styles.itemContainer]}
        >
            <View style={{ flexDirection: 'column' }}>
                <View >
                    <View style={[styles?.itemContainersecond, { width: '100%' }]} >
                        <View style={{ width: '100%' }}>
                            <Text style={styles.title}>{item?.title}</Text>
                            <Text style={styles.offer}>{item?.sub_title}</Text>
                        </View>
                    </View>
                </View>
                <View style={[{ width: '100%', flexDirection: 'column', paddingVertical:30 }]} >
                    <View style={{ width: '100%', flexDirection: 'row',  justifyContent:'space-between' }}>
                        <Text style={styles.offer}>Starts : {getTimeandhours(item?.purchased_on)}</Text>
                        <Text style={styles.offer}>Renew date : {getDateFormate(item?.ends_on)}</Text>
                    </View>
                </View>
            </View> 
        </LinearGradient>
    </LinearGradient>
    <GradientButton
    containerStyle={{
        borderRadius: 24,
        paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        gap: 4
    }}
    onPress={() => {  }}
    title={'Cancel Subscription'}
    colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
    start={{ x: -1.39, y: 0 }}
    end={{ x: 2.39, y: 1 }}
    textStyle={styles.buttonText}
/>
</>
);

const styles = StyleSheet.create({
    _itemContainer: {
        justifyContent: 'center',
        padding: heightScale(18),
        borderRadius: widthScale(28),
        gap: 10,
        backgroundColor: 'white',
        flexDirection: "row",
        shadowColor: "#C4C4C4",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 3.84,
        elevation: 5,
        // height: heightScale(85),
    },
    get itemContainer() {
        return this._itemContainer;
    },
    set itemContainer(value) {
        this._itemContainer = value;
    },
    itemContainersecond: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBorder: {
        padding: 1.5,
        borderRadius: widthScale(28),
        marginHorizontal: 12,
        marginVertical: 6,
    },
    gradientTab: {
    },
    image: {
        alignItems: 'center',
        height: heightScale(48),
        width: widthScale(52),
    },
    title: {
        fontSize: fontScale(20),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
    },
    offer: {
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
    },
    name: {
        fontSize: fontScale(16),
        fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
        color: '#161616',
    },
    price: {
        fontSize: fontScale(20),
        fontFamily: fontFamilies.SFProRoundedBlackBold,
        color: '#161616',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedRadio: {
        backgroundColor: '#ffff',
        borderColor: 'pink',
        borderColor: 'rgba(219, 49, 113, 1)',
    },
});

export default MemebershipItem;
