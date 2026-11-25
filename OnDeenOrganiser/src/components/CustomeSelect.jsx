import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SelectOption from './SelectOption';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontFamilies } from '../assets/themes/fonts';

export default function CustomeSelect({ formik, name, label, placeholder, type, options = [], setCategoryId, account, customewidth = '100%', setAccount }) {
    const insets = useSafeAreaInsets();
    const [showError, setShowError] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const bottomPadding = insets.bottom + heightScale(16);

    useEffect(() => {
        if (formik.touched?.[name] && formik.errors?.[name]) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [formik.errors, formik.touched, name]);

    useEffect(() => {
        if (formik.isSubmitting && formik.errors?.[name]) {
            setShowError(true);
        }
    }, [formik.isSubmitting, formik.errors, name]);

    const handleSelect = (option) => {
        formik.setFieldValue(name, option.value);
        if (name == 'category_id') {
            setCategoryId(option?.value)
            setAccount?.(prevAccount => ({
                ...prevAccount,
                category_id: option.value,
                category_name: option.label,
                sub_category_id: '',
                sub_category_name: '',
                event_type: option.value,
            }));
            formik.setFieldValue('event_type', option.value);
            formik.setFieldValue('category_id', option.value);
            formik.setFieldValue('category_name', option.label);
            formik.setFieldValue('sub_category_id', '');
            formik.setFieldValue('sub_category_name', '');
        }
        if (name == 'sub_category_id') {
            formik.setFieldValue('sub_category_id', option.value);
            formik.setFieldValue('sub_category_name', option.label);
        }
        if (name == 'sect_rep') {
            formik.setFieldValue('sect_rep', option.value);
            formik.setFieldValue('sect_rep_name', option.label);
        }
        if (name == 'school_thought') {
            formik.setFieldValue('school_thought', option.value);
            formik.setFieldValue('school_thought_name', option.label);
        }
        if (name == 'journey_level_id') {
            formik.setFieldValue('journey_level_id', option.value);
            formik.setFieldValue('journey_level_name', option.label);
        }
        setModalVisible(false);
    };


    const getValues = () => {
        if (name == 'category_id') {
            const value = options.find((item) => item.value == formik.values['category_id'])?.label;
            return value
        }
        if (name == 'sub_category_id') {
            const value = options.find((item) => item.value == formik.values['sub_category_id'])?.label;
            return value
        }
        if (name == 'sect_rep') {
            const value = options.find((item) => item.value == formik.values['sect_rep'])?.label;
            return value
        }
        if (name == 'school_thought') {
            const value = options.find((item) => item.value == formik.values['school_thought'])?.label;
            return value
        }
        if (name == 'journey_level_id') {
            const value = options.find((item) => item.value == formik.values['journey_level_id'])?.label;
            return value
        }
        return options.find((item) => item.value == formik.values[name])?.label || null
    }
    const value = options.find((item) => item.value == formik.values[name]);

    return (
        <View style={[styles.container, { width: customewidth ? customewidth : '100%' }]}>
            {label && <Text style={[styles.title]}>{label}</Text>}

            <TouchableOpacity
                accessibilityLabel={`${label || name}: ${getValues() || placeholder}`}
                accessibilityRole="button"
                onPress={() => setModalVisible(true)}
                style={styles.inputContainer}
            >
                <TextInput
                    style={[styles.input]}
                    value={getValues()}
                    onChangeText={formik.handleChange(name)}
                    onBlur={formik.handleBlur(name)}
                    placeholder={placeholder}
                    placeholderTextColor={'#969696'}
                    keyboardType={type ? type : 'default'}
                    editable={false}
                />
                <View style={styles.iconContainer}  >
                    <Icon
                        name={'keyboard-arrow-down'}
                        size={30}
                        color="#888"
                    />
                </View>
            </TouchableOpacity>

            {(formik.touched?.[name] && showError && formik.errors?.[name]) && (
                <Text style={[styles.errorMessage]}>
                    {formik.errors?.[name]}
                </Text>
            )}

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={styles.modal}>
                <View style={[styles.modalContent, { paddingBottom: bottomPadding }]}>
                    <SelectOption showsearch={name == 'category_id' || name == 'journey_level_id' || 'sect_rep' ? false : true} setModalVisible={setModalVisible} options={options.length > 0 ? options : dummyOptions} onSelect={handleSelect} />
                </View>
            </Modal>
        </View>
    );
}

const dummyOptions = [];

const styles = StyleSheet.create({
    container: {
        marginTop: heightScale(2),
        marginBottom: heightScale(12),
    },
    title: {
        marginBottom: heightScale(4),
        fontWeight: '500',
        fontSize: fontScale(12),
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
        fontSize: fontScale(14),
        paddingVertical: heightScale(16),
        paddingHorizontal: widthScale(24),
        backgroundColor: '#F3F0F7',
        borderRadius: widthScale(50),
        paddingRight: widthScale(50),
        color: '#161616',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    errorMessage: {
        color: 'red',
        marginTop: heightScale(4),
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
        // height: '100%',
        justifyContent: 'center',
    },
});
