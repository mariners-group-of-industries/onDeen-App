const fs = require('fs');
const path = require('path');

const read = relativePath =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

describe('user authentication options', () => {
  it('keeps the mobile entry point and a single return action on password login', () => {
    const signup = read('src/screens/SignupScreen/SignupMobileScreen.jsx');
    const login = read('src/screens/LoginEmailPassword/LoginEmailPassword.jsx');

    expect(signup).toContain('Log in or sign up to get started.');
    expect(login).toContain('Return to other sign-in options');
    expect(login).not.toContain('<Text style={styles.separatorText}>OR</Text>');
  });

  it('starts with an empty login form and no native Google setup at render time', () => {
    const login = read('src/screens/LoginEmailPassword/LoginEmailPassword.jsx');
    const constant = read('src/helpers/Constant.tsx');

    expect(login).toContain("initialValues: { email_id: '', password: '' }");
    expect(login).not.toContain('123456');
    expect(constant).toContain("GOOGLESIGNINWEBCLIENTID = ''");
    expect(login).not.toContain('GoogleSignin');
  });

  it('turns Google configuration failures into a user-facing fallback message', () => {
    const google = read('src/screens/SignupScreen/checkGoogleLogin.js');
    const mobileSignup = read('src/screens/SignupScreen/SignupMobileScreen.jsx');
    const emailSignup = read('src/screens/SignupScreen/SignupEmailScreen.jsx');
    expect(google).toContain("code = 'NOT_CONFIGURED'");
    expect(google).toContain('Google sign-in could not start. Please use another option.');
    expect(mobileSignup).not.toContain('Continue with Google');
    expect(emailSignup).not.toContain('Continue with Google');
  });
});
