// utils/downloadFile.js
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import MimeTypes from 'react-native-mime-types';

export const downloadFileALLTypes = async ({
  fileUrl,
  fileName,
  onProgress,
  onDone,
  onError,
}) => {
  try {
    // Validate input
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Extract file extension safely
    const urlParts = fileUrl.split('?')[0].split('.');
    const fileExtension = urlParts.length > 1 ? urlParts.pop().toLowerCase() : 'bin';
    const finalFileName = fileName || `${Date.now()}.${fileExtension}`;
    const folderName = 'OndeenUser';
    const baseDirectory = Platform.OS === 'android'
      ? RNFS.DownloadDirectoryPath
      : RNFS.DocumentDirectoryPath;
    const folderPath = `${baseDirectory}/${folderName}`;
    const fullPath = `${folderPath}/${finalFileName}`;

    // Get mime type
    const mimeType = MimeTypes.lookup(fileExtension) || 'application/octet-stream';

    // Request permissions
    const requestStoragePermission = async () => {
      if (Platform.OS === 'android') {
        try {
          // For Android 13+ (API level 33+)
          if (Platform.Version >= 33) {
            const permissions = [
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
              // Add WRITE_EXTERNAL_STORAGE for broader compatibility
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ];
            
            const results = await PermissionsAndroid.requestMultiple(permissions);
            
            // Check if any of the permissions were granted
            const granted = Object.values(results).some(
              result => result === PermissionsAndroid.RESULTS.GRANTED
            );
            
            return granted;
          } 
          // For Android < 13
          else {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission',
                message: 'App needs access to storage to download files',
                buttonPositive: 'OK',
              }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          }
        } catch (err) {
          console.error('Permission error:', err);
          return false;
        }
      }
      return true; // iOS handles permissions differently
    };

    // Check and request permissions
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      throw new Error('Storage permission denied. Please grant storage permissions in app settings.');
    }

    // Create directory if it doesn't exist
    await RNFS.mkdir(folderPath).catch(err => {
      console.warn('Directory creation warning:', err);
      // If directory creation fails, try using ReactNativeBlobUtil's filesystem
      return ReactNativeBlobUtil.fs.mkdir(folderPath);
    });

    // RNFS exposes the same progress contract on iOS and Android. The
    // ReactNativeBlobUtil response does not consistently expose `.progress()`
    // on iOS, which caused the reference download redbox.
    const downloadResult = await RNFS.downloadFile({
      fromUrl: fileUrl,
      toFile: fullPath,
      progressDivider: 1,
      progress: ({ bytesWritten, contentLength }) => {
        if (onProgress && contentLength > 0) {
          onProgress(((bytesWritten / contentLength) * 100).toFixed(2));
        }
      },
    }).promise;

    if (downloadResult.statusCode !== 200) {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }

    // Make file visible in gallery (Android)
    if (Platform.OS === 'android') {
      try {
        await ReactNativeBlobUtil.fs.scanFile([{ path: fullPath, mime: mimeType }]);
      } catch (scanError) {
        console.warn('File scanning failed:', scanError);
      }
    }

    // Success handling
    const result = { 
      success: true, 
      path: fullPath,
      fileName: finalFileName,
      folderPath,
      mimeType
    };

    onDone?.(result);
    return result;

  } catch (error) {
    console.error('Download error:', error);
    const errorMessage = error.message || 'Failed to download file';
    onError?.(error);
    return { success: false, error: errorMessage };
  }
};
