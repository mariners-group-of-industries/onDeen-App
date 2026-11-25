const fs = require('fs');
const path = require('path');

describe('organiser draft list and resume wiring', () => {
  const screenSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/draftsScreen/DraftsScreen.jsx'),
    'utf8',
  );
  const createSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/CreateEvent.jsx'),
    'utf8',
  );
  const homeSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/MainHomeScreen/MainHomeScreen.jsx'),
    'utf8',
  );

  it('loads, opens and deletes authenticated drafts', () => {
    expect(screenSource).toContain("url: '/organizer_app/drafts/get_all_drafts'");
    expect(screenSource).toContain("url: '/organizer_app/drafts/delete'");
    expect(screenSource).toContain("navigation.navigate('CreateEvent'");
    expect(screenSource).toContain('draftId: draft.id');
    expect(screenSource).toContain('JSON.parse(draft?.json_data ||');
  });

  it('hydrates CreateEvent from a selected draft and exposes the home entry point', () => {
    expect(createSource).toContain("url: '/organizer_app/drafts/get_by_id'");
    expect(createSource).toContain('setAccount(previous => ({ ...previous, ...draftData }))');
    expect(createSource).toContain('draftId');
    expect(homeSource).toContain('accessibilityLabel="Open drafts"');
    expect(homeSource).toContain("navigation.navigate('Drafts')");
  });
});
