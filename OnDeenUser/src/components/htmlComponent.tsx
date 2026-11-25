import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/fonts/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RenderHtmlCustome({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const textColor = isDarkMode ? '#131313' : '#3A3A3A';

  const tagsStyles = {
    div: {
      fontSize: fontScale(14),
      fontFamily: fontFamilies.SFProRoundedBlackMedium,
      margin: 0,
      padding: 0,
    },
    p: {
      fontSize: fontScale(12),
      fontFamily: fontFamilies.SFProRoundedBlackMedium,
      lineHeight: heightScale(16),
      margin: 0,
      padding: 0,
      marginTop: 0,
      marginBottom: 3,
      paddingTop: 3,
      paddingBottom: 8,
    },
    h1: {
      fontSize: fontScale(20),
      fontFamily: fontFamilies.SFProRoundedBlackBold,
      margin: 0,
      padding: 0,
    },
    h2: {
      fontSize: fontScale(20),
      fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
      margin: 0,
      padding: 0,
    },
    h3: {
      fontSize: fontScale(16),
      fontFamily: fontFamilies.SFProRoundedBlackMedium,
      margin: 0,
      padding: 0,
    },
    ul: {
      marginLeft: widthScale(20),
      padding: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    ol: {
      marginLeft: widthScale(20),
      padding: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    li: {
      fontSize: fontScale(14),
      lineHeight: heightScale(20),
      fontFamily: fontFamilies.SFProRoundedBlackRegular,
      margin: 0,
      padding: 0,
    },
  };

  const MAX_WORDS = 25;
  const words = text?.split(' ') || [];

  const isTextLongEnough = words.length > MAX_WORDS;
  const displayedText = isExpanded ? text : words.slice(0, MAX_WORDS).join(' ') + '';

  return (
    <View>
      <RenderHTML
        contentWidth={SCREEN_WIDTH - 40}
        source={{ html: displayedText }}
        baseStyle={{ color: textColor }} // ✅ baseStyle overrides all default HTML styles
        tagsStyles={tagsStyles}
      />

      {isTextLongEnough && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={{
            color: textColor,
            fontSize: fontScale(12),
            fontFamily: fontFamilies.SFProRoundedBlackRegular,
            paddingTop: heightScale(4),
            textAlign: 'left',
          }}>
            {isExpanded ? 'Read Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
