import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontScale, heightScale, widthScale} from '../../helpers/scale';
import {fontFamilies} from '../../assets/themes/fonts';

const valueOrFallback = (value, fallback = 'Not provided') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  return String(value);
};

const dateLabel = value => {
  const source = String(value || '');
  const isoMatch = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }
  return valueOrFallback(value);
};

const locationLabel = type => {
  const normalized = Number(type);
  if (normalized === 0) return 'Online';
  if (normalized === 2) return 'Hybrid';
  return 'In person';
};

const audienceLabel = value => {
  const normalized = Number(value);
  if (normalized === 1) return 'Brothers';
  if (normalized === 2) return 'Sisters';
  return 'All';
};

const speakerLabel = speaker => {
  if (!speaker) return 'Unnamed speaker';
  if (typeof speaker === 'string') return speaker;
  const name = [speaker.first_name, speaker.last_name].filter(Boolean).join(' ').trim();
  return valueOrFallback(name || speaker.name || speaker.title, 'Unnamed speaker');
};

const documentLabel = document => {
  if (!document) return 'Unnamed material';
  if (typeof document === 'string') return document;
  return valueOrFallback(
    document.document_name || document.name || document.title || document.file_name,
    'Unnamed material',
  );
};

const imageUri = image => {
  if (typeof image === 'string') return image;
  if (!image || typeof image !== 'object') return '';
  return image.uri || image.url || image.file_path || image.image_url || '';
};

const Section = ({title, children}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const DetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{valueOrFallback(value)}</Text>
  </View>
);

const PreviewEvent = ({route, navigation}) => {
  const data = route?.params?.data || {};
  const images = Array.isArray(data.images) ? data.images : [];
  const documents = Array.isArray(data.documents) ? data.documents : [];
  const speakers = Array.isArray(data.speakers) ? data.speakers : [];
  const curriculum = Array.isArray(data.curriculum) ? data.curriculum : [];
  const coverUri = imageUri(images[0]);
  const isFree = Number(data.price_type) === 2 || Number(data.price || 0) === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Back to edit"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <Text style={styles.headerHint}>User view</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {coverUri ? (
            <Image accessibilityLabel="Event cover" source={{uri: coverUri}} style={styles.cover} />
          ) : (
            <View accessibilityLabel="Event cover placeholder" style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>Event cover</Text>
            </View>
          )}
          <Text style={styles.previewEyebrow}>EVENT PREVIEW</Text>
          <Text style={styles.title}>{valueOrFallback(data.title, 'Untitled event')}</Text>
          <Text style={styles.description}>{valueOrFallback(data.description)}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>{isFree ? 'FREE' : 'Ticketed'}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>{locationLabel(data.location_type)}</Text></View>
          </View>
        </View>

        <Section title="Schedule">
          <DetailRow label="Date" value={data.start_date === data.end_date || !data.end_date
            ? dateLabel(data.start_date)
            : `${dateLabel(data.start_date)} – ${dateLabel(data.end_date)}`} />
          <DetailRow label="Time" value={`${valueOrFallback(data.start_time)} – ${valueOrFallback(data.end_time)}`} />
          <DetailRow label="Recurrence" value={data.occusr_weekday ? `Weekly · ${data.occusr_weekday}` : 'One-off'} />
        </Section>

        <Section title="Event details">
          <DetailRow label="Delivery" value={locationLabel(data.location_type)} />
          {Number(data.location_type) !== 0 ? <DetailRow label="Location" value={data.location} /> : null}
          {Number(data.location_type) !== 1 ? <DetailRow label="Meeting link" value={data.meet_link} /> : null}
          <DetailRow label="Audience" value={audienceLabel(data.gender)} />
          <DetailRow label="Language" value={data.language_title || data.language_id} />
          <DetailRow label="Suitable for" value={data.journey_level_title || data.journey_level_id} />
        </Section>

        <Section title="About this event">
          <DetailRow label="Eligibility" value={data.eligibility} />
          <DetailRow label="What's included" value={data.rule} />
          <DetailRow label="Cancellation policy" value={data.cancellation_policy} />
          <DetailRow label="Terms & conditions" value={data.terms_condition} />
        </Section>

        {speakers.length > 0 ? (
          <Section title="Speakers">
            <View style={styles.chipRow}>
              {speakers.map((speaker, index) => (
                <View key={`${speaker?.id || speaker?.user_id || 'speaker'}-${index}`} style={styles.chip}>
                  <Text style={styles.chipText}>{speakerLabel(speaker)}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {curriculum.length > 0 ? (
          <Section title="Course breakdown">
            {curriculum.map((item, index) => (
              <View key={`${item?.id || 'class'}-${index}`} style={styles.classRow}>
                <Text style={styles.classIndex}>{index + 1}</Text>
                <View style={styles.classCopy}>
                  <Text style={styles.classTitle}>{valueOrFallback(item?.description || item?.title, `Class ${index + 1}`)}</Text>
                  <Text style={styles.classMeta}>
                    {dateLabel(item?.start_date || item?.date)}{item?.start_time ? ` · ${item.start_time}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </Section>
        ) : null}

        {documents.length > 0 ? (
          <Section title="Event material">
            {documents.map((document, index) => (
              <View key={`${document?.id || document?.document_name || 'material'}-${index}`} style={styles.materialRow}>
                <Text style={styles.materialName}>{documentLabel(document)}</Text>
                <Text style={styles.materialHint}>Available to booked attendees</Text>
              </View>
            ))}
          </Section>
        ) : null}

        <TouchableOpacity
          accessibilityLabel="Return to edit event"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.editButton}>
          <Text style={styles.editButtonText}>Return to edit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: '#FAF8FD', flex: 1},
  header: {alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#ECE7F0', borderBottomWidth: 1, flexDirection: 'row', minHeight: heightScale(58), paddingHorizontal: widthScale(18)},
  backButton: {alignItems: 'center', height: heightScale(38), justifyContent: 'center', width: widthScale(38)},
  backIcon: {color: '#24122F', fontSize: fontScale(34), fontWeight: '300', lineHeight: fontScale(34)},
  headerTitle: {color: '#24122F', flex: 1, fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(19), marginLeft: widthScale(5)},
  headerHint: {color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11)},
  content: {padding: widthScale(16), paddingBottom: heightScale(36)},
  heroCard: {backgroundColor: '#FFFFFF', borderColor: '#E6DFF0', borderRadius: widthScale(24), borderWidth: 1, overflow: 'hidden', paddingBottom: heightScale(18)},
  cover: {backgroundColor: '#EEE8F6', height: heightScale(150), width: '100%'},
  coverPlaceholder: {alignItems: 'center', backgroundColor: '#EEE8F6', height: heightScale(150), justifyContent: 'center'},
  coverPlaceholderText: {color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(13)},
  previewEyebrow: {color: '#DB3171', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(10), letterSpacing: 0.8, marginHorizontal: widthScale(18), marginTop: heightScale(16)},
  title: {color: '#17101F', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(24), marginHorizontal: widthScale(18), marginTop: heightScale(5)},
  description: {color: '#5D5667', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(13), lineHeight: fontScale(19), marginHorizontal: widthScale(18), marginTop: heightScale(8)},
  badgeRow: {flexDirection: 'row', gap: widthScale(8), marginHorizontal: widthScale(18), marginTop: heightScale(14)},
  badge: {backgroundColor: '#E9FFD9', borderRadius: widthScale(16), paddingHorizontal: widthScale(12), paddingVertical: heightScale(7)},
  badgeText: {color: '#267A2D', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(11)},
  section: {backgroundColor: '#FFFFFF', borderColor: '#E6DFF0', borderRadius: widthScale(20), borderWidth: 1, marginTop: heightScale(14), padding: widthScale(16)},
  sectionTitle: {color: '#24122F', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(16), marginBottom: heightScale(8)},
  detailRow: {borderBottomColor: '#F0ECF3', borderBottomWidth: 1, paddingVertical: heightScale(9)},
  detailLabel: {color: '#7A7183', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(11)},
  detailValue: {color: '#211B26', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(13), lineHeight: fontScale(18), marginTop: heightScale(3)},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: widthScale(8)},
  chip: {backgroundColor: '#F4EAF5', borderRadius: widthScale(16), paddingHorizontal: widthScale(12), paddingVertical: heightScale(8)},
  chipText: {color: '#4D216D', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(12)},
  classRow: {alignItems: 'center', borderTopColor: '#F0ECF3', borderTopWidth: 1, flexDirection: 'row', paddingVertical: heightScale(10)},
  classIndex: {backgroundColor: '#F4EAF5', borderRadius: widthScale(16), color: '#4D216D', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(12), height: widthScale(30), lineHeight: widthScale(30), textAlign: 'center', width: widthScale(30)},
  classCopy: {flex: 1, marginLeft: widthScale(10)},
  classTitle: {color: '#211B26', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(13)},
  classMeta: {color: '#7A7183', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11), marginTop: heightScale(3)},
  materialRow: {borderTopColor: '#F0ECF3', borderTopWidth: 1, paddingVertical: heightScale(10)},
  materialName: {color: '#211B26', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(13)},
  materialHint: {color: '#7A7183', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11), marginTop: heightScale(3)},
  editButton: {alignItems: 'center', borderColor: '#422199', borderRadius: widthScale(28), borderWidth: 1, justifyContent: 'center', marginTop: heightScale(18), minHeight: heightScale(52)},
  editButtonText: {color: '#422199', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(14)},
});

export default PreviewEvent;
