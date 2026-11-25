import React from 'react';
import { View, Image, ScrollView } from 'react-native';
import styles from './styles';
import TouchableLabel from '../../../components/customLabels';
import { getEventImageurl, getEventTitle } from '../../../common/options';

export default function EventTags({ tags, eventbyid }) {
    const staticStyles = [
        styles.unisexContainer,
        styles.fillingFastContainer,
        styles.paidEventContainer,
    ];

    return (
        <View style={{  paddingVertical: 5 }}>
            <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'row', gap: 4, marginVertical: 2 }} showsHorizontalScrollIndicator={false}>
                {tags.map((item, index) => {
                    const styleIndex = index == 0 ? 0 : (index % 3);
                    return (
                        <View key={item.id} >
                            {index == 0 ? (
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={styles.imageTouchableContainer}>
                                        <Image
                                            source={`${getEventImageurl(eventbyid?.event_type)}`}
                                            resizeMode="contain"
                                            style={styles.eventImage}
                                        />
                                    </View>
                                    <TouchableLabel
                                        label={` ${getEventTitle(eventbyid?.event_type)}`}
                                        onPress={() => { }}
                                        containerStyle={styles.newEventContainer}
                                        labelStyle={styles.customLableNewEvents}
                                    />
                                </View>
                            ) :
                                <TouchableLabel
                                    label={item.title}
                                    containerStyle={staticStyles[styleIndex]}
                                        // containerStyle={styles.newEventContainer}
                                        labelStyle={styles.customLableCarousel}
                                />}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
