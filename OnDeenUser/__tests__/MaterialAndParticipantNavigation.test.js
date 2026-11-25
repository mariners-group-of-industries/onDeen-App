const fs = require('fs');
const path = require('path');

const read = relativePath =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('User reference material and participant navigation', () => {
  it('uses the cross-platform RNFS download promise instead of an iOS-unsafe response progress method', () => {
    const source = read('src/FileDownload/filedownload.js');

    expect(source).toContain('RNFS.downloadFile({');
    expect(source).toContain('progress: ({ bytesWritten, contentLength })');
    expect(source).toContain('downloadResult.statusCode !== 200');
    expect(source).not.toContain('downloadResult.progress(');
  });

  it('keeps event participant rows read-only instead of opening a profile', () => {
    const source = read('src/screens/AllParticipantLists/AllParticipantLists.jsx');

    expect(source).not.toContain('TouchableOpacity');
    expect(source).not.toContain("navigation.navigate('ProfileScreen'");
    expect(source).not.toContain('handleParticipantsClick');
    expect(source).toContain('<ParticipantItem user={item} />');
  });

  it('returns a public participant profile to the event participant list', () => {
    const source = read('src/screens/ProfileScreen/ProfileScreen.jsx');

    expect(source).toContain('const onPublicProfileBack = () =>');
    expect(source.indexOf('navigation.goBack();')).toBeLessThan(
      source.indexOf("navigation.navigate('AllParticipants', { event_id: route.params.eventId })"),
    );
    expect(source).toContain("navigation.navigate('AllParticipants', { event_id: route.params.eventId })");
    expect(source).toContain("navigation.navigate('MainNavigator', { screen: 'Home' })");
    expect(source).toContain("publicProfile ? 'Participant profile' : 'Profile'");
    expect(source).toContain('onBack={onPublicProfileBack}');
  });

  it('gives a cold-linked speaker profile a deterministic Home fallback', () => {
    const source = read('src/screens/SpeakerProfile/SpeakerProfile.jsx');

    expect(source).toContain('const handleBack = () =>');
    expect(source).toContain('if (navigation.canGoBack())');
    expect(source).toContain("navigation.navigate('MainNavigator', { screen: 'Home' })");
    expect(source).toContain('onLeftPress={handleBack}');
  });
});
