const fs = require('fs');
const path = require('path');

const read = relativePath => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('role-aware access surfaces', () => {
  it('routes OTP through the selected role without changing the organiser default', () => {
    const routes = read('src/helpers/roleRoutes.js');
    const signup = read('src/screens/signupScreen/index.tsx');
    const otp = read('src/screens/otpScreen/index.tsx');
    expect(routes).toContain("'/speaker_app/login/send_otp'");
    expect(routes).toContain("'/buddy_app/login/send_otp'");
    expect(routes).toContain("'/organizer_app/login/send_otp'");
    expect(signup).toContain('Continue as ${roleLabel(option)}');
    expect(signup).toContain('roleType');
    expect(otp).toContain('roleType');
  });

  it('keeps Buddy access limited to assigned tasks and QR/WhatsApp actions', () => {
    const root = read('src/navigation/RootNavigator.tsx');
    const navigator = read('src/navigation/BuddyNavigator.jsx');
    const home = read('src/screens/buddy/BuddyHome.jsx');
    const task = read('src/screens/buddy/BuddyTask.jsx');
    const scanner = read('src/redux/slices/updateattendanceSlice.tsx');
    expect(root).toContain('Number(roleType) === 5');
    expect(navigator).toContain('BuddyTask');
    expect(home).toContain("'/buddy_app/event/get_request_buddy'");
    expect(home).toContain('Only support requests assigned to you are shown here.');
    expect(task).toContain('Contact User on WhatsApp');
    expect(task).toContain('task.whatsapp_url');
    expect(scanner).toContain("'/buddy_app/event/update_attendance'");
  });

  it('routes Speaker accounts to assigned listings, profile, inbox and one-to-one only', () => {
    const root = read('src/navigation/RootNavigator.tsx');
    const navigator = read('src/navigation/SpeakerNavigator.jsx');
    const home = read('src/screens/speaker/SpeakerHome.jsx');
    const sessions = read('src/screens/speaker/SpeakerSessions.jsx');
    expect(root).toContain('Number(roleType) === 4');
    expect(navigator).toContain('SpeakerProfile');
    expect(navigator).toContain('SpeakerSessions');
    expect(home).toContain("'/speaker_app/event/get_all_event'");
    expect(sessions).toContain("'/speaker_app/event/get_request_buddy'");
    expect(home).not.toContain("'Wallet'");
  });

  it('keeps organiser Speaker management reachable from Settings', () => {
    const settings = read('src/screens/profileScreen/index.jsx');
    const navigator = read('src/navigation/AllAccessNavigator.jsx');
    const manager = read('src/screens/SpeakerManagement/SpeakerManagementScreen.jsx');
    expect(settings).toContain("navigation.navigate('SpeakerManagement')");
    expect(navigator).toContain('SpeakerManagementScreen');
    expect(manager).toContain("'/organizer_app/speakers/listing'");
    expect(manager).toContain("'/organizer_app/speakers/create'");
    expect(manager).toContain("'/organizer_app/speakers/get_by_id'");
    expect(manager).toContain("'/organizer_app/speakers/delete'");
    expect(manager).toContain('Speaker qualification');
  });
});
