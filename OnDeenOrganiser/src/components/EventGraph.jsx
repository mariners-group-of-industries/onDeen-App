import { View, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { fontFamilies } from "../assets/themes/fonts";

export default function EventGraph({ item = [] }) {
    ;

    // Get the screen width
    const screenWidth = Dimensions.get("window").width;

    // Get the last 6 data points
    const lastSixItems = item.slice(-9);

    // Map bar data safely
    const barData = lastSixItems.length
        ? lastSixItems.map((dataPoint) => ({
              value: dataPoint?.participant_count > 0 ? dataPoint.participant_count : 0,
              label: dataPoint?.date ? `${new Date(dataPoint.date).getDate()}` : '',
              frontColor: '#FFD700', // Yellow
              
          }))
        : [{ value: 0, label: 'N/A', frontColor: '#FFD700' }]; // Fallback

    return (
        <View style={styles.container}>
            <BarChart
                barWidth={10} // Dynamically calculate bar width
                data={barData}
                yAxisThickness={0} // Hide Y-axis
                xAxisThickness={0} // Hide X-axis
                hideYAxisText // Remove Y-axis text
                xAxisLabelTextStyle={{
                    color: '#737373',
                    fontSize: 12,
                    // marginTop: 5,
                        fontFamily: fontFamilies.SFProRoundedBlackMedium,
                    
                }}
                height={125} // Set chart height
                isAnimated // Smooth animations
                yAxisLines={false} // Hide horizontal grid lines (no dashed or dotted lines)
                xAxisLines={false} // Hide vertical grid lines (no dashed or dotted lines)
                backgroundColor="white" // Set the background of the chart to white (no patterns)
         
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginVertical:0,
        borderRadius:10
    },
});
