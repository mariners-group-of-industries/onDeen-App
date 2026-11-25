import { View, Text } from 'react-native'
import React from 'react'
import styles from './styles';
import { getColorByIndex } from '../../helpers/scale';
import TouchableLabel from '../../components/customLabels';

export default function UserReviews({ reviews }) {
    return (
        <>
            {Array.isArray(reviews) &&
                <View style={{ paddingBottom: 60 }}>
                    {
                        reviews?.length > 0 &&
                        <View
                            style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            <Text style={styles.reviewsLabel}>REVIEWS</Text>
                            <Text
                                style={[
                                    styles.ratingHeading,
                                    {
                                        paddingTop: 28,
                                    },
                                ]}>
                                ( {reviews?.length} )
                            </Text>
                        </View>
                    }
                    {reviews?.map((item, index) => {
                        const initials = `${item.user_first_name?.charAt(0) || ''
                            }`.toUpperCase();

                        return (
                            <React.Fragment key={item.id}>
                                <View style={styles.reviewsContainer}>
                                    <View>
                                        <TouchableLabel
                                            label={initials}
                                            onPress={() => { }}
                                            containerStyle={{
                                                backgroundColor: getColorByIndex(index),
                                            }}
                                            labelStyle={styles.initialLabel}
                                        />
                                    </View>
                                    <View style={{ gap: 4 }}>
                                        {item?.title && <Text style={styles.ratingHeading}>
                                            {item?.title}
                                        </Text>}
                                        <Text style={styles.ratingContent}>{item.review}</Text>
                                        <Text style={styles.ratingPerson}>
                                            {item.user_first_name} {item.user_last_name}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.separatorContainer}>
                                    <View style={styles.separatorLine} />
                                </View>
                            </React.Fragment>
                        );
                    })}
                </View>
            }
        </>
    )
}