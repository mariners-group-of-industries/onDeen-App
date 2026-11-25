import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, Dimensions } from 'react-native';
import { Info } from 'lucide-react-native';
import styles from './styles';
import { fontFamilies } from '../../assets/fonts/fonts';
import Journeylevel from '../../assets/svg/journeylevel.svg'

const { height } = Dimensions.get('window');

export default function JourneyLevelContainer({ eventDetail }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <>
            {eventDetail?.journey_level_name && (
                <View style={modalStyles.journeyLevelContainer}>
                    <View style={[styles.separatorContainer, { marginTop: 4, marginLeft: -20, paddingVertical: 4 }]}>
                        <View style={styles.separatorLine} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={styles.journeyPreferLabel}>
                            Suitable for
                        </Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                            <Info size={15} color={'#3A3A3A'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.advanceImageContainer}>
                        <Journeylevel />
                        <Text style={styles.journeyLevelLabel}>
                            {eventDetail?.journey_level_name}
                        </Text>
                    </View>

                </View>
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
                statusBarTranslucent
            >
                <TouchableOpacity
                    style={modalStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                >
                    <View style={modalStyles.modalContent}>
                        <View style={modalStyles.modalBody}>
                            <Text style={modalStyles.modalText}>
                                {eventDetail?.journey_level_sub_name}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={modalStyles.dismissButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={modalStyles.dismissButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const modalStyles = StyleSheet.create({
    journeyLevelContainer: {
        paddingLeft: 18,
        paddingBottom: 10,
        // paddingTop: 6,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20, // E
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    modalText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#000',
    },
    dismissButton: {
        padding: 15,
        alignItems: 'flex-end',
        paddingHorizontal: 20,
    },
    dismissButtonText: {
        color: '#DB3171',
        fontSize: 16,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
});
