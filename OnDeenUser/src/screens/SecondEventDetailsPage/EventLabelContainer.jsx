import { View, Text } from 'react-native'
import React from 'react'
import ImageWithFallback from '../../components/ImageWithFallback'
import styles from './styles'
import TouchableLabel from '../../components/customLabels'

export default function EventLabelContainer({ eventDetail }) {
    const tags = Array.isArray(eventDetail?.tags) ? eventDetail.tags : [];
    const genderLabel =
        eventDetail?.gender == 1
            ? 'Male Only'
            : eventDetail?.gender == 2
                ? 'Women Only'
                : 'Unisex';
    const deliveryLabel = Number(eventDetail?.location_type) === 0
        ? 'Online'
        : Number(eventDetail?.location_type) === 2
            ? 'Hybrid'
            : 'Onsite';
    return (
        <View
            style={{
                flexDirection: 'row',
                gap: 4,
                marginTop: 2,
                flexWrap: 'wrap',
                paddingHorizontal: 24,
                marginLeft: -8
            }}>
            <View style={{
                height: 28,
                width: 28,
                borderRadius: 20,
                borderWidth: 1,
                backgroundColor: '#FFE0EB',
                borderColor: '#000000',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1,
                marginTop:-2,
            }}>
                <ImageWithFallback
                    imageurl={eventDetail?.category_image}
                    style={{ height: 20, width: 20 }}
                />
            </View>
            <TouchableLabel
                label={eventDetail?.category_title}
                onPress={() => { }}
                containerStyle={styles.categoryTitleContainer}
                labelStyle={styles.customLableCarouselTags}
            />
            <TouchableLabel
                label={deliveryLabel}
                onPress={() => { }}
                containerStyle={[
                    styles.fillingFastContainer,
                    { backgroundColor: '#FFF2F7', marginLeft: -15 },
                ]}
                labelStyle={styles.customLableCarousel}
            />
            <TouchableLabel
                label={genderLabel}
                onPress={() => { }}
                containerStyle={styles.fillingFastContainer}
                labelStyle={styles.customLableCarousel}
            />
            {tags.map((tag, index) => (
                <TouchableLabel
                    key={tag?.id || tag?.tag_id || `${tag?.title || 'tag'}-${index}`}
                    label={tag?.title || tag?.name || 'Tag'}
                    onPress={() => { }}
                    containerStyle={styles.fillingFastContainer}
                    labelStyle={styles.customLableCarousel}
                />
            ))}
        </View>
    )
}
