import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { geteventListing } from "../../redux/slices/geteventListingSlice";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDatewithmonthname } from "../../common/datetimeformate";
import NoData from "./NoData";
import ParticipantImages from "../../common/ParticipantImages";
import CountdownTimer from "../../components/CountdownTimer";
import ListFilter from "./ListFilter";
import Dropup from '../../assets/svg/chevron-down.svg';
import Share from '../../assets/svg/sharelist.svg';
import Calendar from '../../assets/svg/calendar.svg';
import Markerpin from '../../assets/svg/markerpin.svg';
import { filteredeventListing } from "../../redux/slices/geteventFilteredListingSlice";
import { fontFamilies } from "../../assets/themes/fonts";

export default function EventListing({ title, tab, refreshing, setRefreshing }) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [displayFilter, setDisplayFilter] = useState(false);
    const [filter, setFilter] = useState({
        "status": 1,
        "page": 1,
        "per_page": 10,
        "recently_added_days": 1
    });
    const [filter1, setFilter1] = useState({
        //  "start_date": "2024-10-01",
        //  "end_date": "2024-10-31",
        //  "keyword": "workshop",

        //   "min_price": 50,
        //  "max_price": 200,
        //   "min_classes": 5,
        //   "max_classes": 15,
        //   "latitude": 40.7128,
        //  "longitude": -74.0060,
        //  "radius": 10,
        // "sort_by": "price",
        //  "sort_order": "asc",
        //"upcoming_days": 16
        "category_id": "",
        "price_type": "",
        "speaker_id": "",
        "location_type": "",
        // All Events is intentionally unscoped by status; the backend keeps
        // completed/cancelled history while excluding only deleted rows.
        "status": "",
        "page": 1,
        "per_page": 10,
        "recently_added_days": 1
    });


    const [isCourseExpanded, setIsCourseExpanded] = useState(true);

    useEffect(() => {
        fetchDataWithFilter();
    }, [filter1]);

    const fetchDataWithFilter = async () => {
        setRefreshing(true);
        dispatch(filteredeventListing(filter1));
        setRefreshing(false);
    };

    const { getfilteredeventlist } = useSelector((state) => state.getfilteredeventlist);
    const { geteventlist } = useSelector((state) => state.geteventlist);
    const list = tab == 1 ? geteventlist?.events : getfilteredeventlist?.events || [];

    useFocusEffect(
        React.useCallback(() => {
            fetchDataWithFilter();
            return () => { };
        }, [])
    );

    const navigateToEventDetails = (item) => {
        navigation.navigate('MainEventDetail', { id: item?.id });
    };

    const navigateToCreateEvent = () => {
        navigation.navigate('CreateEvent', { id: '', latitude: '', longitude: '', address: '' });
    };

    const UpcomingEvents = {
        status: 1,
        page: 1,
        per_page: 10,
        upcoming_days: 1,
    };

    const OngoingEvents = {
        status: 1,
        page: 1,
        per_page: 10,
        ongoing_days: 1,
    };

    // Completed includes naturally ended and explicitly cancelled listings.
    // Leaving status unset is intentional: the backend's completed filter
    // owns that distinction and must not hide cancelled reference data.
    const CompletedEvents = {
        page: 1,
        per_page: 10,
        completed_days: 1,
    };
   
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        // The All Events tab owns its filtered request below. Running the
        // section requests here as well would race the shared Redux slice and
        // could leave All Events showing whichever response finished last.
        if (tab === 2) {
            return;
        }
        try {
            setLoading(true);
            const [upcomingResponse, ongoingResponse, completedResponse] = await Promise.all([
                dispatch(filteredeventListing(UpcomingEvents)),
                dispatch(filteredeventListing(OngoingEvents)),
                dispatch(filteredeventListing(CompletedEvents)),
            ]);

           
            if (upcomingResponse?.payload?.response?.events) {
                setData1(upcomingResponse.payload.response.events);
            }

           
            if (ongoingResponse?.payload?.response?.events) {
                setData2(ongoingResponse.payload.response.events);
            }

            if (completedResponse?.payload?.response?.events) {
                setData3(completedResponse.payload.response.events);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            return () => { };
        }, [])
    );

    const renderFilterModal = () => (
        <Modal
            visible={displayFilter}
            onRequestClose={() => setDisplayFilter(false)}
            transparent={true}
            animationType="slide"
            hardwareAccelerated={true}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 20 }]}>
                    <ListFilter
                        setDisplayFilter={setDisplayFilter}
                        filter1={filter1}
                        setFilter1={setFilter1}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderEventList = () => {

        const data = tab == 1
            ? title === 'Upcoming Events'
                ? data1
                : title === 'Ongoing Events'
                    ? data2
                    : title === 'Completed Events'
                        ? data3
                    : []
            : list;
        if (Array.isArray(data) && data.length == 0) {
            return <NoData navigateToCreateEvent={navigateToCreateEvent} />;
        }

        return (
            <View>

                {Array.isArray(data) && data.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        accessibilityLabel={`Open ${item.title}`}
                        accessibilityRole="button"
                        style={[styles.eventBox, { backgroundColor: item?.status === 2 ? '#FFF4D4' : "#F0EAFF" }]}
                        onPress={() => navigateToEventDetails(item)}
                        activeOpacity={0.6}
                    >
                        <TouchableOpacity style={styles.eventHeader} >
                            <CountdownTimer startDate={item?.start_date} />
                            <Share />
                        </TouchableOpacity>
                        <Text style={styles.eventTitle}>{item.title?.length > 25 ? `${item.title.slice(0, 25)}...` : item.title}</Text>
                        <View style={[styles.eventDetails, { marginBottom: 20 }]}>
                            <Calendar />
                            <Text style={styles.eventDate}>{getDatewithmonthname(item.start_date)}</Text>
                        </View>
                        <View style={styles.locationContainer}>
                            {
                                item.location_type == 1 &&
                                <View style={styles.eventDetails}>
                                    <Markerpin />
                                    <Text style={styles.eventLocation}>{item.location?.length > 25 ? `${item.location.slice(0, 25)}...` : item.location}</Text>
                                </View>
                            }

                            <ParticipantImages item={item} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )
    };



    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {tab === 2 && (
                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', paddingBottom: 10 }} onPress={() => setDisplayFilter(true)}>
                        <Text style={styles.filtertext}>Sort by : All  </Text>
                        <Dropup width={20} height={20} color={'#191719'} />
                    </TouchableOpacity>
                )}
            </View>

            {displayFilter && renderFilterModal()}

            {renderEventList()}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#f3432",
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        color: "#191719",
        fontSize: 16,
        marginBottom: 16,
        fontFamily: fontFamilies.SFProRoundedBlackBold,
    },
    eventBox: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
    },
    eventHeader: {
        flexDirection: "row",
        alignItems: "center",
       
        justifyContent: "space-between",
    },
    shareIcon: {
        color: '#3E146F',
    },
    eventTitle: {
        color: "#3E146F",
        fontSize: 16,
        marginBottom: 7,
        fontWeight: '600',
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    eventDetails: {
        flexDirection: "row",
        justifyItem: 'center',
        alignItems: "center",
    },
    icon: {
        marginRight: 7,
    },
    eventDate: {
        color: "#3E146F",
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
    locationContainer: {
        flexDirection: 'row',
        justifyItem: 'center',
        alignItems: "center",
        justifyContent: 'space-between',
    },
    eventLocation: {
        color: "#3E146F",
        fontSize: 12,
        fontFamily: fontFamilies.SFProRoundedBlackMedium,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay with opacity
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',  // Limit the height of the modal
        padding: 20,
        marginTop: 'auto',
    },
    filtertext: {
        fontSize: 12,
        color: '#191719',
        fontFamily: fontFamilies.SFProRoundedBlackRegular,
    },
});
