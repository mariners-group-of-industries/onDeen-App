import React, { useState } from 'react';
import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import Fallback from '../assets/svg/fallback.png'; // use PNG fallback
import { View } from 'react-native';

const ImageWithFallback = ({ imageurl, style }) => {
  const [imageError, setImageError] = useState(false);

  const isSvg = imageurl?.endsWith('.svg');

  const handleError = () => {
    setImageError(true);
  };

  if (!imageurl || imageError) {
    return (
      <Image
        source={Fallback}
        style={[style, { borderWidth: 0.4, borderColor: '#ddd' }]}
        resizeMode="contain"
      />
    );
  }

  return (
    <>
      {isSvg ? (
        <View style={[{ borderWidth: 0.4, borderColor: '#ddd', borderRadius: 90 }]}>
          <SvgUri
            uri={imageurl}
            width={style?.width}
            height={style?.height}
            onError={handleError}
          />
        </View>

      ) : (
        <Image
          source={{ uri: imageurl }}
          style={[style, { borderWidth: 0.4, borderColor: '#ddd' }]}
          onError={handleError}
          resizeMode="cover"
        />
      )}
    </>
  );
};

export default ImageWithFallback;
