import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Share, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import DetailsScreen from './FirstTab/DetailsScreen';
import User2 from '../../assets/svg/event/user2.svg';
import Doller from '../../assets/svg/event/doller.svg';
import { nocommavalue } from '../../common/datetimeformate';
import { fontFamilies } from '../../assets/themes/fonts';
import { BASE_URL } from '../../helpers/Constant';
import { showResponce } from '../../responce/showResponce';

export default function FirstTab({ eventbyid, onRefreshEvent, sessionDate }) {
    const [tab, setTab] = useState(1)
    const [exportingCsv, setExportingCsv] = useState(false)
    const navigation = useNavigation();
    const token = useSelector((state) => state.token.token?.access_token);
    const bearerToken = useSelector((state) => state.user.loginToken);
    const feedback = eventbyid?.feedback_aggregate || {};
    const feedbackResponses = Array.isArray(feedback?.responses) ? feedback.responses : [];
    const ratingText = value => {
        const number = Number(value || 0);
        return number ? number.toFixed(1).replace('.0', '') : '0';
    };
    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const localFeedbackCsv = () => {
        const rows = [
            ['session_date', 'event_title', 'engagement_rating', 'delivery_rating', 'suggestion', 'skipped'],
            ...feedbackResponses.map(item => [
                item.session_date || '',
                item.event_title || eventbyid?.title || '',
                item.engagement_rating || '',
                item.delivery_rating || '',
                item.suggestion || '',
                item.skipped ? 'yes' : 'no',
            ]),
        ];
        return rows.map(row => row.map(escapeCsv).join(',')).join('\n');
    };
    const exportFeedbackCsv = async () => {
        if (!eventbyid?.id || exportingCsv) {
            return;
        }
        setExportingCsv(true);
        try {
            let csvText = '';
            if (typeof __DEV__ !== 'undefined' && __DEV__ && bearerToken === 'debug-token') {
                csvText = localFeedbackCsv();
            } else {
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token && { 'auth-token': token }),
                    ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
                };
                const response = await fetch(`${BASE_URL}/organizer_app/event/feedback_csv`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ event_id: eventbyid.id }),
                });
                const body = await response.text();
                const contentType = response.headers?.get?.('content-type') || '';
                if (!response.ok || contentType.includes('application/json')) {
                    let message = 'Unable to export feedback CSV.';
                    let parsedError = false;
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed?.status === false || !response.ok) {
                            message = parsed?.response?.message || parsed?.response || parsed?.message || message;
                            parsedError = true;
                        }
                    } catch (_) {}
                    if (parsedError || !response.ok) {
                        throw new Error(message);
                    }
                }
                csvText = body;
            }
            await Share.share({
                title: `${eventbyid?.title || 'event'} feedback.csv`,
                message: csvText || localFeedbackCsv(),
            });
        } catch (error) {
            showResponce(error?.message || 'Unable to export feedback CSV.', 3);
        } finally {
            setExportingCsv(false);
        }
    };
    const movetoUpdateEvent = () => {
        navigation.navigate('CreateEvent', { id: eventbyid?.id, latitude: eventbyid?.latitude, longitude: eventbyid?.longitude, address: eventbyid?.location });

    }



    return (
        <View style={styles.safeAreaView}>
            <View style={[styles.scrollView, { backgroundColor: '#fff' }]} showsVerticalScrollIndicator={false}>
                {
                    tab == 1 &&
                    <>
                        <View style={styles.infoContainer}>
                            <View style={styles.weeklyEventsContainer}>
                                <View style={styles.weeklyEventsBox}>
                                    <Text style={[styles.weeklyEventsText]}>{"Total Registrants"}</Text>
                                    <User2 />
                                </View>
                                <Text style={styles.weeklyEventsCount}>{eventbyid?.total_participants_count}</Text>
                            </View>
                            <View style={[styles.weeklyEventsContainer, { backgroundColor: "#FFF4D4" }]}>
                                <View style={styles.weeklyEventsBox}>
                                    <Text style={[styles.weeklyEventsText, { color: "#7235B8" }]}>{"Total Revenue"}</Text>
                                    <Doller />
                                </View>
                                <Text style={styles.weeklyEventsCount1}>£ <Text style={styles.weeklyEventsCount}>{nocommavalue(eventbyid?.total_revenue)}</Text></Text>
                            </View>
                        </View>
                        <View style={styles.feedbackCard}>
                            <View style={styles.feedbackHeader}>
                                <View>
                                    <Text style={styles.feedbackEyebrow}>SESSION FEEDBACK</Text>
                                    <Text style={styles.feedbackHint}>All attendee feedback for this event.</Text>
                                </View>
                                <View style={styles.feedbackHeaderActions}>
                                    <View style={styles.feedbackBadge}>
                                        <Text style={styles.feedbackBadgeText}>{feedback?.submitted_count || 0} responses</Text>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        onPress={exportFeedbackCsv}
                                        disabled={exportingCsv}
                                        style={[styles.feedbackExportButton, exportingCsv && styles.feedbackExportButtonDisabled]}
                                    >
                                        {exportingCsv ? (
                                            <ActivityIndicator size="small" color="#3E146F" />
                                        ) : (
                                            <Text style={styles.feedbackExportText}>Export CSV</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.feedbackStatsRow}>
                                <View style={styles.feedbackStat}>
                                    <Text style={styles.feedbackStatValue}>{ratingText(feedback?.average_engagement)}/5</Text>
                                    <Text style={styles.feedbackStatLabel}>Engagement</Text>
                                </View>
                                <View style={styles.feedbackStat}>
                                    <Text style={styles.feedbackStatValue}>{ratingText(feedback?.average_delivery)}/5</Text>
                                    <Text style={styles.feedbackStatLabel}>Delivery</Text>
                                </View>
                                <View style={styles.feedbackStat}>
                                    <Text style={styles.feedbackStatValue}>{feedback?.skipped_count || 0}</Text>
                                    <Text style={styles.feedbackStatLabel}>Skipped</Text>
                                </View>
                            </View>

                            {feedbackResponses.length > 0 ? (
                                <View style={styles.feedbackResponseList}>
                                    {feedbackResponses.map(item => (
                                        <View key={String(item.id)} style={styles.feedbackResponse}>
                                            <Text style={styles.feedbackResponseMeta}>
                                                {item.session_date || 'Session'} - {item.engagement_rating || 0}/5, {item.delivery_rating || 0}/5
                                            </Text>
                                            <Text style={styles.feedbackResponseText}>
                                                {item.suggestion || 'No written suggestion.'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.feedbackEmptyText}>No feedback submitted yet.</Text>
                            )}
                        </View>
                    </>
                }
            </View>
            <DetailsScreen eventbyid={eventbyid} onRefreshEvent={onRefreshEvent} sessionDate={sessionDate} />
        </View>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        background: '#F9F6FD',
    },
    scrollView: {
        flex: 1,
        paddingTop: 6,
    },
    headerContainer: {
        flexDirection: "row",
        marginHorizontal: 21,
    },
    iconContainer: {
        width: 28,
        height: 28,
        backgroundColor: "#403350",
        borderColor: "#000000",
        borderRadius: 90,
        borderWidth: 1,
    },
    topicon: {
        marginTop: 4,
        marginLeft: 15
    },
    tabsecondicon: {
        marginRight: -10,
        marginTop: 5
    },
    imageContainer: {
        position: "relative",
    },
    universityText: {
        color: "#000000",
        fontSize: fontScale(14),
        fontWeight: '500',
        paddingLeft: 6
    },
    rightIcon1: {
        marginTop: 4,
        marginRight: 33,
    },
    rightIcon2: {
        marginTop: 7,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E4DEF1",
        borderRadius: 48,
        padding: widthScale(4),
        marginVertical: widthScale(18),
        marginHorizontal: 21,
    },
    tabItem: {
        width: '50%',
        alignItems: "center",
        borderRadius: 24,
        paddingVertical: 12,
    },
    tabText: {
        color: "#3E146F",
        fontSize: fontScale(14),
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 21,
        gap: 4
    },
    weeklyEventsContainer: {
        width: '50%',
        height: '100%',
        backgroundColor: "#FFECF3",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    weeklyEventsBox: {
        flexDirection: "row",
        marginBottom: 12,
    },
    weeklyEventsText: {
        color: "#DB3171",
        fontSize: fontScale(12),
        flex: 1,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },

    weeklyEventsCount1: {
        color: "#3E146F",
        fontSize: fontScale(14),
    },
    weeklyEventsCount: {
        color: "#3E146F",
        fontSize: fontScale(20),
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    feedbackCard: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E4DEF1',
        borderRadius: widthScale(22),
        borderWidth: 1,
        marginHorizontal: widthScale(21),
        marginTop: heightScale(16),
        padding: widthScale(18),
    },
    feedbackHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: widthScale(10),
        justifyContent: 'space-between',
    },
    feedbackEyebrow: {
        color: '#3E146F',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(12),
    },
    feedbackHint: {
        color: '#6F6878',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        fontSize: fontScale(11),
        marginTop: heightScale(4),
    },
    feedbackBadge: {
        backgroundColor: '#FFF2F7',
        borderRadius: widthScale(18),
        paddingHorizontal: widthScale(12),
        paddingVertical: heightScale(7),
    },
    feedbackBadgeText: {
        color: '#DB3171',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(11),
    },
    feedbackHeaderActions: {
        alignItems: 'flex-end',
        gap: heightScale(8),
    },
    feedbackExportButton: {
        alignItems: 'center',
        borderColor: '#3E146F',
        borderRadius: widthScale(18),
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: heightScale(32),
        minWidth: widthScale(92),
        paddingHorizontal: widthScale(10),
    },
    feedbackExportButtonDisabled: {
        opacity: 0.55,
    },
    feedbackExportText: {
        color: '#3E146F',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(11),
    },
    feedbackStatsRow: {
        flexDirection: 'row',
        gap: widthScale(8),
        marginTop: heightScale(16),
    },
    feedbackStat: {
        backgroundColor: '#F7F2FA',
        borderRadius: widthScale(14),
        flex: 1,
        paddingHorizontal: widthScale(10),
        paddingVertical: heightScale(12),
    },
    feedbackStatValue: {
        color: '#17101F',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(16),
    },
    feedbackStatLabel: {
        color: '#6F6878',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        fontSize: fontScale(10),
        marginTop: heightScale(3),
    },
    feedbackResponseList: {
        gap: heightScale(8),
        marginTop: heightScale(14),
    },
    feedbackResponse: {
        borderColor: '#ECE5F1',
        borderRadius: widthScale(14),
        borderWidth: 1,
        padding: widthScale(12),
    },
    feedbackResponseMeta: {
        color: '#3E146F',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
        fontSize: fontScale(11),
    },
    feedbackResponseText: {
        color: '#17101F',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        fontSize: fontScale(12),
        lineHeight: heightScale(17),
        marginTop: heightScale(5),
    },
    feedbackEmptyText: {
        color: '#6F6878',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
        fontSize: fontScale(12),
        marginTop: heightScale(14),
    },
    upcomingEventsContainer: {
        backgroundColor: "#F9F6FD",
        borderRadius: 32,
        paddingTop: 27,
        paddingBottom: 72,
        paddingHorizontal: 24,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0
    },
    sectionTitle: {
        color: "#191719",
        fontSize: fontScale(16),
        marginBottom: 16,
        fontWeight: '700'
    },
    upcomingEventBox: {
        backgroundColor: "#F0EAFF",
        borderRadius: 16,
        padding: widthScale(24),
        marginBottom: 16,
    },
    upcomingEventHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 11,
    },
    countdownContainer: {
        width: 126,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F6FD",
        borderRadius: 4,
        paddingVertical: 6,
        marginRight: 68,
    },
    countdownLabel: {
        color: "#3E146F",
        fontSize: fontScale(12),
        marginRight: 7,
    },
    countdownTime: {
        color: "#268F3D",
        fontSize: fontScale(12),
    },
    statusContainer: {
        width: 100,
        alignItems: "center",
        borderColor: "#3E146F",
        borderRadius: 32,
        borderWidth: 1,
        paddingVertical: 7,
        marginRight: 14,
    },
    statusText: {
        color: "#3E146F",
        fontSize: fontScale(10),
    },
    eventTitle: {
        color: "#3E146F",
        fontSize: fontScale(16),
        marginBottom: 7,
        fontWeight: '600'
    },
    eventDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    dateIcon: {
        marginRight: 7,
    },
    eventDate: {
        color: "#3E146F",
        fontSize: fontScale(12),
        flex: 1,
    },
    locationIcon: {
        marginRight: 7,
    },
    eventLocation: {
        color: "#3E146F",
        fontSize: fontScale(12),
    },
    recentEventBox: {
        backgroundColor: "#F4EFF8",
        borderRadius: 16,
        padding: widthScale(24),
        marginBottom: 16,
    },
    recentEventHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    eventTime: {
        color: "#3E146F",
        fontSize: fontScale(12),
        marginRight: 4,
        flex: 1,
    },
    activeTab: {
        backgroundColor: "#fff",
    },
    activeTabText: {
        color: "#3E146F",
    },
});
