import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import RenderHTML from 'react-native-render-html';
import { fontScale, heightScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RenderHtmlCustome({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tagsStyles = {
    p: {
      fontSize: fontScale(14), // Dynamically scaling font size
      lineHeight: heightScale(18), // Scaling line height
      marginBottom: 0,
      color: "#333",
      fontFamily: fontFamilies.SFProRoundedBlackMedium || 'sans-serif', // Fallback to sans-serif
    },
    h1: {
      fontSize: fontScale(20),
      fontWeight: "bold",
      color: "#000",
      marginBottom: heightScale(12),
      fontFamily: fontFamilies.SFProRoundedBlackBold || 'sans-serif', // Fallback to sans-serif
    },
    h2: {
      fontSize: fontScale(20),
      fontWeight: "bold",
      color: "#000",
      marginBottom: heightScale(10),
      fontFamily: fontFamilies.SFProRoundedBlackSemiBold || 'sans-serif', // Fallback to sans-serif
    },
    h3: {
      fontSize: fontScale(16),
      fontWeight: "500",
      color: "#000",
      marginBottom: heightScale(8),
      fontFamily: fontFamilies.SFProRoundedBlackMedium || 'sans-serif', // Fallback to sans-serif
    },
    ul: {
      marginLeft: 20,
      marginBottom: heightScale(10),
    },
    ol: {
      marginLeft: 20,
      marginBottom: heightScale(10),
    },
    li: {
      fontSize: fontScale(14),
      color: "#555",
      lineHeight: heightScale(20),
      fontFamily: fontFamilies.SFProRoundedBlackRegular || 'sans-serif', // Fallback to sans-serif
    },
  };

  const MAX_LENGTH = 100;
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const isTextLongEnough = text?.length > MAX_LENGTH;

  return (
    <>
      <RenderHTML
        contentWidth={SCREEN_WIDTH - 40} // Adjust content width dynamically based on screen width
        source={{ html: isExpanded || !isTextLongEnough ? text : text.slice(0, MAX_LENGTH) }}
        tagsStyles={tagsStyles}
      />

      {isTextLongEnough && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={{
            color: '#DF416B',
            fontSize: fontScale(12),
            fontWeight: '400',
            paddingTop: heightScale(4),
          }}>
            {isExpanded ? 'View Less' : 'View More'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
