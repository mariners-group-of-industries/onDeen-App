import { View, Pressable } from 'react-native';
import React from 'react';
import ShareIconHeader from '../../../src/assets/svg/shareHeader.svg';
import styles from './styles';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import moment from 'moment';
import { BASE_URL } from '../../helpers/Constant';

const getShareBaseUrl = () => {
    const backendUrl = String(BASE_URL || '').replace(/\/+$/, '');
    return backendUrl || 'https://api-production-517c1.up.railway.app';
};

export default function ShareIconComponent({ eventDetail = {}, imageUrl }) {
    const shareEventUrl = async () => {
        try {
            // ✅ Defensive defaults
            const title = eventDetail?.title || 'Upcoming Event';
            const organizer = eventDetail?.organizer?.name || 'Unknown Organizer';
            const formattedDate = eventDetail?.start_date
                ? moment(eventDetail?.start_date).format('DD MMM YYYY')
                : 'Date not available';
            const category = eventDetail?.category_title || 'General';

            const deliveryType = Number(eventDetail?.location_type);
            const locationLabel = deliveryType === 0
                ? 'Meeting Link'
                : deliveryType === 2
                    ? 'Venue / Meeting Link'
                    : 'Location';
            const shareBaseUrl = getShareBaseUrl();
            const deepLinkUrl = eventDetail?.id
                ? `${shareBaseUrl}/open?id=${eventDetail.id}`
                : (eventDetail?.share_url || shareBaseUrl);

            const venueValue = eventDetail?.latitude && eventDetail?.longitude
                ? `https://www.google.com/maps?q=${eventDetail?.latitude},${eventDetail?.longitude}`
                : eventDetail?.location?.trim() || 'Location not available';
            const locationValue = deliveryType === 2
                ? `${venueValue} · ${eventDetail?.meet_link?.trim() || 'Link not available'}`
                : deliveryType === 1
                    ? eventDetail?.latitude && eventDetail?.longitude
                        ? `https://www.google.com/maps?q=${eventDetail?.latitude},${eventDetail?.longitude}`
                        : 'Location not available'
                    : eventDetail?.meet_link?.trim() || 'Link not available';

            const eventMessage = `I wanted to share an exciting event with you that I think you’d love.
    
🎉 ${title} 🎉

👤 Organizer: ${organizer}
📅 Date: ${formattedDate}
📍 ${locationLabel}: ${locationValue}
🎤 Topic: ${category}

More Info: ${deepLinkUrl}

If you're interested, I think it will be a great experience!
      `;

            let localPath = null;

            // ✅ Only download image if available
            if (imageUrl) {
                try {
                    localPath = `${RNFS.CachesDirectoryPath}/poster.jpg`;

                    await RNFS.downloadFile({
                        fromUrl: imageUrl,
                        toFile: localPath,
                    }).promise;

                    // verify file exists
                    const exists = await RNFS.exists(localPath);
                    if (!exists) {
                        localPath = null; // fallback to no image
                    }
                } catch (imgErr) {
                    console.log('Image download failed, sharing text only:', imgErr);
                    localPath = null;
                }
            }

            // ✅ Share safely
            const shareOptions = {
                title: 'Share Event',
                message: eventMessage,
                ...(localPath ? { url: 'file://' + localPath, type: 'image/jpeg' } : {}),
            };

            await Share.open(shareOptions);
        } catch (error) {
            console.error('Error sharing event:', error);
        }
    };

    return (
        <View>
            <Pressable
                onPress={shareEventUrl}
                style={[styles.heartIcon, { left: 26 }]}>
                <ShareIconHeader />
            </Pressable>
        </View>
    );
}
