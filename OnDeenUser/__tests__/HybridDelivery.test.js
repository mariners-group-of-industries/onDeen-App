const fs = require('fs');
const path = require('path');

const read = relativePath => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('hybrid listing delivery', () => {
  it('labels hybrid listings distinctly in User event details and discovery', () => {
    expect(read('src/screens/SecondEventDetailsPage/EventLabelContainer.jsx')).toContain("? 'Hybrid'");
    expect(read('src/screens/BottomHomePage/RenderListItem.jsx')).toContain('Hybrid');
    expect(read('src/screens/GlobalSearchResults/GlobalSearchResults.jsx')).toContain('Hybrid');
  });

  it('shows both venue and meeting-link details for hybrid listings', () => {
    const location = read('src/screens/FirstEventDetailsPage/LocationContainer.jsx');
    expect(location).toContain('[0, 2].includes');
    expect(location).toContain('[1, 2].includes');
  });

  it('allows either valid hybrid check-in method without changing Radar semantics', () => {
    expect(read('src/screens/OnlineCheckInCode/OnlineCheckInCode.jsx')).toContain('[0, 2].includes');
    const details = read('src/screens/SecondEventDetailsPage/SecondEventDetailsPage.jsx');
    expect(details.match(/\[0, 2\]\.includes/g)).toHaveLength(1);
    expect(details.match(/\[1, 2\]\.includes/g)).toHaveLength(1);
  });

  it('requires the complete six-digit code before calling the backend', () => {
    const onlineCheckIn = read('src/screens/OnlineCheckInCode/OnlineCheckInCode.jsx');
    expect(onlineCheckIn).toContain('cleanedCode.length !== 6');
    expect(onlineCheckIn).toContain('Enter the complete 6-digit code.');
  });
});
