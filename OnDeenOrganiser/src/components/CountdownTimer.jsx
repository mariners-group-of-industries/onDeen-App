import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontScale } from "../helpers/scale";
import { fontFamilies } from "../assets/themes/fonts";

const CountdownTimer = ({ startDate }) => {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const difference = new Date(startDate) - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        let remainingTime = "";
        if (days > 0) {
          remainingTime += `${days}d `;
        }
        remainingTime += `${hours}h ${minutes}m ${seconds}s`;

        setTimeRemaining(remainingTime);
      } else {
        setTimeRemaining("Event has started");
      }
    };

    const timer = setInterval(updateRemainingTime, 1000);
    updateRemainingTime();

    return () => clearInterval(timer);
  }, [startDate]);

  return <View style={styles.countdownContainer}><Text style={styles.countdownLabel}>{timeRemaining}</Text></View>;
};


const styles = StyleSheet.create({
  countdownContainer: {
    width: 126,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F6FD",
    borderRadius: 4,
    paddingVertical: 2,
    // marginRight: 68,
  },
  countdownLabel: {
    color: "#3E146F",
    fontSize: fontScale(12),
    marginRight: 7,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  countdownTime: {
    color: "#268F3D",
    fontSize: fontScale(12),
  },
})
export default CountdownTimer;

