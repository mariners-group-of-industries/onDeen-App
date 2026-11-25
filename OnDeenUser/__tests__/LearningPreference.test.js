const fs = require('fs');
const path = require('path');

const read = relativePath => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('learning preference stays separate from earned progression', () => {
  it('uses preference language in registration and profile editing', () => {
    expect(read('src/screens/RegisterScreen/Registration.jsx')).toContain("label={'Learning preference'}");
    expect(read('src/screens/EditProfile/EditProfile.jsx')).toContain('label="Learning preference"');
  });

  it('does not reuse the profile rank or Radar UI as the preference selector', () => {
    const profile = read('src/screens/ProfileScreen/ProfileScreen.jsx');
    expect(profile).toContain('<CurrentRankCard');
    expect(profile).toContain('<OnDeenRadarSection');
    expect(profile).not.toContain('name="journey_level_id"');
  });

  it('presents the organiser choice as event suitability on event details', () => {
    const eventSuitability = read('src/screens/SecondEventDetailsPage/JourneyLevelContainer.jsx');
    expect(eventSuitability).toContain('Suitable for');
    expect(eventSuitability).not.toContain('Preferred Journey Level');
  });
});
