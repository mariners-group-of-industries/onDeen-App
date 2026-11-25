const fs = require('fs');
const path = require('path');

const read = relativePath =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('organiser authentication options', () => {
  it('starts with one mobile login/signup surface and exposes the password return path', () => {
    const navigator = read('src/navigation/AuthNavigator.tsx');
    const signup = read('src/screens/signupScreen/index.tsx');
    const login = read('src/screens/loginScreen/index.tsx');

    expect(navigator).toContain('initialRouteName="Signup"');
    expect(navigator).toContain('name="Signup"');
    expect(signup).toContain('Log in or sign up to get started.');
    expect(login).toContain('Return to other sign-in options');
    expect(login).not.toContain('<SocialLogin');
  });

  it('does not invoke native Google configuration when the organiser build has no client id', () => {
    const google = read('src/screens/signupEmailScreen/checkGoogleLogin.js');
    const constant = read('src/helpers/Constant.tsx');

    expect(constant).toContain("GOOGLESIGNINWEBCLIENTID = ''");
    expect(google).toContain("code = 'NOT_CONFIGURED'");
    expect(google).not.toContain('GoogleSignin.configure({});');
  });

  it('keeps extra label-to-input spacing on the password login form', () => {
    const styles = read('src/screens/loginScreen/styles.tsx');
    expect(styles).toContain('inputTitle');
    expect(styles).toContain('marginBottom: heightScale(10)');
  });
});
