import { View, Text, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import React from 'react';
import styles from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function OnetoOneMeetLink({ meetLink }) {
    const handleMeetLinkPress = async () => {
        
        // Check if link exists
        if (!meetLink) {
            Alert.alert('No Link Available', 'This event does not have a meeting link yet.');
            return;
        }

        // Validate URL format
        let formattedLink = meetLink;
        if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
            formattedLink = `https://${formattedLink}`;
        }

        // Check if we can open the link
        const supported = await Linking.canOpenURL(formattedLink);
        
        if (supported) {
            try {
                await Linking.openURL(formattedLink);
            } catch (error) {
                Alert.alert('Error', 'Failed to open the meeting link.');
                console.error('Error opening URL:', error);
            }
        } else {
            Alert.alert(
                'Unsupported Link',
                `Cannot open this meeting link: ${formattedLink}`,
                [
                    { text: 'Copy Link', onPress: () => copyToClipboard(meetLink) },
                    { text: 'OK', style: 'cancel' }
                ]
            );
        }
    };

    const copyToClipboard = () => {
        Alert.alert('Copied', 'Meeting link copied to clipboard!');
    };

    if (!meetLink) {
        return null;
    }

    return (
        <View style={{}}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleMeetLinkPress}
                style={[styles.locationSubContainer]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={localStyles.linkText}
                    >
                        {meetLink}
                    </Text>
                    <Icon name="open-in-new" size={18} color="#422199" />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const localStyles = StyleSheet.create({
    linkContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    linkText: {
        flex: 1,
        color: '#422199',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    icon: {
        marginRight: 8,
    }
});