import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';

export default function CustomeSelectCatSubcat({ options, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = options.filter(option =>
        option.label && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        onSelect(option);  
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => handleSelect(item)}
                    >
                        <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
});
