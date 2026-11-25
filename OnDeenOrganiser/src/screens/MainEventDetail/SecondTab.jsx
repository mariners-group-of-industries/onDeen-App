import React from "react";
import { StyleSheet, Image, Text, View, FlatList, Linking, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Download from '../../assets/svg/event/download.svg';
import Dotsvertical from '../../assets/svg/event/dotsvertical.svg';
import Downdata from '../../assets/svg/event/downdata.svg';
import RenderHtml from 'react-native-render-html'; // Import the RenderHtml component
import RNFS from 'react-native-fs'; // Import the React Native FS module
import RenderHtmlCustome from "../../common/RenderHtmlCustome";
import { fontFamilies } from "../../assets/themes/fonts";
import { fontScale } from "../../helpers/scale";

export default function SecondTab({ eventbyid }) {
  const navigation = useNavigation();
  const documents = Array.isArray(eventbyid?.documents) && eventbyid?.documents || [];

  const handleDownload = async (item) => {
    if (item?.file_path) {
      Linking.openURL(item.file_path);
    } else if (item?.file_path) {
      const filePath = RNFS.DownloadDirectoryPath + '/' + item.document_name;
      try {
        const result = await RNFS.downloadFile({
          fromUrl: item.file_path,
          toFile: filePath,
        }).promise;
        console.log('File downloaded:', result);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const renderFileItem = ({ item, index }) => (
    <TouchableOpacity style={styles.fileItem} key={index} onPress={() => handleDownload(item)}>
      {
        item?.file_path ? (
          <Image
            style={styles.fileIcon}
            source={{ uri: item?.file_path }}
          />
        ) : (
          <Downdata style={styles.downloadIcon} />
        )
      }
      <View style={styles.fileInfo}>
        <RenderHtmlCustome text={item.document_name} />
        <Text style={styles.fileSize}>{'500kb'}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: 'center', gap: 20 }}>
        <Download width={12} height={12} />
        <Dotsvertical style={styles.dotIcon} width={14} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.studyMaterial}>STUDY MATERIAL</Text>
          <Text style={styles.materialProvider}>Material provided by you</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit event materials"
          onPress={() => navigation.navigate('CreateEvent', {
            id: eventbyid?.id,
            latitude: eventbyid?.latitude,
            longitude: eventbyid?.longitude,
            address: eventbyid?.location,
          })}>
          <Text style={styles.editMaterials}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Info</Text>
        </View>
        <View style={styles.fileContainer}>
          <FlatList
            data={documents}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    width: '100%',
    paddingHorizontal: 21
  },
  header: {
    alignItems: "flex-start",
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
    marginBottom: 12,
    
  },
  studyMaterial: {
    color: "#0E0D0E",
    fontSize: fontScale(16),
    fontFamily: fontFamilies.allroundgothicSemiBold,
  },
  materialProvider: {
    color: "#545454",
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
  },
  editMaterials: {
    color: '#DB3171',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 20,
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoTitle: {
    color: "#545454",
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  fileContainer: {
    flexDirection: "column",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    marginBottom: 4,
    gap:10
  },
  fileIcon: {
    width: 28,
    height: 28,
    marginHorizontal: 10,
  },
  fileInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  fileName: {
    color: "#000",
    fontSize: 12,
    fontFamily: "SF Pro Rounded, sans-serif",
    fontWeight: "500",
  },
  fileSize: {
    color: "#3A3A3A",
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  downloadIcon: {
    width: 24,
    height: 24,
  },
  dotIcon: {
    width: 12,
    height: 12,
    marginRight: 10
  },
});
