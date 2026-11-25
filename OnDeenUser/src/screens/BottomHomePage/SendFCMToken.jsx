import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTicketQRcodesAPI, insertPushTokenAPI } from '../../redux/callapis/CommonService';
import messaging from '@react-native-firebase/messaging';
import { ENABLE_FCM_NOTIFICATIONS } from '../../helpers/Constant';

export default function SendFCMToken({ setFToken, send = false }) {
    const isSkippedLogin = useSelector((state) => state?.user?.isSkippedLogin);

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
        }
    }

    async function getFCMToken() {
        if (!ENABLE_FCM_NOTIFICATIONS) {
            return null;
        }

        try {
            await requestUserPermission();
            const fcmToken = await messaging().getToken();
            if (setFToken) {
                setFToken(fcmToken)
            }
            return fcmToken;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    const PushFCMTokenMethod = async () => {
        const fcmToken = await getFCMToken();
        if (!fcmToken) return;
        if (!send) return;

        const data = { "push_token": fcmToken };

        try {
            const res = await insertPushTokenAPI({ data });
        } catch (err) {
            console.error('Error sending FCM token:', err);
        }
    };

    useEffect(() => {
        if (!ENABLE_FCM_NOTIFICATIONS) {
            return;
        }

        if (!isSkippedLogin) {
            PushFCMTokenMethod();
        }
    }, []);

    return null
}
