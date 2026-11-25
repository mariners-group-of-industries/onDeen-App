import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { categoryListing } from '../redux/slices/categorySlice';
import { subcategoryListing } from '../redux/slices/subcategorySlice';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Modal from 'react-native-modal';
import SelectOption from './SelectOption';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeSelectCategorySubcategory({ formik }) {
    const dispatch = useDispatch();
    const { category } = useSelector((state) => state.category);
    const [selectedCategories, setSelectedCategories] = useState(formik.values.organizer_categories || []);
    const [subcategoryOptions, setSubcategoryOptions] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [isCategoryMode, setIsCategoryMode] = useState(true);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    useEffect(() => {
        dispatch(categoryListing());
    }, [dispatch]);

    useEffect(() => {
        formik.setFieldValue('organizer_categories', selectedCategories);
    }, [selectedCategories]);

    const fetchSubcategoryOptions = async (categoryId) => {
        try {
            const response = await dispatch(subcategoryListing({ category_id: categoryId })).unwrap();
            if (response?.status) {
                const options = response.response.map((val) => ({
                    value: val.id,
                    subcategory_id: val.id,
                    label: val.title,
                }));
                setSubcategoryOptions((prev) => ({ ...prev, [categoryId]: options }));
            } else {
                setSubcategoryOptions((prev) => ({ ...prev, [categoryId]: [] }));
            }
        } catch (error) {
            ;
        }
    };

    const handleCategoryChange = (selectedCategory) => {
        const updatedCategories = [
            ...selectedCategories,
            { category_id: selectedCategory.value, category_name: selectedCategory.label, organizer_subcategories: [] },
        ];
        setSelectedCategories(updatedCategories);
        setModalVisible(false);
    };

    const handleSubcategoryChange = (subcat, categoryId) => {
        setSelectedCategories((prev) => {
            return prev.map(cat => {
                if (cat.category_id == categoryId) {
                    const isAlreadySelected = cat.organizer_subcategories.some(item => item.value == subcat.value);
                    if (isAlreadySelected) {
                        return {
                            ...cat,
                            organizer_subcategories: cat.organizer_subcategories.filter(item => item.value != subcat.value),
                        };
                    } else {
                        return {
                            ...cat,
                            organizer_subcategories: [...cat.organizer_subcategories, { subcategory_id: subcat.value, subcategory_name: subcat.label, value: subcat.value, label: subcat.label }],
                        };
                    }
                }
                return cat;
            });
        });
        setModalVisible(false);
    };

    const handleDeleteCategory = (categoryId) => {
        setSelectedCategories((prev) => prev.filter(cat => cat.category_id != categoryId));
        setSubcategoryOptions((prev) => {
            const newState = { ...prev };
            delete newState[categoryId];
            return newState;
        });
    };

    const availableCategories = Array.isArray(category) && category.filter(cat => {
        if (!Array.isArray(selectedCategories) || selectedCategories.length == 0) {
            return true;
        }
        return !selectedCategories.some(selected => selected.category_id == cat.id);
    }).map(cat => ({
        value: cat.id,
        label: cat.title,
    }));

    const currentSubcategories = subcategoryOptions[currentCategoryId] || [];

    return (
        <ScrollView>
            <Text style={styles.title1}> Select Category Subcategory</Text>

            <TouchableOpacity
                onPress={() => {
                    setIsCategoryMode(true);
                    setModalVisible(true);
                }}
                style={styles.input}
            >
                <Text style={styles.placeholdertitle}>Select a Category</Text>
                <View style={styles.iconContainer}  >
                    <Icon
                        name={'keyboard-arrow-down'}
                        size={30}
                        color="#888"
                    />
                </View>
            </TouchableOpacity>

            {Array.isArray(selectedCategories) && selectedCategories.map((item, index) => (
                <View key={item.category_id} style={[styles.categoryContainer, styles.cardbox]}>
                    <View style={styles.categoryHeader}>
                        <Text style={styles.title}>{`${index + 1}. Category : ${item.category_name}`}</Text>
                        <TouchableOpacity onPress={() => handleDeleteCategory(item.category_id)}>
                            <Icon name="delete" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setIsCategoryMode(false);
                            setCurrentCategoryId(item.category_id);
                            fetchSubcategoryOptions(item.category_id);
                            setModalVisible(true);
                        }}
                        style={styles.input}
                    >
                        <Text style={styles.placeholdertitle}>Select Subcategory</Text>
                        <View style={styles.iconContainer}  >
                            <Icon
                                name={'keyboard-arrow-down'}
                                size={30}
                                color="#888"
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.selectedItemsContainer}>
                        {Array.isArray(item.organizer_subcategories) && item.organizer_subcategories.map(subitem => (
                            <View key={subitem.value} style={styles.selectedItem}>
                                <Text style={styles.title}>{`${subitem.label}`}</Text>
                                <TouchableOpacity onPress={() => handleSubcategoryChange({ value: subitem.value }, item.category_id)}>
                                    <Icon name="delete" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setModalVisible(false)}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    {isCategoryMode ? (
                        <SelectOption
                            options={availableCategories}
                            onSelect={handleCategoryChange}
                            placeholder="Select a Category"
                            setModalVisible={setModalVisible}
                            showsearch={false}
                        />
                    ) : (
                        <SelectOption
                            options={currentSubcategories}
                            onSelect={(subcat) => handleSubcategoryChange(subcat, currentCategoryId)}
                            placeholder="Select Subcategory"
                            setModalVisible={setModalVisible}
                        />
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    title1: {
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
        paddingVertical: heightScale(8),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    title: {
        fontWeight: '500',
        fontSize: fontScale(14),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    input: {
        flex: 1,
        fontSize: fontScale(12),
        paddingVertical: heightScale(20),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(50),
        // marginVertical: heightScale(10),
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    placeholdertitle: {
        fontSize: fontScale(12),
        color: '#969696',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    categoryContainer: {
        marginTop: 10,
        borderRadius: widthScale(24),
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 2,
        marginBottom: 6
    },
    selectedItemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    selectedItem: {
        backgroundColor: '#e0e0e0',
        margin: 2,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        fontSize: fontScale(16),
        paddingVertical: heightScale(8),
        paddingHorizontal: widthScale(15),
    },
    removeText: {
        color: 'red',
        margin: 2,
        borderRadius: 25,
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
    iconContainer: {
        position: 'absolute',
        right: widthScale(15),
        justifyContent: 'center',
        paddingTop: heightScale(15),

    },
    cardbox: {
        padding: 15,
        borderRadius: 25,
        marginVertical: 10,
        borderWidth:0.2,
        borderColor:'gray'
      },
});
