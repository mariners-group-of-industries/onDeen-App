import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';

export default function ParticipantImages({ item = [] }) {
    
    return (
        Array.isArray(item?.participant_images) && item?.participant_images.length > 0 && (
            <View style={styles.imagesContainer}>
                {item?.participant_images.slice(0, 3).map((image, imageIndex) => (
                    <View key={imageIndex} style={styles.profileImageWrapper}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: image?.profile_image }}
                        />
                    </View>
                ))}

                {item?.participant_images.length > 3 && (
                    <>
                        <View style={{ backgroundColor: '#3E146F', color: '#fff', borderRadius: 90, paddingHorizontal: 8, paddingVertical: 5 }}>
                            <Text  style={styles.moreText} >+{item?.total_participants_count - 3}</Text>
                        </View>
                    </>
                )}
            </View>
        )
    );
}

const styles = StyleSheet.create({
    imagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        padding: 4,
    },
    profileImageWrapper: {
        marginRight: -5,

    },
    profileImage: {
        width: widthScale(28),
        height: widthScale(28),
        borderRadius: widthScale(50),
        borderColor: '#E1E1E1',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,

    },
    moreText: {
        color: '#fff', 
        fontSize: 10,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    
});
