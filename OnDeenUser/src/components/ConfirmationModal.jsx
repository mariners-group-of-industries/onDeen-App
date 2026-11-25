// components/ConfirmationModal.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native'; 
import { fontColor, fontFamilies } from '../../assets/fonts/fonts';

const ConfirmationModal = ({
    visible = false,
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed?',
    cancelText = 'Cancel',
    confirmText = 'OK',
    onCancel,
    onConfirm,
}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType='fade'
            onRequestClose={onCancel}
            statusBarTranslucent
        >
            <View style={styles.modalContainer}>

                <View style={[styles.absolute, styles.androidBackdrop]} />

                <View style={styles.modalContent}>
                    <View style={styles.contentWrapper}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                        </View>

                        {/* Body */}
                        <View style={styles.body}>
                            <Text style={styles.description}>{description}</Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.confirmButton,
                                ]}
                                onPress={onConfirm}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    androidBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    contentWrapper: {
        padding: 0,
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#000',
        fontFamily: fontFamilies.SFProRoundedBlackBold
    },
    body: {
        paddingVertical: 25,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        color: '#333',
        fontFamily: fontFamilies.SFProRoundedBlackMedium
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    button: {
        flex: 1,
        paddingVertical: 5,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        
    },
    confirmButton: {
         backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    successButton: {
        backgroundColor: '#34C759',
    },
    buttonText: {
        fontSize: 14,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    cancelButtonText: {
        color: '#000',
    },
    confirmButtonText: {
        color: fontColor.THEME
    },
});

export default ConfirmationModal;