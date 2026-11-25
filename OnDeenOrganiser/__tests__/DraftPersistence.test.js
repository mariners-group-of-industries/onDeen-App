const fs = require('fs');
const path = require('path');

describe('organiser draft persistence', () => {
  const confirmSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/Confirm.jsx'),
    'utf8',
  );
  const createSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/CreateEvent.jsx'),
    'utf8',
  );

  it('saves the complete form through the authenticated Drafts endpoint', () => {
    expect(confirmSource).toContain("url: '/organizer_app/drafts/create'");
    expect(confirmSource).toContain('json_data: JSON.stringify(draftData)');
    expect(confirmSource).toContain('authToken: token');
    expect(confirmSource).toContain('bearerToken');
    expect(confirmSource).toContain('showToast(result?.response?.message || \'Draft saved successfully.\'');
  });

  it('keeps draft saving separate from publishing and preserves edited ticket values', () => {
    expect(confirmSource).toContain('onPress={saveDraft}');
    expect(confirmSource).not.toContain('onPress={() => { setActivetab(2) }}');
    expect(confirmSource).toContain('const source = { ...account, ...values };');
    expect(createSource).toContain('draftId');
  });

  it('strips source-listing relation IDs when a resumed draft is published as a new listing', () => {
    expect(confirmSource).toContain('prepareDraftForPublish');
    expect(confirmSource).toContain('draftId && !id');
    expect(confirmSource).toContain("['images', 'tickets', 'curriculum', 'itinerary', 'speakers']");
    expect(confirmSource).toContain('files.map(withoutId)');
  });
});
