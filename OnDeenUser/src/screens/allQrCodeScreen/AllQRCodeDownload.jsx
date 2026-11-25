import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import LatestHeader from '../../components/LatestHeader';
import { fontFamilies } from '../../assets/fonts/fonts';
import styles from './styles';
import { getTicketQRcodesAPI } from '../../redux/callapis/CommonService';
import { downloadAndOpenPDF } from '../../FileDownload/downloadit';
import { useStatusBar } from '../../components/statusbar';
import { Download, ExternalLink, Share2, ShareIcon } from 'lucide-react-native';

const AllqrCode = ({ route }) => {
  const { participantId, ticketTitle = 'Event' } = route.params || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [allQrcodes, setAllQrcodes] = useState([]);

  useEffect(() => {
    if (participantId) {
      getTicketQRcodes();
    }
  }, [participantId]);

  const getTicketQRcodes = async () => {
    const data = { 'participant_id': participantId };
    try {
      const res = await getTicketQRcodesAPI({ data });
      setAllQrcodes(res?.response || []);
    } catch (err) {
      setAllQrcodes([]);
    }
  };

  const handleDownloadAll = async () => {
    if (!allQrcodes || allQrcodes.length === 0) return;

    for (const item of allQrcodes) {
      await downloadAndOpenPDF({
        fileUrl: item.qrcode_path,
        ticketId: `Ticket_${item.ticket_no}`,
      });
    }
  };

  const handleDownloadOld = async (item) => {

    try {

      const result = await downloadAndOpenPDF({
        fileUrl: item.qrcode_path,
        ticketId: `Ticket_${item.ticket_no}`,
        fileName: `Ticket_${item.ticket_no}`,
        onProgress: (percent) => {
          console.log(`Download progress: ${percent}%`);
        },
      });

      if (result.success) {
        // showToast('File downloaded successfully!', 'success');
      } else {
        // showToast(result.error || 'Failed to download file', 'error');
      }
    } catch (error) {
      // console.error('Download error:', error);
      // showToast('An error occurred while downloading', 'error');
    } finally {
    }
  };


  const handleShareTicket = async (ticket) => {
    try {
      const eventName = ticketTitle || 'Event';
      const amount = ticket.paid_amount !== "0.00"
        ? `SR ${ticket.paid_amount} (Paid)`
        : 'Free Ticket';

      const shareOptions = {
        title: `Share ${eventName} Ticket`,
        message: `Check out my ticket for ${eventName}!\nTicket ID: ${ticket.ticket_no}\nType: ${amount}`,
        url: ticket.qrcode_path, // This will share the QR code image
      };

      // For Android, we need to use a different approach to share image + text
      if (Platform.OS === 'android') {
        shareOptions.message = `${shareOptions.message}\n\nQR Code: ${ticket.qrcode_path}`;
      }

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing ticket:', error.message);
    }
  };

  const openQRCodeImage = (imageUrl) => {
    Linking.openURL(imageUrl).catch(err =>
      console.error('Failed to open QR code image:', err)
    );
  };

  const ContainerComponent = SafeAreaView;

  useStatusBar({ backgroundColor: '#EDE9F1', barStyle: 'dark-content' });
  const openinBrowser = async (item) => {
    const url = item?.qrcode_path;

    if (!url) {
      Alert.alert('Invalid URL');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Cannot open this item URL');
    }
  };
  return (
    <ContainerComponent style={{ backgroundColor: '#EDE9F1', flex: 1 }}>
      <LatestHeader
        statusBarColor="#EDE9F1"
        containerStyle={{
          justifyContent: 'space-between',
        }}
        leftIconName="chevron-left"
        onLeftPress={() => navigation.goBack()}
        titleStyle={{
          color: '#000000',
          fontSize: fontScale(16),
          fontFamily: fontFamilies.SFProRoundedBlackMedium,
        }}
        title={`Tickets`}
        // isDownloadAll={true}
        onDownloadAllPress={handleDownloadAll}
        isDownloadStyle={{
          color: '#DB3171',
          fontFamily: fontFamilies.SFProRoundedBlackBold,
          fontSize: fontScale(12),
          marginLeft: widthScale(110),
        }}
      />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* <Text style={styles.headerLabel}>Tap to share the ticket</Text> */}
        <View style={{
          marginTop: heightScale(20),
          alignItems: 'center',
          gap: heightScale(6),
        }}>
          {allQrcodes?.length > 0 ? (
            allQrcodes.map((item, index) => (
              <View
                key={item?.ticket_no || index}
                style={{ alignItems: 'center' }}
                // onPress={() => handleShareTicket(item)}
                // onLongPress={() => handleDownloadOld(item)}
                activeOpacity={0.7}
              >
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#FEFDFF',
                  borderRadius: 16,
                  paddingVertical: heightScale(16),
                  paddingHorizontal: widthScale(20),
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  width: '85%',
                  marginBottom:10
                }}>

                  {/* Left Side - Ticket Details */}
                  <View style={{ flex: 1 }}>

                    <Text style={styles.ticketIndex}>{index + 1}</Text>

                    <Text style={[styles.ticketTitle, { paddingTop: 12 }]}>
                      TICKET ID: {item?.ticket_no}
                    </Text>
                    <Text style={[styles.ticketAmount]}>
                      Amount: {item.paid_amount != "0.00"
                        ? `SR ${item.paid_amount} (Paid)`
                        : 'Free Ticket'}
                    </Text>
                    <Text style={styles.ticketType}>{ticketTitle}</Text>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: -20 }}>
                      <TouchableOpacity onPress={() => openinBrowser(item)}>
                        <ExternalLink color="#6C757D" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDownloadOld(item)}>
                        <Download color="#4CAF50" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleShareTicket(item)}>
                        <Share2 color="#2196F3" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Right Side - QR Code */}
                  <TouchableOpacity
                    // onPress={() => openQRCodeImage(item.qrcode_path)}
                    activeOpacity={0.7}
                  >
                    <Image
                      resizeMode="contain"
                      source={{ uri: item?.qrcode_path }}
                      style={{
                        width: widthScale(84),
                        height: widthScale(84),
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: fontScale(16), color: '#333' }}>
              No tickets found
            </Text>
          )}
        </View>
      </ScrollView>
    </ContainerComponent>
  );
};

export default AllqrCode;