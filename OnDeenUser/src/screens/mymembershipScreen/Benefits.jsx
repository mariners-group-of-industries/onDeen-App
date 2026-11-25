import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import React, { useState } from 'react';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { fontFamilies } from '../../assets/fonts/fonts';
import Benefi from '../../assets/svg/benefits.svg';
import LinearGradient from 'react-native-linear-gradient';
import TouchableLabel from '../../components/customLabels';
import GradientButton from '../../components/gradientButton';
import { useDispatch } from 'react-redux';
import { membershipPurchase } from '../../redux/slices/membershipSlice';
import RenderHtmlCustome from '../../components/RenderHtmlCustome';
import { useToastForPopup } from '../../context/ToastContext';

export default function Benefits({ selectmembership }) {
    const id = selectmembership?.id;
    const benefits = [
        { id: 1, title: 'Enjoy unlimited access to all premium classes and events' },
        { id: 2, title: 'Up to 10 devices per account' },
        { id: 3, title: '24/7 premium support, Enjoy unlimited access to all premium classes and events' },
        { id: 4, title: 'Dedicated account manager' },
        { id: 5, title: 'Unlimited storage capacity' },
        { id: 6, title: 'Custom features for enterprise users' },
        { id: 7, title: 'Access to all content types' },
        { id: 8, title: 'Access to exclusive webinars' },
        { id: 9, title: 'Discounts on partner services' },
        { id: 10, title: 'Personalized content recommendations' },
    ];

    const [showAll, setShowAll] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [model, setModel] = useState(false);
    const [responce, setResponce] = useState(null);
    const [responcedata, setResponcedata] = useState(null);

    const displayedBenefits = showAll ? benefits : benefits.slice(0, 5);
    const dispatch = useDispatch()
    const showToast = useToastForPopup();


    // const handlePurchase = () => {
    //     dispatch(membershipPurchase({id}))
    // }
    const handlePurchase = () => {
        dispatch(membershipPurchase({ id }))
            .unwrap()
            .then((res) => {
                setResponcedata(res)
                if (res?.status == true) {
                    setResponce(res?.message || 'Membership purchased successfully')
                    setModel(true)
                    showToast(res?.message || 'Membership purchased successfully');
                }
                else {
                    setResponce(res?.message || 'Something went wrong')
                    setModel(true)
                    showToast(res?.message || 'Something went wrong');
                }

            })
            .catch((error) => {
                setResponce(error || 'Something went wrong')
                setModel(true)
                showToast(error || 'Something went wrong');

            });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Premium Benefits</Text>

            <LinearGradient
                colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientBorder}
            >
                <LinearGradient
                    colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[styles.itemContainer]}
                    activeOpacity={0.7}
                >
                    <View style={styles.benefitsContainer}>
                        {
                            selectmembership?.description &&
                            <View style={{ flexDirection: 'row' }}>
                                <Benefi size={40} style={{ marginRight: 10 }} />
                                <RenderHtmlCustome text={selectmembership?.description} />
                            </View>
                        }
                        {/* {displayedBenefits.map((benefit) => (
                    <View style={{flexDirection:'row'}}>
                        <Benefi size={40} />
                        <Text key={benefit.id} style={styles.benefitItem}>
                            {benefit.title}
                        </Text>
                    </View>
                ))} */}
                    </View>
                </LinearGradient>
            </LinearGradient>
            {showAll && (
                <View style={styles.infoBtnContainer}>
                    <TouchableLabel
                        label={'View More'}
                        containerStyle={styles.viewallContainer}
                        labelStyle={styles.viewallLabel}
                        onPress={() => setShowAll(true)}
                    />
                </View>
            )}
            {/* {showAll && (
            <TouchableLabel
                label="View Less"
                containerStyle={styles.viewallContainer}
                labelStyle={styles.viewallLabel}
                onPress={() => setShowAll(false)}
            />
        )} */}
            <View style={{
                backgroundColor: '#FDFBFF',
                marginTop: 28,
                justifyContent: 'center',
                alignItems: 'center',

            }} >
                <View style={{
                    paddingVertical: 12
                }}>
                    <Text style={{

                        fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
                        color: '#161616',
                        fontSize: fontScale(14),
                        lineHeight: 20
                    }}>
                        I can not afford it
                    </Text>
                </View>
                <GradientButton
                    containerStyle={{
                        borderRadius: 24,
                        paddingVertical: heightScale(16),
                        paddingHorizontal: widthScale(24),
                        gap: 4
                    }}
                    onPress={() => { handlePurchase() }}
                    title={'Upgrade Now'}
                    colors={['#F4F4F4', '#FFCC33', '#DB3171', '#422199']}
                    start={{ x: -1.39, y: 0 }}
                    end={{ x: 2.39, y: 1 }}
                    textStyle={styles.buttonText}
                />
                <Text style={{
                    fontFamily: fontFamilies.SFProRoundedBlackRegular,
                    color: '#565656',
                    fontSize: fontScale(12),
                    lineHeight: 20
                }}>
                    All payments are secured, Cancel anytime!
                </Text>
            </View>

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
        // justifyContent: 'center',
        // padding: heightScale(18),
        // borderRadius: widthScale(28),
        // gap: 10,
        // backgroundColor: 'white',
        // flexDirection: "row",
        // shadowColor: "#C4C4C4",
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.8,
        // shadowRadius: 3.84,
        // elevation: 5,
        // height:heightScale(85),
        borderRadius: 24,
    },
    itemContainersecond: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'rgba(22, 22, 22, 1)',
        fontSize: fontScale(18),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        // color: '#161616',
    },
    benefitsContainer: {
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 24,
        padding: 24,
        backgroundColor: '#FFFFFF',
        gap: 10
    },
    benefitItem: {
        fontSize: 12,
        color: '#333',
        marginBottom: 10,
        paddingLeft: 10,
        lineHeight: 22,
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    viewMoreButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        backgroundColor: '#007BFF',
        borderRadius: 25,
        alignSelf: 'center',
        marginBottom: 20,
    },
    viewMoreText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    viewallLabel: {
        fontSize: fontScale(12),
        color: '#DB3171',
        fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
        lineHeight: 14,
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
        position: 'absolute',
        top: heightScale(470),

    },
    gradientBorder: {
        borderRadius: widthScale(24),
        padding: widthScale(1.3),

    },
    infoBtnContainer: {
        alignSelf: 'center',
        position: 'absolute',
        top: heightScale(274),
    },
    aboutEventConatiner: {
        marginTop: heightScale(16),
        paddingHorizontal: widthScale(24),
    },
    buttonText: {
        fontSize: fontScale(16),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#FFFFFF',
        lineHeight: 18
    },
});
