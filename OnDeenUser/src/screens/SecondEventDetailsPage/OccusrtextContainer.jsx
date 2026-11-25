import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Info, Vault } from 'lucide-react-native';
import styles from './styles';
import { fontFamilies } from '../../assets/fonts/fonts';

export default function OccusrtextContainer({ eventDetail }) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleInfoPress = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            {eventDetail?.occusr_text &&
                <View style={styles.classContainer}>
                    <Text style={styles.classSubTextJourney}>
                        {eventDetail?.occusr_text}
                    </Text>
                    <TouchableOpacity onPress={handleInfoPress} >
                        <Info size={15} color={'#422199'} />
                    </TouchableOpacity>
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={closeModal}
                        statusBarTranslucent
                    >
                        <TouchableOpacity
                            style={modalStyles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <View style={modalStyles.modalContent}>
                                <View style={modalStyles.modalContainer}>
                                    <Text style={modalStyles.modalText}>
                                        {eventDetail?.occusr_text_pop}
                                    </Text>

                                </View>
                                <View style={{
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    paddingHorizontal: 20,
                                    backgroundColor: '#fff'
                                }}>
                                    <TouchableOpacity
                                        onPress={closeModal}
                                    >
                                        <Text style={modalStyles.dismissButtonText}>Dismiss</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>

                    </Modal>
                </View>
            }
        </>
    );
}

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#422199',
    },
    modalText: {
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#000',
        width: '80%'
    },
    dismissButton: {
        backgroundColor: '#422199',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'flex-end',
        alignItems: 'flex-end'
    },
    dismissButtonText: {
        color: '#DB3171',
        fontSize: 14,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20, // Extra bottom padding for iPhone home indicator
    },
});