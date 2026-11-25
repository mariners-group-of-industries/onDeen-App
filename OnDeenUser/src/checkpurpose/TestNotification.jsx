import { View, Text } from 'react-native'
import React from 'react'
import CheckNotification from './CheckNotification'
import CheckFCMToken from './CheckFCMToken'
import CheckTokenRequestHit from './CheckTokenRequestHit'

export default function TestNotification() {
    return (
        <View>
            <Text>TestNotification</Text>
            <CheckNotification />
            <CheckFCMToken/>
            <CheckTokenRequestHit/>
        </View>
    )
}