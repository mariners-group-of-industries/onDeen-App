import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {fontScale, heightScale, widthScale} from './scale';

const {width} = Dimensions.get('window');

interface ListItemProps {
  name: string;
  image: any;
  onPress: () => void;
}

const ListItem: React.FC<ListItemProps> = ({name, image, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.itemContainer}>
    <Image resizeMode="contain" source={image} style={styles.image} />
    <Text style={styles.name}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: heightScale(118),
    width: widthScale(84),
    marginVertical: heightScale(24),
    marginHorizontal: widthScale(12),
    borderWidth: 1.5,
    borderColor: '#FFAECC',
    borderRadius: widthScale(28),
    gap: 5,
  },
  image: {
    borderRadius: 8,
    alignItems: 'center',
  },
  name: {
    fontSize: fontScale(16),
    fontWeight: '500',
    color: '#333',
  },
});

export default ListItem;
