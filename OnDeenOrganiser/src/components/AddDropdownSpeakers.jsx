import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import GradientButton from './gradientButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fontFamilies } from '../assets/themes/fonts';
import NoFound from '../common/NotFound';
import NoData from '../common/NoData';
import TouchableLabel from './customLabels';

const AddDropdownSpeakers = ({ setValues, value, speakersoptions }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [speakers, setSpeakers] = useState(value || []);
    const [isModalVisible, setModalVisible] = useState(false);
    const bottomPadding = insets.bottom + heightScale(16);

    const filteredOptions = speakersoptions.filter(option =>
        !speakers.some(speaker => speaker.id == option.id) &&
        (option.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelect = (option) => {
        const newSpeaker = { ...option };
        setSpeakers(prevSpeakers => [...prevSpeakers, newSpeaker]);
        setValues('speakers', [...speakers, newSpeaker]);
        setModalVisible(false);
        setSearchQuery('')
    };

    const handleDeleteSpeaker = (index) => {
        const updatedSpeakers = speakers.filter((_, i) => i != index);
        setSpeakers(updatedSpeakers);
        setValues('speakers', updatedSpeakers);
    };

    return (
        <View>
            <View style={styles.rowContainer}>
                <Text style={styles.headerText}>Event Speakers</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>Add Speaker</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.curriculumContainer}>
                {speakers?.length == 0 ? (
                    <>
                        <NoData title={'No Speakers added!'} />
                    </>
                ) : (
                    <ScrollView horizontal>
                        {speakers.map((speaker, index) => (
                            <TouchableOpacity key={index}>
                                <View style={styles.speakerImageContainer}>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteSpeaker(index)}
                                    >
                                        <Icon name="delete" size={24} color="#E4416D" />
                                    </TouchableOpacity>
                                    <Image
                                        style={styles.speakerImage}
                                        source={{ uri: speaker?.image || speaker?.profile_image }}
                                    />
                                    <Text style={styles.speakerName}>
                                        {speaker.first_name} {speaker.last_name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
                <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
                        <Text style={styles.modalHeader}>Add Speakers</Text>
                        <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Search here..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={'#888'}
                        />
                    </View>
                    <View style={styles.container}>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Image
                                        style={styles.speakerImage}
                                        source={{ uri: item?.profile_image }}
                                    />
                                    <Text style={styles.modalOptionText}>{item.first_name} {item.last_name}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>

                    {/* <GradientButton
                        onPress={() => { setModalVisible(false); setSearchQuery('') }}
                        title="Close"
                        containerStyle={styles.customButtonContainer}
                        textStyle={styles.customButtonText}
                    /> */}
                    <TouchableLabel
                        label={'CANCEL'}
                        onPress={() => { setSearchQuery(''); setModalVisible(false) }}
                        containerStyle={styles.viewallContainer}
                        labelStyle={styles.viewallLabel}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerText: {
        fontSize: fontScale(16),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    addButtonText: {
        color: '#E4416D',
        fontWeight: '500',
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    speakerContainer: {
        marginVertical: 10,
    },
    noSpeakersContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    noSpeakersText: {
        fontSize: fontScale(16),
        color: '#888',
        textAlign: 'center',
        marginTop: heightScale(20),
        fontStyle: 'italic',
    },
    speakerImageContainer: {
        alignItems: 'center',
        marginRight: widthScale(16),
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 5,
        zIndex: 1,
    },
    speakerImage: {
        width: widthScale(40),
        height: widthScale(40),
        borderRadius: 50,
    },
    speakerName: {
        marginTop: 8,
        fontSize: fontScale(14),
        fontWeight: '500',
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
        maxHeight: heightScale(500),
    },
    modalHeader: {
        fontSize: fontScale(16),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    container: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 300,
        justifyContent: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 14,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        paddingLeft: 10,
    },
    customButtonContainer: {
        marginTop: 20,
        width: '100%',
        marginBottom: heightScale(32),
    },
    customButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    noCurriculumContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    noCurriculumText: {
        fontSize: 16,
        color: '#999',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    curriculumContainer: {
        // marginVertical: 10,
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
});

export default AddDropdownSpeakers;
