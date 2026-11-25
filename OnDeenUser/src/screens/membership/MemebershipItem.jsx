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

const MemebershipItem = ({
    setcheck,
    check,
    title,
    price,
    offer,
    id,
    tabbgcolor,
    setSelectmembership,
    item,
    sub_title
}) => (
    <TouchableOpacity 
    activeOpacity={0.9}
    onPress={() => { setcheck(id), setSelectmembership(item) }}
     >
    <LinearGradient
        colors={tabbgcolor}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBorder}
    >
        <LinearGradient
            colors={tabbgcolor}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.itemContainer]}
            activeOpacity={0.7}
        >

            <View 
            
            style={[styles?.itemContainersecond, { width: '75%' }]} >
                <View style={{ width: '20%' }}>
                    <View
                        
                        style={[
                            styles.radioCircle,
                            check == id && styles.selectedRadio,
                            { borderWidth: check == id ? 4 : 2 }
                        ]}
                    />
                </View>
                <View style={{ width: '60%' }}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.offer}>{sub_title}</Text>
                </View>
            </View>

            {title === "Yearly" && (
                <View style={styles.discountContainer}>
                    <Text style={styles.discountText}>SAVE 30%</Text>
                </View>
            )}

            <View style={[styles?.itemContainersecond, { width: '30%' }]} >
                <Text style={styles.price}> {price > 0 ? `£ ${price}` : 'Free'}</Text>
            </View>
        </LinearGradient>
    </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    itemContainer: {
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
        // height:heightScale(85),
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
    title: {
        fontSize: fontScale(20),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
        lineHeight:20
    },
    offer: {
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
        lineHeight:14

    },
    price: {
        fontSize: fontScale(20),
        fontFamily: fontFamilies.SFProRoundedBlackBold,
        color: '#161616',
        lineHeight:28
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
    discountContainer: {
        position: 'absolute',
        top: heightScale(-10),
        right: widthScale(10),
        backgroundColor: '#C8F9AA',
        paddingVertical: heightScale(4),
        paddingHorizontal: widthScale(12),
        borderRadius: widthScale(4),
    },
    discountText: {
        fontSize: fontScale(10),
        fontFamily: fontFamilies.SFProRoundedBlackBold,
        color: '#17101F',
        lineHeight:12
    },
});

export default MemebershipItem;
