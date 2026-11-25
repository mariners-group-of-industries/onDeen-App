import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { fontScale, heightScale } from '../../helpers/scale';
import Absent from '../../assets/svg/absent.svg';
import Attend from '../../assets/svg/attend.svg';
import Empty from '../../assets/svg/empty.svg';

export default function ProfileCard({ data = [] }) {
    const renderIcon = (status) => {
        switch (status) {
            case 1:
                return <Attend width={38} height={38} style={styles.topicon} />;
            case 2:
                return <Absent width={38} height={38} style={styles.topicon} />;
            default:
                return <Empty width={38} height={38} style={styles.topicon} />;
        }
    };

    const groupDataInRows = () => {
        const rows = [];
        for (let i = 0; i < data?.length; i += 7) {
            rows.push(data?.slice(i, i + 7));
        }
        return rows;
    };

    if (!Array.isArray(data) || data.length == 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}> Data Not Found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {groupDataInRows().map((row, index) => (
                <View key={index} style={styles.checkboxes}>
                    {row.map((item, idx) => (
                        <View key={idx} style={styles.checkbox}>
                            {renderIcon(item.status)}
                        </View>
                    ))}
                    {row.length < 7 && (
                        Array.from({ length: 7 - row.length }).map((_, idx) => (
                            <View key={`empty-${idx}`} style={styles.checkbox}>
                                <Empty width={38} height={38} style={styles.topicon} />
                            </View>
                        ))
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: heightScale(2),
        marginBottom: heightScale(12),
    },
    checkboxes: {
        flexDirection: 'row',
        marginTop: 10,
    },
    checkbox: {
        marginRight: 10,
    },
    topicon: {
        // Add icon styles if needed
    },
    noDataContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: heightScale(10),
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        borderColor: '#000',

    },
    noDataText: {
        fontSize: fontScale(14),
        color: '#000',
    },
});
