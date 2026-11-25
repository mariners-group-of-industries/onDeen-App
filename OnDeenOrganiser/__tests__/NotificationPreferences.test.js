const fs = require('fs');
const path = require('path');

describe('organiser notification preferences', () => {
  const screenSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/NotificationPreferences/NotificationPreferences.jsx'),
    'utf8',
  );
  const profileSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/profileScreen/index.jsx'),
    'utf8',
  );
  const notificationSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/Notification/NotificationScreen.jsx'),
    'utf8',
  );
  const assignmentSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/BuddyAssignment/BuddyAssignment.jsx'),
    'utf8',
  );

  it('loads and persists typed push preferences through the authenticated API', () => {
    expect(screenSource).toContain("url: '/organizer_app/profile/notification_preferences'");
    expect(screenSource).toContain('method: \'POST\'');
    expect(screenSource).toContain('push_enabled: enabled');
    expect(screenSource).toContain('Switch');
    expect(screenSource).toContain('Your Notifications inbox keeps the history');
  });

  it('exposes preferences from the organiser Settings surface', () => {
    expect(profileSource).toContain('Manage notification preferences');
    expect(profileSource).toContain("navigation.navigate('NotificationPreferences')");
  });

  it('opens Buddy requests in the assignment flow and persists the selected Buddy', () => {
    expect(notificationSource).toContain("navigation.navigate('BuddyAssignment'");
    expect(assignmentSource).toContain("url: '/organizer_app/profile/buddy_list'");
    expect(assignmentSource).toContain("url: '/organizer_app/event/assign_buddy'");
    expect(assignmentSource).toContain('Assign selected Buddy');
  });
});
