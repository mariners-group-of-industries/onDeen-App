import { Alert, Linking } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { buildOfflineTicketHtml } from './ticketPdfTemplate';

const safeFilePart = (value) => String(value || 'ticket')
  .replace(/[^a-zA-Z0-9_-]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 80) || 'ticket';

export const createOfflineTicketPdf = async ({
  ticketNo,
  eventTitle,
  eventDate,
  eventTime,
  venue,
  participants,
}) => {
  const fileName = `Ticket_${safeFilePart(ticketNo)}`;
  const html = await buildOfflineTicketHtml({
    eventTitle,
    eventDate,
    eventTime,
    venue,
    participants,
  });
  const result = await RNHTMLtoPDF.convert({
    html,
    fileName,
    directory: 'Documents',
    width: 612,
    height: 792,
    bgColor: '#FFF9E9',
  });

  if (!result?.filePath) {
    throw new Error('PDF file path is missing');
  }

  return { fileName: `${fileName}.pdf`, filePath: result.filePath };
};

export const saveOfflineTicketPdf = async (ticket) => {
  try {
    const saved = await createOfflineTicketPdf(ticket);
    Alert.alert(
      'Ticket saved offline',
      `${saved.fileName} is stored on this device with its QR code.`,
      [
        {
          text: 'Open',
          onPress: () => Linking.openURL(`file://${saved.filePath}`),
        },
        { text: 'OK', style: 'cancel' },
      ],
    );
    return saved;
  } catch (error) {
    Alert.alert('Download failed', 'The offline ticket could not be created. Please try again.');
    return null;
  }
};
