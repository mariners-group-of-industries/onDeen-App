import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import React, { useState } from 'react';
import RenderHTML from 'react-native-render-html';
import DownloadIcon from '../../../src/assets/svg/download.svg';
import { fontFamilies } from '../../assets/fonts/fonts';
import { useToastForPopup } from '../../context/ToastContext';
import { downloadFileALLTypes } from '../../FileDownload/filedownload';
import { Download, ExternalLink } from 'lucide-react-native';

export default function StudyMaterialContainer({ eventDetail }) {
  const showToast = useToastForPopup();
  const [downloadingFiles, setDownloadingFiles] = useState({});

  const handleDownload = async (file) => {
    console.log(file.file_path, 'file url');

    try {
      setDownloadingFiles(prev => ({ ...prev, [file.id]: true }));

      const result = await downloadFileALLTypes({
        fileUrl: file.file_path,
        fileName: file.file_name || `document_${file.id}`,
        onProgress: (percent) => {
          console.log(`Download progress: ${percent}%`);
        },
      });

      if (result.success) {
        showToast(`${file.file_name || 'Material'} downloaded`, 'success');
      } else {
        showToast(result.error || 'Failed to download file', 'error');
      }
    } catch (error) {
      console.error('Download error:', error);
      showToast('An error occurred while downloading', 'error');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [file.id]: false }));
    }
  };
  const openinBrowser = async (file) => {
    const url = file?.file_path;

    if (!url) {
      Alert.alert('Invalid URL');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert('Cannot open this file URL');
    }
  };

  const renderFileItem = (file) => {
    const isDownloading = downloadingFiles[file.id];

    return (
      <View
        key={file.id}
        disabled={isDownloading}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E2E2',
          paddingVertical: 8,
          paddingHorizontal: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          opacity: isDownloading ? 0.6 : 1,
          gap: 15
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#000000',
              fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
              fontSize: 12,
            }}
            numberOfLines={2}
          >
            {file.file_name || `Material ${file.id}`}
          </Text>
          <Text
            style={{
              color: '#7A6B82',
              fontFamily: fontFamilies.SFProRoundedBlackRegular,
              fontSize: 10,
              marginTop: 2,
              textTransform: 'uppercase',
            }}>
            {file.file_type || 'file'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            accessibilityLabel={`Open ${file.file_name || `Material ${file.id}`}`}
            accessibilityRole="link"
            onPress={() => openinBrowser(file)}
            disabled={isDownloading}>
            <ExternalLink color={'#5A2A82'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={`Download ${file.file_name || `Material ${file.id}`}`}
            accessibilityRole="button"
            onPress={() => handleDownload(file)}
            disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <Download color={'#6C757D'} size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

    );
  };

  const renderDocumentItem = (doc) => (
    <View
      key={doc.id}
      style={{
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        borderRadius: 20,
      }}
    >
      <Text style={{
        fontSize: 12,
        fontWeight: '500',
        color: '#545454',
        marginBottom: 8,
      }}>
        Info
      </Text>

      <RenderHTML
        source={{ html: `<div>${doc.document_name}</div>` }}
        baseStyle={{
          fontSize: 12,
          fontWeight: '400',
          color: '#545454',
        }}
      />

      {doc?.files?.map(renderFileItem)}
    </View>
  );

  return (
    <ScrollView style={{ paddingHorizontal: 24 }}>
      <View style={{ marginTop: 24 }}>
        <Text style={{
          fontSize: 12,
          color: '#0E0D0E',
          fontFamily: fontFamilies.SFProRoundedBlackSemiBold,
        }}>
          FILES AND DOCUMENT
        </Text>
        <Text style={{
          fontSize: 12,
          fontWeight: '400',
          color: '#545454',
        }}>
          Material provided by the organiser
        </Text>

        {eventDetail?.documents?.length > 0 ? (
          <View style={{ marginTop: 12, gap: 12 }}>
            {eventDetail.documents.map(renderDocumentItem)}
          </View>
        ) : (
          <View style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E2E2E2',
            padding: 14,
            marginTop: 12,
            minHeight: 76,
            justifyContent: 'center',
          }}>
            <View style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2E2E2',
              minHeight: 42,
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}>
              <Text style={{
                color: '#999',
                fontFamily: fontFamilies.SFProRoundedBlackRegular,
                fontSize: 12,
              }}>
                No files added
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
