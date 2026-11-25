import { View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import { widthScale } from '../helpers/scale';
import GradientButton from '../components/gradientButton';
import { fontScale, heightScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

export default function EventDateModel({
    openStartDatePicker,
    setOpenStartDatePicker,
    dateOptions,
    handleDateChange,
    selectedFilters
}) {
    return (
        <Modal
            isVisible={openStartDatePicker}
            statusBarTranslucent
            onBackdropPress={() => setOpenStartDatePicker(false)}
            onBackButtonPress={() => setOpenStartDatePicker(false)}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={{ margin: 0 }}
        >
            <View style={styles.modalContainer}>
                <View style={styles.speakerModalContent}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { paddingTop: 24 }]}>
                            Event Date
                        </Text>
                        <Pressable onPress={() => setOpenStartDatePicker(false)}>
                            <Text style={styles.closeButton}>×</Text>
                        </Pressable>
                    </View>

                    {dateOptions.map(option => (
                        <Pressable
                            key={option.id}
                            style={[
                                styles.option,
                                selectedFilters?.start_date?.label == option.label &&
                                styles.selectedOption,
                            ]}
                            onPress={() => {
                                handleDateChange(option.value, 'start_date');
                                setOpenStartDatePicker(false);
                            }}
                        >
                            <View style={styles.optionContent}>
                                <Text
                                    style={
                                        selectedFilters?.start_date?.label === option.label
                                            ? styles.selectedText
                                            : styles.optionText
                                    }
                                >
                                    {option.label}
                                </Text>
                            </View>
                        </Pressable>
                    ))}

                    <Pressable onPress={() => setOpenStartDatePicker(false)}>
                        <GradientButton
                            containerStyle={styles.applyButton}
                            onPress={() => { }}
                            title={'Apply Filters'}
                            textStyle={styles.applyButtonText}
                            colors={['#DB3171', '#FFCC33']}
                            start={{ x: 0.9, y: 0 }}
                            end={{ x: 0.1, y: 1 }}
                        />
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        margin: 0,
    },
    speakerModalContent: {
        backgroundColor: '#FDFBFF',
        borderRadius: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 34,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: fontScale(20),
        lineHeight: 22,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
    },
    closeButton: {
        fontSize: 28,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        color: '#161616',
    },
    option: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 8,
        flexDirection: 'row',
    },
    optionContent: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderRadius: 10,
        textAlign: 'center',
    },
    optionText: {
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        color: '#161616',
        fontSize: fontScale(14),
        lineHeight: 16,
    },
    selectedOption: {
        backgroundColor: '#F7EFFF',
    },
    selectedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    applyButton: {
        borderRadius: 90,
        paddingRight: 12,
        paddingLeft: 16,
        paddingVertical: heightScale(0),
        width: widthScale(198),
        // marginBottom: 42,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackBold,
    },
});
