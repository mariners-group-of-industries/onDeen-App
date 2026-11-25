import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Plus from '../../assets/svg/plus.svg';
import Vector from '../../assets/svg/vector.svg';

export default function NoData({ navigateToCreateEvent }) {
    return (
        <View style={styles.safeArea}>
            <View style={styles.scrollView}>
                <View style={styles.container}>
                    <Vector width={'100%'} height={'40%'} />
                    <Text style={styles.noEventsText}>{"No events yet"}</Text>
                    <Text style={styles.experienceText}>{"Experience the Magic, Live"}</Text>
                    <TouchableOpacity style={styles.createEventButton} onPress={navigateToCreateEvent}>
                        <Text style={styles.createEventText}>{"Create event "}</Text>
                        <View
                            onPress={navigateToCreateEvent}>
                            <Plus width={24} height={24} style={styles.topicon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        padding: 10,
    },
    scrollView: {
        flex: 1,
        borderRadius: 32,
    },
    container: {
        backgroundColor: "#F9F6FD",
        borderRadius: 32,
        paddingVertical: 80,
    },
    image: {
        height: 52,
    },
    noEventsText: {
        color: "#191719",
        fontSize: 12,
        marginBottom: 16,
        alignSelf: "center",
    },
    experienceText: {
        color: "#3E146F",
        fontSize: 12,
        marginBottom: 15,
        alignSelf: "center",
    },
    createEventButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#422199",
        borderRadius: 24,
        borderWidth: 1,
        paddingVertical: 12,
    },
    createEventText: {
        color: "#161616",
        fontSize: 12,
        marginRight: 5,
    },
    buttonIcon: {
        width: 24,
        height: 24,
    },
});
