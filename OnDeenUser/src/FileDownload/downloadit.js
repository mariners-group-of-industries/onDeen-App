// utils/downloadAndOpenPDF.js
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';

export const downloadAndOpenPDF = async ({
  fileUrl,
  ticketId,
  onProgress,
  onDone,
}) => {
  if (!fileUrl || typeof fileUrl !== 'string') {
    Alert.alert('Ticket unavailable', 'This ticket file is not available yet.');
    return;
  }

  // Extract file extension from URL
  const cleanUrl = fileUrl.split('?')[0];
  const fileExtension = cleanUrl.split('.').pop().toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg'].includes(fileExtension);
  const isPDF = fileExtension === 'pdf';
  
  const fileName = `${ticketId}.${fileExtension}`;
  const folderName = 'OndeenUser';
  const baseDirectory = Platform.OS === 'android'
    ? RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath;
  const folderPath = `${baseDirectory}/${folderName}`;
  const fullPath = `${folderPath}/${fileName}`;

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const openFile = async () => {
    try {
      let mimeType = 'application/pdf';
      if (isImage) {
        mimeType = `image/${fileExtension}`;
      }
      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(fullPath, mimeType);
      } else {
        await Linking.openURL(`file://${fullPath}`);
      }
    } catch (err) {
      Alert.alert('Error', `Could not open the ${isImage ? 'image' : 'PDF'} file.`);
    }
  };

  const openFolder = async () => {
    try {
      await ReactNativeBlobUtil.android.actionViewIntent(folderPath, 'resource/folder');
    } catch (err) {
      Alert.alert(
        'Cannot Open Folder',
        `Your device restricts programmatic folder opening.\n\nOpen manually:\n${folderPath}`
      );
    }
  };

  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot download file without permission');
      return;
    }

    await RNFS.mkdir(folderPath);

    RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: fullPath,
      progress: (res) => {
        const percent = ((res.bytesWritten / res.contentLength) * 100).toFixed(2);
        if (onProgress) onProgress(percent);
      },
    }).promise
      .then(async (res) => {
        if (res.statusCode === 200) {
          // Scan file to make it visible in gallery/downloads
          let mimeType = 'application/pdf';
          if (isImage) {
            mimeType = `image/${fileExtension}`;
          }
          
          if (Platform.OS === 'android') {
            await ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: mimeType }]);
          }
          
          Alert.alert(
            '✅ Success',
            `File successfully downloaded to:\n${folderPath}`,
            [
              { text: 'Open File', onPress: openFile },
              { text: 'OK' }
            ]
          );
          
          if (onDone) onDone({ fullPath, openFile, openFolder });
        } else {
          Alert.alert('Download Failed', `Code: ${res.statusCode}`);
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Download failed');
      });
  } catch (error) {
    Alert.alert('Error', 'Unexpected error occurred');
  }
};
