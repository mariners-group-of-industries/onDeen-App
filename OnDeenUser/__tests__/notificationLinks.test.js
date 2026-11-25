import { Linking } from 'react-native';

import {
  extractNotificationLinks,
  isOnDeenUrl,
  openNotificationLink,
  resolveOnDeenLink,
  validateOnDeenLinkTarget,
} from '../src/helpers/notificationLinks';

describe('notification links', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('extracts several independently tappable links without swallowing punctuation', () => {
    const parts = extractNotificationLinks(
      'Event https://api-production-517c1.up.railway.app/open?id=1, website www.example.com and profile ondeen://user/4.',
    );

    expect(parts.filter(part => part.type === 'link')).toEqual([
      expect.objectContaining({ url: 'https://api-production-517c1.up.railway.app/open?id=1' }),
      expect.objectContaining({ url: 'https://www.example.com' }),
      expect.objectContaining({ url: 'ondeen://user/4' }),
    ]);
    expect(parts.map(part => part.text).join('')).toContain('open?id=1, website');
    expect(parts.map(part => part.text).join('')).toContain('ondeen://user/4.');
  });

  it('recognises the canonical Railway host even when the app uses a local bridge', () => {
    expect(isOnDeenUrl('https://api-production-517c1.up.railway.app/open?id=1')).toBe(true);
    expect(isOnDeenUrl('https://example.com/help')).toBe(false);
  });

  it.each([
    ['ondeen://event/1', 'CourseDetails', { eventId: 1 }],
    ['ondeen://user/4', 'ProfileScreen', { user_id: 4 }],
    ['ondeen://organiser/1', 'organizerProfile', { user_id: 1 }],
    ['ondeen://speaker/16', 'SpeakerScreen', { speakerId: 16 }],
  ])('maps %s to the exact internal entity', (url, screen, params) => {
    expect(resolveOnDeenLink(url)).toEqual({ screen, params });
  });

  it('preflights and opens a valid internal entity in app', async () => {
    const navigation = { navigate: jest.fn() };
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: true, response: { id: 1 } }),
    });

    await expect(openNotificationLink(
      'https://api-production-517c1.up.railway.app/open?id=1',
      navigation,
      { fetchImpl, baseUrl: 'http://127.0.0.1:8765', authToken: 'auth', bearerToken: 'bearer' },
    )).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledWith(
      'http://127.0.0.1:8765/customer_app/event/event_id?id=1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'auth-token': 'auth',
          Authorization: 'Bearer bearer',
        }),
      }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('CourseDetails', { eventId: 1 });
  });

  it('validates authenticated profile targets with the correct request body', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: true }),
    });

    await expect(validateOnDeenLinkTarget(
      { screen: 'ProfileScreen', params: { user_id: 4 } },
      { fetchImpl, baseUrl: 'https://backend.test' },
    )).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://backend.test/customer_app/event/get_user_profile',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ user_id: 4 }) }),
    );
  });

  it('returns a friendly state for a stale internal entity and never navigates', async () => {
    const navigation = { navigate: jest.fn() };
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: false, message: 'Event not found' }),
    });

    await expect(openNotificationLink(
      'ondeen://event/999999',
      navigation,
      { fetchImpl },
    )).resolves.toEqual({ ok: false, message: 'This link is no longer valid.' });
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('opens an external website through the device browser', async () => {
    Linking.openURL.mockResolvedValue(undefined);

    await expect(openNotificationLink('https://example.com', { navigate: jest.fn() }))
      .resolves.toEqual({ ok: true });
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('returns a friendly error when the device cannot open an external link', async () => {
    Linking.openURL.mockRejectedValue(new Error('unavailable'));

    await expect(openNotificationLink('https://example.com', { navigate: jest.fn() }))
      .resolves.toEqual({ ok: false, message: 'Unable to open link.' });
  });
});
