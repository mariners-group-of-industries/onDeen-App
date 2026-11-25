import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import styles from './styles';
import { fontScale, heightScale } from '../../helpers/scale';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from 'react-native-progress/Bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LatestHeader from '../../components/LatestHeader';
import { SvgUri } from 'react-native-svg';
import { RootState } from '../../redux/store';
import { useStatusBar } from '../../components/statusbar';

const BadgesScreen = () => {
  useStatusBar({ backgroundColor: '#F9F6FD', barStyle: 'dark-content' });
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { status, data, error } = useSelector(
    (state: RootState) => state.profileSlice,
  );
  const renderAwardItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => { }}
      activeOpacity={0.7}
      style={styles.awardItem}>
      <Text style={styles.awardName}>{item?.title}</Text>

      {/* <SvgUri style={styles.awardImage} uri={item?.image} /> */}
      <Image source={{ uri: item.image }} style={styles.awardImage} />

      {item?.attend_count === 100 && (
        <View style={styles.textContainer}>
          <Text style={styles.awardArchived}>Achieved</Text>
        </View>
      )}

      {item?.attend_count !== undefined && item?.attend_count !== 100 && (
        <View style={{ marginTop: 8 }}>
          <ProgressBar
            progress={item?.attend_count * 0.01}
            width={54} // ⬅️ use this instead of style.width
            color={'#DB3171'}
            unfilledColor={'#F8D7FD'} // optional
            borderRadius={8}
            style={styles.progressBar}
          />
        </View>
      )}
    </TouchableOpacity>
  );
    const ContainerComponent = SafeAreaView;
  
  return (
    <ContainerComponent style={styles.container}>
      <LatestHeader
        statusBarColor="#F9F6FD"
        secondRightImageSource={'2'}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
        }}
        title={'Back'}
      />
      <Text style={styles.heading}>Badges & Awards</Text>

      <View>
        <FlatList
          data={data?.award_level}
          renderItem={renderAwardItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={3}
          key={'badges_3_columns'}
          contentContainerStyle={styles.awardsListContainer}
          columnWrapperStyle={styles.rowStyle}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ContainerComponent>
  );
};

export default BadgesScreen;
