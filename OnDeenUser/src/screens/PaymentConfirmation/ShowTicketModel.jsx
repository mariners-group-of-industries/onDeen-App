import React, { useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StyleSheet,
    BackHandler,
    Linking,
    Alert,
    ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import DownloadIcon from '../../assets/svg/download.svg';
import CalendarIcon from '../../assets/svg/calendar.svg';
import ClockIcon from '../../assets/svg/clock.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import { heightScale, widthScale, fontScale } from '../../helpers/scale';
import { useNavigation } from '@react-navigation/native';
import { formatTimeOnly } from '../../timezone/maintimezone';
import { saveOfflineTicketPdf } from '../../FileDownload/offlineTicket';

const ShowTicketModel = ({ isVisible, onClose, ticketData, eventDetail }) => {
    const navigation = useNavigation();

    // Memoized date formatting functions
    const formatDate = useCallback(dateString => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch (e) {
            return 'N/A';
        }
    }, []);

    // Memoized derived data
    const eventTitle = useMemo(() => 
        ticketData?.event_title || ticketData?.title || 'Untitled Event', 
        [ticketData]
    );

    const eventAddress = useMemo(() => 
        ticketData?.address || ticketData?.event_address || ticketData?.location || 'N/A', 
        [ticketData]
    );

    const meetLink = useMemo(() => ticketData?.meet_link || '', [ticketData]);
    const participants = useMemo(() => ticketData?.participants || ticketData?.event_participants || [], [ticketData]);
    const ticketNo = useMemo(() => (
        ticketData?.ticket_no
        || ticketData?.event_ticket_no
        || participants?.[0]?.ticket_no
        || ticketData?.participant_id
        || 'N/A'
    ), [ticketData, participants]);
    const hasVenue = useMemo(() => (
        Number(ticketData?.location_type) !== 0
        && Boolean(ticketData?.address || ticketData?.event_address || ticketData?.location)
    ), [ticketData]);

    // Memoized formatted dates
    const formattedDate = useMemo(() => 
        formatDate(eventDetail?.ticket_date || eventDetail?.start_date), 
        [eventDetail, formatDate]
    );

    const formattedTime = useMemo(() => 
        formatTimeOnly(eventDetail?.ticket_start_time || eventDetail?.start_time, eventDetail?.time_zone, 'time-only'), 
        [eventDetail]
    );

    const downloadContent = async () => {
        const firstParticipant = participants?.[0];
        const fileTicketNo = ticketData?.ticket_no || ticketData?.event_ticket_no || firstParticipant?.ticket_no || ticketData?.participant_id || 'ticket';

        await saveOfflineTicketPdf({
            ticketNo: fileTicketNo,
            eventTitle,
            eventDate: formattedDate,
            eventTime: formattedTime,
            venue: hasVenue ? eventAddress : meetLink,
            participants,
        });
    };

    const onNavigationQR = async (participant) => {
        onClose();
        navigation.navigate('AllqrCode', {
            participantId: participant?.participant_id,
            ticketTitle: participant?.ticket_title,
        });
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (isVisible) {
                    onClose();
                    return true;
                }
                return false;
            }
        );

        return () => backHandler.remove();
    }, [isVisible, onClose]);

    const handleMeetLinkPress = async (meetLink) => {
        if (!meetLink) {
            Alert.alert('No Link Available', 'This event does not have a meeting link yet.');
            return;
        }

        let formattedLink = meetLink;
        if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
            formattedLink = `https://${formattedLink}`;
        }

        const supported = await Linking.canOpenURL(formattedLink);

        if (supported) {
            try {
                await Linking.openURL(formattedLink);
            } catch (error) {
                Alert.alert('Error', 'Failed to open the meeting link.');
                console.error('Error opening URL:', error);
            }
        } else {
            Alert.alert(
                'Unsupported Link',
                `Cannot open this meeting link: ${formattedLink}`,
                [{ text: 'OK', style: 'cancel' }]
            );
        }
    };

    return (
        <Modal
            isVisible={isVisible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor="#000000"
            backdropOpacity={0.5}
            style={styles.bottomModal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            statusBarTranslucent
            avoidKeyboard
            onSwipeComplete={onClose}
            swipeDirection="down"
        >
            <View style={styles.modalTopBottom}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        position: 'absolute',
                        zIndex: 1,
                        marginTop: 160
                    }}>
                        <View style={styles.circleRight} />
                        <View style={styles.circleLeft} />
                    </View>

                    <View style={[styles.ticketHeader]}>
                        <View style={styles.ticketInfo}>
                            <Text style={styles.ticketNumberLabel}>
                                Ticket No. {ticketNo}
                            </Text>
                            <Text style={styles.ticketHeading}>
                                {eventTitle.length > 40
                                    ? `${eventTitle.substring(0, 40)}...`
                                    : eventTitle}
                            </Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            {formattedDate && (
                                <View style={styles.eventDateContainer}>
                                    <Text style={styles.eventDateTime}>Event date</Text>
                                    <View style={styles.dateSubContainer}>
                                        <CalendarIcon />
                                        {formattedDate ? (
                                            <Text style={styles.ticketTimeLabel}>{formattedDate}</Text>
                                        ) : (
                                            <ActivityIndicator size="small" />
                                        )}
                                    </View>
                                </View>
                            )}
                            {formattedTime && (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.eventDateContainer}>
                                        <Text style={styles.eventDateTime}>Event time</Text>
                                        <View style={styles.dateSubContainer}>
                                            <ClockIcon />
                                            {formattedTime ? (
                                                <Text style={styles.ticketTimeLabel}>{formattedTime}</Text>
                                            ) : (
                                                <ActivityIndicator size="small" />
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.ticketBody}>
                        <View style={styles.venueContainer}>
                            {(hasVenue || meetLink) && (
                                <Text style={styles.venueLabel}>
                                    {hasVenue ? 'Venue Details' : 'Event link'}
                                </Text>
                            )}

                            {(hasVenue || meetLink) && (
                                <TouchableOpacity
                                    style={styles.venueAddressContainer}
                                    accessibilityRole={meetLink ? 'link' : undefined}
                                    accessibilityLabel={meetLink ? `Open event link ${meetLink}` : undefined}
                                    onPress={() => {
                                        if (meetLink) {
                                            handleMeetLinkPress(meetLink);
                                        }
                                    }}
                                    disabled={!meetLink}
                                >
                                    <Text style={styles.venueAddressLabel}>
                                        {hasVenue ? eventAddress : meetLink}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            
                            <View style={styles.ticketsContainer}>
                                {participants.length > 0 ? (
                                    participants.map((participant, index) => {
                                        const qrValue = participant?.qrcode || participant?.qr_code || ticketData?.qrcode || eventDetail?.qrcode;
                                        const qrImageUrl = participant?.qrcode_path || participant?.qr_code_path || ticketData?.qrcode_path || eventDetail?.qrcode_path;

                                        return (
                                        <View key={participant?.participant_id || index} style={styles.ticketItem}>
                                            <View style={styles.ticketCard}>
                                                <View style={styles.ticketDetails}>
                                                    <Text style={styles.ticketTitle}>
                                                        TICKET ID: {participant?.ticket_no || 'N/A'}
                                                    </Text>
                                                    <Text style={styles.ticketType}>
                                                        {participant?.ticket_title || 'General Admission'}
                                                    </Text>
                                                    <Text style={styles.ticketAmount}>
                                                        {parseFloat(participant?.paid_amount || 0) === 0
                                                            ? 'Free'
                                                            : `Amount: £${Intl.NumberFormat('en-GB', {
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 2,
                                                            }).format(parseFloat(participant?.paid_amount))}`}
                                                        {parseFloat(participant?.paid_amount || 0) > 0 ? ' (Paid)' : ''}
                                                    </Text>
                                                </View>

                                                {qrValue ? (
                                                    <View
                                                        accessible
                                                        accessibilityRole="image"
                                                        accessibilityLabel={`Ticket QR code ${participant?.ticket_no || ticketNo}`}
                                                        style={styles.qrCodeFallback}
                                                    >
                                                        <QRCode
                                                            value={String(qrValue)}
                                                            size={widthScale(78)}
                                                            backgroundColor="#FFFFFF"
                                                        />
                                                    </View>
                                                ) : qrImageUrl ? (
                                                    <Image
                                                        accessible
                                                        accessibilityLabel={`Ticket QR code ${participant?.ticket_no || ticketNo}`}
                                                        resizeMode="contain"
                                                        source={{ uri: qrImageUrl }}
                                                        style={styles.qrCode}
                                                    />
                                                ) : null}
                                            </View>

                                            <View style={styles.ticketFooter}>
                                                {participant?.quantity && (
                                                    <Text style={styles.ticketCount}>
                                                        You've {participant.quantity}{' '}
                                                        {'ticket'}
                                                        {participant.quantity > 1 ? 's' : ''}
                                                    </Text>
                                                )}

                                                {participant?.qrcode_count > 1 && (
                                                    <TouchableOpacity
                                                        onPress={() => { onNavigationQR(participant) }}>
                                                        <Text style={styles.viewAllText}>View all</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                        );
                                    })
                                ) : (
                                    <Text style={styles.noTicketsText}>No tickets found</Text>
                                )}
                            </View>

                            <View style={[styles.actionButtons, { marginHorizontal: -30 }]}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={onClose}>
                                    <Text style={styles.buttonText}>BACK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    accessibilityLabel="Download ticket for offline use"
                                    accessibilityRole="button"
                                    style={styles.downloadButton}
                                    onPress={downloadContent}>
                                    <DownloadIcon />
                                    <Text style={[styles.buttonText, styles.downloadButtonText]}>
                                        DOWNLOAD
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalTopBottom: {
        backgroundColor: 'white',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    scrollView: {
        backgroundColor: '#FFE289',
        borderRadius: 28,
        maxHeight: 700,
        paddingBottom: 40,
    },
    ticketHeader: {
        backgroundColor: '#FFF',
        paddingTop: 50,
        // paddingBottom: 50,
        minHeight: 230
    },
    ticketInfo: {
        marginTop: 18,
    },
    ticketNumberLabel: {
        fontSize: fontScale(14),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        textAlign: 'center',
        lineHeight: 18,
    },
    ticketHeading: {
        fontSize: fontScale(18),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        textAlign: 'center',
        lineHeight: 24,
        marginTop: heightScale(8),
    },
    dateTimeContainer: {
        padding: 12,
        flexDirection: 'row',
        gap: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 34,
    },
    eventDateContainer: {
        alignItems: 'center',
    },
    eventDateTime: {
        fontSize: fontScale(12),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 15,
    },
    dateSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: heightScale(4),
    },
    ticketTimeLabel: {
        fontSize: fontScale(14),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 18,
    },
    divider: {
        height: 32,
        width: 1,
        backgroundColor: '#000000',
    },
    circleRight: {
        height: 35,
        width: 35,
        top: 52,
        right: 18,
        backgroundColor: '#333233',
        borderRadius: 34,
        zIndex: 11,
    },
    circleLeft: {
        height: 35,
        width: 35,
        top: 18,
        left: Dimensions.get('screen').width * 0.958,
        backgroundColor: '#333233',
        borderRadius: 34,
        zIndex: 11,
    },
    ticketBody: {
        backgroundColor: '#FFE289',
        borderTopWidth: 2,
        borderStyle: 'dashed',
    },
    venueContainer: {
        marginTop: heightScale(40),
        paddingLeft: widthScale(71),
        paddingRight: widthScale(60),
        alignItems: 'center',
        paddingBottom: 30,
    },
    venueLabel: {
        fontSize: fontScale(16),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 20,
    },
    venueAddressContainer: {
        alignItems: 'center',
        paddingTop: 14,
    },
    venueAddressLabel: {
        fontSize: fontScale(14),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 18,
        textAlign: 'center',
    },
    ticketsContainer: {
        marginTop: heightScale(20),
        alignItems: 'center',
        gap: heightScale(6),
    },
    ticketItem: {
        alignItems: 'center',
        marginBottom: heightScale(20),
    },
    ticketCard: {
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
        width: widthScale(352),
    },
    ticketDetails: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: fontScale(12),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 15,
    },
    ticketType: {
        fontSize: fontScale(16),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 20,
        marginTop: heightScale(4),
    },
    ticketAmount: {
        fontSize: fontScale(14),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 18,
        marginTop: heightScale(4),
    },
    qrCode: {
        width: widthScale(84),
        height: widthScale(84),
    },
    qrCodeFallback: {
        width: widthScale(84),
        height: widthScale(84),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: heightScale(10),
        width: '100%',
    },
    ticketCount: {
        fontSize: fontScale(12),
        color: '#222222',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 15,
    },
    viewAllText: {
        color: '#DB3171',
        fontSize: fontScale(12),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 15,
    },
    noTicketsText: {
        fontSize: fontScale(16),
        color: '#333',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: heightScale(12),
    },
    backButton: {
        backgroundColor: '#1E1E1F',
        paddingHorizontal: widthScale(24),
        gap: 8,
        height: heightScale(44),
        borderRadius: 90,
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadButton: {
        backgroundColor: '#FFF9E9',
        paddingHorizontal: widthScale(24),
        height: heightScale(44),
        borderRadius: 90,
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    buttonText: {
        fontSize: fontScale(14),
        color: '#FFFFFF',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        lineHeight: 18,
    },
    downloadButtonText: {
        color: '#000',
        paddingLeft: 5,
    },

});

export default ShowTicketModel;
