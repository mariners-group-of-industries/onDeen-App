import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Plus from '../assets/svg/plus.svg';
import Vector from '../assets/svg/vector.svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

export default function NoFound({ title='Not Found' }) {
    return (
        <View style={styles.safeArea}>
            <View style={styles.scrollView}>
                <View style={styles.container}>
                    <MaterialIcons name="question-answer" width={100} height={100} size={100}  color={'#DB3171'}/>
                    <Text style={styles.experienceText}>{title}</Text>
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
        backgroundColor: "#FFFF",
        borderRadius: 32,
        paddingVertical: 80,
        alignContent:'center',
        alignItems:'center'
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
