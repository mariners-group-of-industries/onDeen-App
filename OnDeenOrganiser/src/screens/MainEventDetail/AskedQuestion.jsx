import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { fontScale, heightScale } from '../../helpers/scale';
import { useNavigation } from '@react-navigation/native';

export default function AskedQuestion() {
    const navigation = useNavigation();
  return (
    <View style={{marginTop: 24, paddingBottom: 46}}>
    <Text
      style={{
        fontSize: fontScale(12),
        fontWeight: '600',
        color: '#0E0D0E',
      }}>
      Asked Questions
    </Text>
    <Text
      style={{
        fontSize: fontScale(12),
        fontWeight: '400',
        color: '#545454',
      }}>
      Questions asked by you
    </Text>
    <View
      style={{
        marginTop: 12,
        padding: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        borderRadius: 20,
      }}>
      <View
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#DFD7C0',
          paddingVertical: 4,
          // paddingHorizontal: 12,
          flexDirection: 'row',
          // justifyContent: 'space-between',
          alignItems: 'center',
          height: heightScale(50),
          paddingRight: 40,
          paddingLeft: 20,
        }}>
        <View>
          <Text
            numberOfLines={1}
            style={{
              color: '#000000',
              fontWeight: '500',
              fontSize: fontScale(12),
              marginRight: 18,
            }}>
            Quis nostrud exercitation ullamco labor Quis nostrud
            exercitation ullamco labor Quis nostrud exercitation
            ullamco labor Quis nostrud exercitation ullamco labor
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FaqScreen');
          }}
          activeOpacity={0.7}>
          <Image
            source={require('../../assets/images/rightArrow.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          borderRadius: 24,
          borderWidth: 1,
          borderColor: '#DFD7C0',
          paddingVertical: 4,
          paddingRight: 40,
          paddingLeft: 20,
          flexDirection: 'row',
          // justifyContent: 'space-between',
          alignItems: 'center',
          height: heightScale(50),
        }}>
        <View>
          <Text
            numberOfLines={1}
            style={{
              color: '#000000',
              fontWeight: '500',
              fontSize: fontScale(12),
              marginRight: 18,
            }}>
            Quis nostrud exercitation ullamco labor Quis nostrud
            exercitation ullamco labor Quis nostrud exercitation
            ullamco labor Quis nostrud exercitation ullamco labor
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FaqScreen');
          }}
          activeOpacity={0.7}>
          <Image
            source={require('../../assets/images/rightArrow.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
  )
}