import React, { useState } from 'react';
import {
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Alert,
  Text,
} from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';

const FileDownloadScreen = () => {
  const [filePath, setFilePath] = useState(null);
  const [progress, setProgress] = useState(null);

  const fileName = 'sample.pdf';
  const folderName = 'OndeenUser';
  const fileUrl = 'http://127.0.0.1:8088/static/uploads/tickets/sample.pdf';

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

  const downloadFile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot download file without permission');
      return;
    }

    const folderPath = `${RNFS.DownloadDirectoryPath}/${folderName}`;
    const fullPath = `${folderPath}/${fileName}`;

    try {
      await RNFS.mkdir(folderPath); // Ensure folder exists

      RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: fullPath,
        progress: (res) => {
          const percent = (res.bytesWritten / res.contentLength) * 100;
          setProgress(percent.toFixed(2));
        },
      })
        .promise.then((res) => {
          if (res.statusCode === 200) {
            setFilePath(fullPath);


            // Make visible to Android Downloads
            ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: 'application/pdf' }]);

            Alert.alert('Success', `File downloaded to:\n${folderPath}`);
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

  const openPDF = () => {
    if (!filePath) return;

    ReactNativeBlobUtil.android
      .actionViewIntent(filePath, 'application/pdf')
      .catch((err) => {

        Alert.alert('Error', 'Could not open the PDF file.');
      });
  };

const openFolder = () => {
  const folderPath = `${RNFS.DownloadDirectoryPath}/OndeenUser`;

  ReactNativeBlobUtil.android
    .actionViewIntent(folderPath, 'resource/folder') // mime type for folders
    .then(() => {

    })
    .catch((err) => {

      Alert.alert(
        'Cannot Open Folder',
        `Your device restricts programmatic folder opening.\n\nOpen manually:\n${folderPath}`
      );
    });
};


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Button title="Download PDF" onPress={downloadFile} />

      {progress && (
        <Text style={{ marginTop: 12 }}>Download Progress: {progress}%</Text>
      )}

      {filePath && (
        <>
          <View style={{ marginTop: 20 }}>
            <Button title="Open PDF" onPress={openPDF} />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button title="Open Folder" onPress={openFolder} />
          </View>
        </>
      )}
    </View>
  );
};

export default FileDownloadScreen;
