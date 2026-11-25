import { View, Text } from 'react-native';
import React from 'react';
import styles from './styles';
import TouchableLabel from '../../components/customLabels';
import PriceDisplay from '../../components/PriceDisplay';
import { getEventPrice } from '../FirstEventDetailsPage/getpricevalue';

export default function TitlewithPriceContainer({ eventDetail }) {
    const finalDisplayPrice = getEventPrice(eventDetail);
    return (
        <>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingHorizontal: 18,
                marginTop: 4,
                marginBottom: 8,
                gap: 12,
            }}>
                <View
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}>
                    <Text style={styles.eventName} numberOfLines={2} ellipsizeMode="tail">
                        {eventDetail?.title}
                        {/* {eventDetail?.price_type} */}
                    </Text>
                </View>
                <View style={{ flexShrink: 0 }}>
                    <PriceDisplay price={finalDisplayPrice} />
                </View>

            </View>

        </>
    );
}
