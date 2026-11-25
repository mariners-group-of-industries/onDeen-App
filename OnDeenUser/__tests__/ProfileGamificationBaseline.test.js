const fs = require('fs');
const path = require('path');

describe('protected User profile gamification baseline', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/screens/ProfileScreen/ProfileScreen.jsx'),
    'utf8',
  );

  it.each([
    '<CurrentRankCard',
    '<StatCards',
    '<Certificates',
    '<OnDeenRadarSection',
    '<RecentActivity',
  ])('keeps the protected section %s', (section) => {
    expect(source).toContain(section);
  });

  it.each([
    'CURRENT RANK',
    'STREAK',
    'LIFETIME',
    'Certificates',
    'OnDeen Radar',
  ])('keeps the protected user-facing marker %s', (marker) => {
    expect(source).toContain(marker);
  });

  it('renders the sacred four Radar axes with verified-hour context', () => {
    for (const axis of ['Knowledge', 'Fitness', 'Community', 'Tazkiyyah']) {
      expect(source).toContain(`label: '${axis}'`);
    }
    expect(source).toContain('axis.hours ?? axis.verified_hours');
    expect(source).toContain('axis.target_hours ?? axis.targetHours');
    expect(source).not.toContain("label: 'Ummah'");
  });

  it('does not confuse a recent XP log with a post-session summary', () => {
    expect(source).toContain("typeof summary.xp === 'object'");
    expect(source).toContain("item?.title || item?.event_title");
  });

  it('makes every booked-session streak miss state explicit', () => {
    expect(source).toContain('Flame dimmed · 1 booked session missed · streak preserved');
    expect(source).toContain('Ember state · 2 booked sessions missed · one more resets');
    expect(source).toContain('Streak reset · 3 booked sessions missed');
  });

  it('uses the sacred Radar thresholds and never uses red for an axis status', () => {
    expect(source).toContain("radarQuiet: '#8A8A8A'");
    expect(source).toContain("radarBuilding: '#D08A00'");
    expect(source).toContain("radarStrong: '#2E9B58'");
    expect(source).toContain("value <= 25 ? 'quiet' : value <= 60 ? 'building' : 'strong'");
    expect(source).not.toMatch(/radar(?:Quiet|Building|Strong):\s*['\"](?:red|#(?:f00|ff0000))/i);
  });

  it('keeps Radar hours separate from XP and exposes axis detail evidence', () => {
    expect(source).toContain('Radar counts actual scheduled time once');
    expect(source).toContain('Difficulty, streaks and milestones can change XP');
    expect(source).toContain('Recent verified sessions');
    expect(source).toContain('verified hours in the last 30 days');
    expect(source).toContain('onAxisPress={setSelectedRadarAxis}');
  });
});
