import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { fontFamilies } from '../../assets/fonts/fonts';

export default function RequestBuddyConfirmation({ isModalVisible, setIsModalVisible, onRequest }) {
    const [isRequesting, setIsRequesting] = useState(false);

    const closeModal = () => {
        if (isRequesting) return;
        setIsModalVisible(false);
    };

    const confirmRequest = async () => {
        if (isRequesting) return;
        setIsRequesting(true);
        try {
            const succeeded = await onRequest();
            if (succeeded) {
                setIsModalVisible(false);
            }
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <>
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
                statusBarTranslucent
            >
                <View
                    style={modalStyles.modalOverlay}
                >
                    <View style={modalStyles.modalContent}>
                        <View style={modalStyles.modalContainer}>
                            <Text style={modalStyles.modalTitle}>Request a buddy</Text>
                            <Text style={modalStyles.modalText}>
                                {'Get matched with a friendly volunteer who\'ll reach out before the event to help you settle in, answer questions, and be a familiar face on the day.'}
                            </Text>
                        </View>
                        <View style={modalStyles.actions}>
                            <TouchableOpacity
                                accessibilityLabel="Dismiss buddy request"
                                accessibilityRole="button"
                                disabled={isRequesting}
                                onPress={closeModal}
                                style={modalStyles.dismissButton}
                            >
                                <Text style={modalStyles.dismissButtonText}>Dismiss</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                accessibilityLabel="Confirm buddy request"
                                accessibilityRole="button"
                                disabled={isRequesting}
                                onPress={confirmRequest}
                                style={modalStyles.requestButton}
                            >
                                {isRequesting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={modalStyles.requestButtonText}>Request</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </Modal>
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
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        marginBottom: 15,
        color: '#422199',
    },
    modalText: {
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#000',
        width: '100%'
    },
    dismissButton: {
        borderColor: '#422199',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
    },
    dismissButtonText: {
        color: '#DB3171',
        fontSize: 14,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    actions: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
    },
    requestButton: {
        alignItems: 'center',
        backgroundColor: '#422199',
        borderRadius: 25,
        minWidth: 110,
        paddingHorizontal: 30,
        paddingVertical: 12,
    },
    requestButtonText: {
        color: '#FFFFFF',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: 14,
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20, // Extra bottom padding for iPhone home indicator
    },
});
