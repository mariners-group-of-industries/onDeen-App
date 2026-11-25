const fs = require('fs');
const path = require('path');

describe('organiser event preview', () => {
  const previewSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/PreviewEvent.jsx'),
    'utf8',
  );
  const confirmSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/Confirm.jsx'),
    'utf8',
  );
  const navigatorSource = fs.readFileSync(
    path.join(__dirname, '../src/navigation/AllAccessNavigator.jsx'),
    'utf8',
  );

  it('renders dynamic listing data and keeps material visibility informational', () => {
    expect(previewSource).toContain('route?.params?.data || {}');
    expect(previewSource).toContain('data.title');
    expect(previewSource).toContain('data.description');
    expect(previewSource).toContain('Available to booked attendees');
    expect(previewSource).not.toContain('The Knowledge Class');
  });

  it('provides a return-to-edit action and is registered in the authenticated stack', () => {
    expect(confirmSource).toContain("navigation.navigate('PreviewEvent'");
    expect(confirmSource).toContain('Preview User View');
    expect(previewSource).toContain('accessibilityLabel="Return to edit event"');
    expect(previewSource).toContain('navigation.goBack()');
    expect(navigatorSource).toContain('name="PreviewEvent"');
  });
});
