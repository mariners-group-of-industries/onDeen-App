import {View, Text, TouchableOpacity, useColorScheme} from 'react-native';
import React, {useState} from 'react';
import RenderHTML from 'react-native-render-html';
import {fontScale, heightScale} from '../helpers/scale';
import {fontFamilies} from '../assets/fonts/fonts';
import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function RenderHtmlCustome({text, compact = false}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();

  const textColor = colorScheme == 'dark' ? '#000000' : '#000000';
  const secondaryTextColor = colorScheme === 'dark' ? '#AAAAAA' : '#555555';

  const tagsStyles = {
    p: {
      fontSize: compact ? 12 : fontScale(14),
      lineHeight: compact ? 16 : heightScale(18),
      marginBottom: 0,
      color: textColor,
      fontFamily: compact
        ? fontFamilies.SFProRoundedBlackRegular
        : fontFamilies.SFProRoundedBlackMedium || 'sans-serif',
    },
    h1: {
      fontSize: fontScale(20),
      color: textColor,
      fontFamily: fontFamilies.SFProRoundedBlackBold || 'sans-serif',
    },
    h2: {
      fontSize: fontScale(20),
      color: textColor,
      fontFamily: fontFamilies.SFProRoundedBlackSemiBold || 'sans-serif',
    },
    h3: {
      fontSize: fontScale(16),
      color: textColor,
      fontFamily: fontFamilies.SFProRoundedBlackMedium || 'sans-serif',
    },
    ul: {
      marginLeft: 20,
      color: textColor,
    },
    ol: {
      marginLeft: 20,
      color: textColor,
    },
    li: {
      fontSize: compact ? 12 : fontScale(14),
      color: secondaryTextColor,
      lineHeight: compact ? 16 : heightScale(20),
      fontFamily: fontFamilies.SFProRoundedBlackRegular || 'sans-serif',
    },
  };

  const MAX_LENGTH = 100;
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const isTextLongEnough = text?.length > MAX_LENGTH;

  return (
    <View style={{flexDirection: 'column'}}>
      <RenderHTML
        contentWidth={SCREEN_WIDTH - 40}
        source={{
          html:
            isExpanded || !isTextLongEnough ? text : text.slice(0, MAX_LENGTH),
        }}
        tagsStyles={tagsStyles}
        defaultTextProps={{style: {color: textColor}}}
        renderersProps={{
          a: {
            ignoredStyles: ['color'],
          },
          text: {
            ignoredStyles: ['color'],
          },
        }}
      />

      {isTextLongEnough && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text
            style={{
              color: '#DF416B',
              fontSize: fontScale(12),
              paddingTop: heightScale(4),
              fontFamily: fontFamilies.SFProRoundedBlackRegular,
            }}>
            {isExpanded ? 'View Less' : 'View More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
