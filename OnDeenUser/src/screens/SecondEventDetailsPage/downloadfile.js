import RNFS from 'react-native-fs';
import notifee, { AndroidImportance} from '@notifee/react-native';
import { Platform, ToastAndroid,NativeModules, Linking  } from 'react-native';

export const showNotification = async (title, body, filePath) => {
  await notifee.requestPermission();

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'open_file', // a generic id for press action
      },
    },
    data: filePath
      ? { type: 'open_downloaded_ticket', filePath } // include a type to differentiate notifications
      : {},
  });
};



export const downloadTicket = async (eventDetail) => {
  if (!eventDetail || !eventDetail.ticket) {
    await showNotification('Download Failed', 'Ticket URL is missing.');
    return;
  }

  try {
    const ticketUrl = eventDetail.ticket;
    const fileName = `Ticket_${eventDetail.ticket_no}.pdf`;
    const downloadPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const result = await RNFS.downloadFile({
      fromUrl: ticketUrl,
      toFile: downloadPath,
      background: true,
    }).promise;

    if (result.statusCode === 200) {
      await showNotification(
        'Ticket Downloaded',
        'Tap to open your ticket.',
        downloadPath
      );
    } else {
      await showNotification(
        'Download Failed',
        `Status code: ${result.statusCode}`
      );
    }
  } catch (error) {

    await showNotification(
      'Download Error',
      'An error occurred. Please try again.'
    );
  }
};




export const openFile = async (filePath) => {
  try {
    if (!filePath || typeof filePath !== 'string') {

      return;
    }

    const fileUri = `file://${filePath}`;

    if (Platform.OS === 'android') {
      try {
        // Try default open
        await Linking.openURL(fileUri);
      } catch (err) {


        const IntentModule = NativeModules.IntentLauncher;
        if (IntentModule?.startActivity) {
          IntentModule.startActivity({
            action: 'android.intent.action.VIEW',
            type: 'application/pdf',
            data: fileUri,
            flags: 1,
          });
        } else {
          ToastAndroid.show(
            'Cannot open file. Please open it manually from Downloads.',
            ToastAndroid.LONG
          );
        }
      }
    } else {
      // iOS
      await Linking.openURL(filePath);
    }
  } catch (err) {

  }
};


