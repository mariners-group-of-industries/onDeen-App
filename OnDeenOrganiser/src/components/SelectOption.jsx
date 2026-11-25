import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamilies } from '../assets/themes/fonts';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import TouchableLabel from './customLabels';

export default function SelectOption({ options, onSelect, setModalVisible, showsearch = true }) {
    const insets = useSafeAreaInsets();
    const bottomPadding = insets.bottom + heightScale(16);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = options.filter(option =>
        option.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        onSelect(option);
    };

    return (
        <View style={[styles.container, { paddingBottom: bottomPadding }]}>
            {
                showsearch &&
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search here..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={'#888'}
                    />
                </View>
            }


            {/* FlatList for scrollable options */}
            <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        accessibilityLabel={`Select ${item.label}`}
                        accessibilityRole="button"
                        style={styles.modalOption}
                        onPress={() => handleSelect(item)}
                    >
                        <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />

            <TouchableLabel
                label={'CANCEL'}
                onPress={() => { setSearchQuery(''); setModalVisible(false) }}
                containerStyle={styles.viewallContainer}
                labelStyle={styles.viewallLabel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 600,
        justifyContent: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        color: '#161616',
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
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
    modalOptionText: {
        fontSize: 14,
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    closeButton: {
        marginTop: 15,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 24,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#161616',
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 5,
        paddingTop: 22
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
