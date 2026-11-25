import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchIcon from '../../src/assets/svg/search.svg';
import { fontFamilies } from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';

const CommonSearchInput = ({
    placeholder = 'Search...',
    containerStyle,
    inputContainerStyle,
    inputStyle,
    value,
    setSearchQuery,
    hellonavigate = false,
    autoFocusInitially = false,
}) => {
    const navigation = useNavigation();

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[styles.inputContainer, inputContainerStyle]}>
                <SearchIcon width={16} height={16} />

                <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                        if (hellonavigate) {
                            navigation.navigate('GlobalSearch');
                        }
                    }}
                    disabled={!hellonavigate}
                >
                    <TextInput
                        pointerEvents={hellonavigate ? 'none' : 'auto'}
                        accessible={!hellonavigate}
                        value={value}
                        onChangeText={setSearchQuery}
                        style={[styles.input, inputStyle]}
                        placeholderTextColor={'#969696'}
                        placeholder={placeholder}
                        editable={!hellonavigate}
                        selectTextOnFocus={!hellonavigate}
                        autoFocus={autoFocusInitially}
                    />
                </Pressable>

                {value?.length > 0 && (
                    <Pressable
                        onPress={() => setSearchQuery('')}
                        style={styles.clearIconContainer}
                    >
                        <Icon name="close" size={20} color="#131313" />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 50,
        backgroundColor: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#F9F6FD',
        justifyContent: 'center',
        borderRadius: 50,
        paddingVertical: 2,
        // height: 52,
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        color: '#131313',
        paddingHorizontal: 12,
    },
    clearIconContainer: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CommonSearchInput;
