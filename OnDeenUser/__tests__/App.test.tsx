/**
 * @format
 */

import fs from 'fs';
import path from 'path';

describe('application root contract', () => {
  const source = fs.readFileSync(path.join(__dirname, '../App.jsx'), 'utf8');

  it.each([
    '<GestureHandlerRootView',
    '<StripeProvider',
    '<SafeAreaProvider',
    '<Provider store={store}>',
    '<PersistGate',
    '<NavigationContainer',
    '<RootNavigator',
    '<AppAutologout',
  ])('keeps the root provider %s', (provider) => {
    expect(source).toContain(provider);
  });

  it('keeps event deep links wired to CourseDetails', () => {
    expect(source).toContain("path: 'open/:id?'");
    expect(source).toContain('decodeEventLinkId(id)');
  });

  it('mounts the pending-session gate on the authenticated home screen', () => {
    const authenticatedHome = fs.readFileSync(
      path.join(__dirname, '../src/screens/BottomHomePage/BottomHomePage.jsx'),
      'utf8',
    );

    expect(authenticatedHome).toContain('<GamificationGate');
    expect(authenticatedHome).toContain("from '../../components/gamification/GamificationGate'");
  });
});
