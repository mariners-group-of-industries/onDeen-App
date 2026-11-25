import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Plus from '../assets/svg/plus.svg';
import Remove from '../assets/svg/remove.svg';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeEventTag({ tagsoptions, name, formik, label, placeholder, type }) {
    const [inputText, setInputText] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        if (tagsoptions) {
            setAvailableTags(tagsoptions);
        }
    }, [tagsoptions]);

    useEffect(() => {
        // Update available tags based on selected tags
        const currentSelectedTags = formik.values[name] || [];
        setSelectedTags(currentSelectedTags);
        setAvailableTags(tagsoptions.filter(tag => !currentSelectedTags.some(selected => selected.tag_id === tag.value)));
    }, [formik.values[name], tagsoptions]);

    const handleSelectTag = (tag) => {
        const newTag = { tag_id: tag.value, label: tag.label };
        setSelectedTags(prev => [...prev, newTag]);
        setAvailableTags(prev => prev.filter(item => item.value !== tag.value));
        formik.setFieldValue(name, [...selectedTags, newTag]);
    };

    const handleRemoveTag = (tagToRemove) => {
        const updatedSelectedTags = selectedTags.filter(tag => tag.tag_id !== tagToRemove.tag_id);
        setSelectedTags(updatedSelectedTags);
        setAvailableTags(prev => [...prev, { value: tagToRemove.tag_id, label: tagToRemove.label }]);
        formik.setFieldValue(name, updatedSelectedTags);
    };

    const handleAddCustomTag = () => {
        if (inputText.trim()) {
            const randomId = Math.floor(Math.random() * 10000000000);
            const newTag = { tag_name: inputText.trim(), tag_id: randomId };
            setSelectedTags(prev => [...prev, { tag_id: randomId }]);
            formik.setFieldValue(name, [...selectedTags.map(tag => tag), newTag]);
            setInputText('');
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.selectedTagsContainer}>
                <FlatList
                    data={selectedTags}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleRemoveTag(item)}
                            style={[styles.optionItem, { borderWidth: 1, borderColor: '#DB3171', }]}
                        >
                            <Text style={[styles.optionLabel, { color: '#DB3171' }]}>{item?.tag_name || item?.label || item?.title || item?.tag_id}  <Remove />

                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.tag_id.toString()}
                />
            </View>

            <Text style={styles.title}>Add Custom Label</Text>
            {/* <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={placeholder}
                    placeholderTextColor="#969696"
                    keyboardType={type || 'default'}
                />
                <TouchableOpacity onPress={handleAddCustomTag} style={styles.iconContainer}>
                    <Icon name={'add-sharp'} size={25} color="gray" />
                </TouchableOpacity>
            </View> */}

            <FlatList
                data={availableTags}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelectTag(item)}
                        style={styles.optionItem}
                    >
                        <Text style={styles.optionLabel}>{item.label}  <Plus /></Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: heightScale(4),
    },
    title: {
        fontSize: fontScale(12),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    selectedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: heightScale(8),
    },
    optionItem: {
        paddingVertical: heightScale(12),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        marginVertical: heightScale(4),
        borderRadius: widthScale(24),
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
        marginTop: 10,
    },
    optionLabel: {
        fontSize: fontScale(12),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center'
    },
    removeIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 5
    },

    addIcon: {
        marginLeft: widthScale(8),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        right: widthScale(10),
        height: '100%',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        fontSize: fontScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(24),
        paddingRight: widthScale(50),
        color: '#000'
    },
});
