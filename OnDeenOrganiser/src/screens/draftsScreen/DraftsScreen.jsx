import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { apiRequest } from '../../services/api';
import { fontFamilies } from '../../assets/themes/fonts';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';

const parseDraft = draft => {
  try {
    const parsed = JSON.parse(draft?.json_data || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
};

const DraftsScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.token.token?.access_token);
  const bearerToken = useSelector(state => state.user.loginToken);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDrafts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const result = await apiRequest({
        url: '/organizer_app/drafts/get_all_drafts',
        method: 'POST',
        data: { page: 1, per_page: 50 },
        authToken: token,
        bearerToken,
      });
      if (result?.status) {
        setDrafts(Array.isArray(result?.response?.drafts) ? result.response.drafts : []);
      } else {
        setError(result?.response?.message || 'Unable to load drafts.');
      }
    } catch (_) {
      setError('Unable to load drafts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bearerToken, token]);

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [loadDrafts]),
  );

  const openDraft = draft => {
    const data = parseDraft(draft);
    navigation.navigate('CreateEvent', {
      draftId: draft.id,
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      address: data.location || '',
    });
  };

  const deleteDraft = async draft => {
    const result = await apiRequest({
      url: '/organizer_app/drafts/delete',
      method: 'DELETE',
      data: { id: draft.id },
      authToken: token,
      bearerToken,
    });
    if (result?.status) {
      setDrafts(previous => previous.filter(item => item.id !== draft.id));
    } else {
      setError(result?.response?.message || 'Unable to delete draft.');
    }
  };

  const renderDraft = ({ item }) => {
    const data = parseDraft(item);
    const title = String(data.title || '').trim() || 'Untitled draft';
    const description = String(data.description || '').trim();
    return (
      <View style={styles.card}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Open draft ${title}`}
          onPress={() => openDraft(item)}
          style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {data.start_date || 'Schedule not set'}
          </Text>
          {description ? <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text> : null}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Delete draft ${title}`}
          onPress={() => deleteDraft(item)}
          style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Drafts</Text>
        <View style={styles.headerSpacer} />
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#DB3171" /></View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={item => String(item.id)}
          renderItem={renderDraft}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDrafts(true)} />}
          contentContainerStyle={drafts.length ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>{error || 'No drafts yet'}</Text>
              <Text style={styles.emptyCopy}>Save an event as a draft to resume it here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9F6FD' },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: widthScale(20),
    paddingVertical: heightScale(14),
  },
  back: { color: '#161616', fontSize: fontScale(34), lineHeight: fontScale(28), width: widthScale(32) },
  title: { color: '#161616', flex: 1, fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(18), textAlign: 'center' },
  headerSpacer: { width: widthScale(32) },
  list: { padding: widthScale(20), paddingBottom: heightScale(40) },
  emptyList: { flexGrow: 1, padding: widthScale(20) },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#E5DDED',
    borderRadius: widthScale(16),
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: heightScale(12),
    padding: widthScale(14),
  },
  cardBody: { flex: 1, paddingRight: widthScale(12) },
  cardTitle: { color: '#161616', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(16) },
  cardMeta: { color: '#6D6478', fontSize: fontScale(12), marginTop: heightScale(6) },
  cardDescription: { color: '#4C4555', fontSize: fontScale(12), marginTop: heightScale(4) },
  deleteButton: { padding: widthScale(8) },
  deleteText: { color: '#DB3171', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(12) },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: widthScale(24) },
  emptyTitle: { color: '#161616', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(17), textAlign: 'center' },
  emptyCopy: { color: '#6D6478', fontSize: fontScale(13), marginTop: heightScale(8), textAlign: 'center' },
});

export { parseDraft };
export default DraftsScreen;
