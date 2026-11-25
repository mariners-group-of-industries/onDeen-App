import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { downloadAndOpenPDF } from './downloadit';

const DownloadScreen = () => {
  const [progress, setProgress] = useState(null);
  const [openHandlers, setOpenHandlers] = useState(null);

  const handleDownload = () => {
    downloadAndOpenPDF({
      fileUrl: 'http://127.0.0.1:8088/static/uploads/tickets/sample.pdf',
      ticketId: 'fe098d7b-e2a8-4004-a232-a94a602d71sbd',
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Download Ticket PDF" onPress={handleDownload} />

      {/* {progress && <Text style={{ marginTop: 12 }}>Progress: {progress}%</Text>}

      {openHandlers && (
        <>
          <Button title="Open PDF" onPress={openHandlers.openPDF} />
          <Button title="Open Folder" onPress={openHandlers.openFolder} />
        </>
      )} */}
    </View>
  );
};

export default DownloadScreen;
