import React from 'react';
import {
  ScrollView,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import DownloadIcon from '../../../src/assets/svg/download.svg';
import CalendarIcon from '../../../src/assets/svg/calendar.svg';
import ClockIcon from '../../../src/assets/svg/clock.svg';
import styles from './styles';
import { heightScale, widthScale } from '../../helpers/scale';

const TicketsModel = ({
  isVisible,
  onClose,
  data,
  formattedDate,
  formattedTime,
  downloadContent,
  navigation,
   // Pass the styles from parent component
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      style={{
        margin: 0,
        justifyContent: 'center',
        margin: 0,
        height: 500,
        flex: 1,
      }}
      statusBarTranslucent
      backdropColor="#000000"
      closeOnBackdropPress={onClose}
      onBackdropPress={() => onClose()}
    >
      <ScrollView style={{
        backgroundColor: '#FFE289',
        borderRadius: 10,
        borderRadius: 28,
        maxHeight: 600,
        paddingBottom: 40,
      }}>
        <View
          style={{
            borderBottomWidth: 2,
            borderStyle: 'dashed',
            backgroundColor: '#FFF',
            paddingTop: 50,
          }}>
          <View style={{ marginTop: 18 }}>
            <Text style={styles.ticketNumberLabel}>
              Ticket No. {data?.ticket_no}
            </Text>
            <Text style={styles.ticketHeading}>
              {data?.event_title && data?.event_title?.length > 40
                ? `${data?.event_title?.substring(0, 40)}...`
                : data?.event_title || 'Untitled Event'}
            </Text>
          </View>
          <View
            style={{
              padding: 12,
              flexDirection: 'row',
              gap: 24,
              justifyContent: 'space-between',
              alignItems: 'center',
              marginHorizontal: 34,
            }}>
            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDateTime}>Event date</Text>
              <View style={styles.dateSubContainer}>
                <CalendarIcon />
                <Text style={styles.tickeTimeLabel}>{formattedDate}</Text>
              </View>
            </View>

            <View
              style={{
                height: 32,
                width: 1,
                backgroundColor: '#000000',
              }}
            />

            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDateTime}>Event time</Text>
              <View style={styles.dateSubContainer}>
                <ClockIcon />
                <Text style={styles.tickeTimeLabel}>{formattedTime}</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              height: 35,
              width: 35,
              top: 52,
              right: 18,
              backgroundColor: '#333233',
              borderRadius: 34,
              zIndex: 11,
            }}>
          </View>
          <View
            style={{
              height: 35,
              width: 35,
              top: 18,
              left: Dimensions.get('screen').width * 0.958,
              backgroundColor: '#333233',
              borderRadius: 34,
              zIndex: 11,
            }}>
          </View>
        </View>
        <View style={{ backgroundColor: '#FFE289' }}>
          <View
            style={{
              marginTop: heightScale(40),
              paddingLeft: widthScale(71),
              paddingRight: widthScale(60),
              alignItems: 'center',
              paddingBottom: 30
            }}>
            {data?.event_address ? <Text style={styles.venueLabel}>Venue Details</Text> :
              <Text style={styles.venueLabel}>Online Meeting Link</Text>
            }
            <View style={{ alignItems: 'center', paddingTop: 14 }}>
              <Text style={styles.venueAddressLabel}>{data?.event_address ? data?.event_address : data?.meet_link}</Text>
            </View>

            <View
              style={{
                marginTop: heightScale(20),
                alignItems: 'center',
                gap: heightScale(6),
              }}>
              {data?.participants?.length > 0 ? (
                data?.participants?.map((participant, index) => (
                  <View
                    key={participant?.participant_id}
                    style={{
                      alignItems: 'center',
                      marginBottom: heightScale(20),
                    }}>
                    <View
                      style={{
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
                      }}>
                      {/* Left Side - Ticket Details */}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.ticketTitle}>
                          TICKET ID: {participant?.ticket_no}
                        </Text>
                        <Text style={styles.ticketType}>
                          {participant?.ticket_title}
                        </Text>

                        <Text style={styles.ticketAmount}>
                          {parseFloat(participant?.paid_amount) === 0
                            ? 'Free'
                            : `Amount: £${Intl.NumberFormat('en-GB', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(parseFloat(participant?.paid_amount))}`}
                          {parseFloat(participant?.paid_amount) > 0 ? ' (Paid)' : ''}
                        </Text>

                      </View>

                      {/* Right Side - QR Code */}
                      <Image
                        resizeMode="contain"
                        source={{ uri: participant?.qrcode_path }}
                        style={{
                          width: widthScale(84),
                          height: widthScale(84),
                        }}
                      />
                    </View>

                    {/* Show "View all" if qrcode_count > 1 */}
                    {/* Total Ticket Count */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginTop: heightScale(10),
                        width: '100%',
                      }}>
                      {/* Left Side: Total Tickets Count */}
                      {data?.participants?.length > 0 &&
                        participant && (
                          <Text
                            style={{
                              fontSize: fontScale(12),
                              color: '#222222',
                              fontFamily:
                                fontFamilies.SFProRoundedBlackMedium,
                              lineHeight: 15,
                            }}>
                            You've {participant?.quantity}{' '}
                            {participant?.ticket_title}
                            {participant?.quantity > 1
                              ? ' tickets'
                              : ' ticket'}
                          </Text>
                        )}

                      {/* Right Side: View All */}
                      {participant?.qrcode_count > 1 && (
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('AllqrCode', {
                              participantId: participant?.participant_id,
                              ticketTitle: participant?.ticket_title,
                            });
                          }}>
                          <Text
                            style={{
                              color: '#DB3171',
                              fontSize: fontScale(12),
                              fontFamily:
                                fontFamilies.SFProRoundedBlackMedium,
                              lineHeight: 15,
                            }}>
                            View all
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: fontScale(16), color: '#333' }}>
                  No tickets found
                </Text>
              )}
            </View>

            <View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  marginTop: heightScale(12),
                }}>
                <TouchableLabel
                  labelStyle={styles.ticketLabel}
                  containerStyle={{
                    backgroundColor: '#1E1E1F',
                    paddingHorizontal: widthScale(24),
                    gap: 8,
                    height: heightScale(44),
                    borderRadius: 90,
                    width: 152,
                  }}
                  label={'BACK'}
                  onPress={onClose}
                />
                <TouchableLabel
                  label={'DOWNLOAD'}
                  onPress={downloadContent}
                  labelStyle={[styles.ticketLabel, { color: '#000', paddingLeft: 5 }]}
                  containerStyle={{
                    backgroundColor: '#FFF9E9',
                    paddingHorizontal: widthScale(24),
                    height: heightScale(44),
                    borderRadius: 90,
                    width: 160
                  }}
                  leftImageStyle={styles.ticketLabel}
                  leftImage={<DownloadIcon />}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default TicketsModel;