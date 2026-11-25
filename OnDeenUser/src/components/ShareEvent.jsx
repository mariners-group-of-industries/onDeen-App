import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";

export default function ShareEvent() {
  const imageUrl = "https://ondeen.app/assets/images/banner-img1.png";

  const message = `
🎉 You're Invited! 🎉

📅 Date: Sunday, 25th August 2025
⏰ Time: 6:00 PM - 10:00 PM
📍 Venue: City Convention Hall, Mumbai
🌐 Event Website: https://ondeen.app

✨ Highlights:
- Live Music & Performances
- Special Guest Speakers
- Free Goodies & Dinner Included

#Event #Networking #Fun
`;

  const downloadAndShare = async () => {
    try {
      // create local file path
      const localPath = `${RNFS.CachesDirectoryPath}/poster.jpg`;

      // download image
      await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: localPath,
      }).promise;

      // share image + message
      const shareOptions = {
        title: "Join this Event",
        message: message,
        url: "file://" + localPath, // 👈 local file path works
        type: "image/jpeg",
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.log("Error =>", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Event</Text>
      <Button title="Share Poster & Details" onPress={downloadAndShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
});
