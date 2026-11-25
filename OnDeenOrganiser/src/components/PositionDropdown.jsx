import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import { twentyarray } from '../common/options';
import ViewInput from './ViewInput';
import { fontFamilies } from '../assets/themes/fonts';
import TouchableLabel from './customLabels';

const PositionDropdown = ({ formik, name, label, placeholder }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const bottomPadding = insets.bottom + heightScale(16);

    const filteredOptions = twentyarray.filter(option =>
        option.label.toString().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        formik.setFieldValue(name, option.value);
        setModalVisible(false);
        setSearchQuery('');
    };

    const openModel = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <ViewInput
                formik={formik}
                name={name}
                label={label}
                value={formik.values[name]}
                placeholder={placeholder}
                openmodel={openModel}
                onpress={true}
            />

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
                <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
                    <Text style={styles.modalHeader}>Select {label}</Text>

                    {/* <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search here..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={'#888'}
                        />
                    </View> */}

                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.value.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.modalOptionText}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                    <TouchableLabel
                        label={'CANCEL'}
                        onPress={() => { setModalVisible(false) ; setSearchQuery('');}}
                        containerStyle={styles.viewallContainer}
                        labelStyle={styles.viewallLabel}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
    },
    title: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        fontSize: fontScale(12),
        paddingVertical: heightScale(10),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(25),
        paddingRight: widthScale(50),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    description: {
        height: 120,
        textAlignVertical: 'top',
    },
    errorMessage: {
        color: 'red',
        marginTop: heightScale(4),
    },
    dropdownButton: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: fontScale(16),
        color: '#17101F',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: widthScale(20),
        maxHeight: heightScale(400),
    },
    modalHeader: {
        fontSize: 16,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        marginBottom: 10
    },
    searchContainer: {
        marginBottom: 15,
    },
    searchInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalOptionText: {
        fontSize: 14,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
    },
    closeButtonContainer: {
        marginTop: 20,
        width: '100%',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    viewallContainer: {
        marginTop: 10,
        width: '100%',
        borderRadius: widthScale(90),
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: "#D0D0D0"
    },
    viewallLabel: {
        color: '#000000',
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackBold,
    },
});

export default PositionDropdown;
