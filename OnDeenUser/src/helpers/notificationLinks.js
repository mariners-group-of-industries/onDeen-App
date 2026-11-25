import { Linking } from 'react-native';
import { BASE_PRODUCTION_URL, BASE_URL } from './Constant';

const URL_REGEX = /((?:https?:\/\/|www\.|ondeen:\/\/)[^\s<>()]+)/gi;
const getHost = (value = '') => {
  const match = String(value || '').match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]+)/i);
  return match ? match[1].toLowerCase() : '';
};
const ONDEEN_HOSTS = new Set(
  [
    'ondeen.app',
    'www.ondeen.app',
    getHost(BASE_PRODUCTION_URL),
    getHost(BASE_URL),
  ].filter(Boolean),
);

const trimUrl = (value) => {
  let url = value;
  let trailing = '';
  while (/[.,!?;:)]$/.test(url)) {
    trailing = `${url.slice(-1)}${trailing}`;
    url = url.slice(0, -1);
  }
  return { url, trailing };
};

export const extractNotificationLinks = (text = '') => {
  const parts = [];
  const source = String(text || '');
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(source)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: source.slice(lastIndex, match.index) });
    }

    const { url, trailing } = trimUrl(match[0]);
    parts.push({ type: 'link', text: url, url: normalizeUrl(url) });
    if (trailing) {
      parts.push({ type: 'text', text: trailing });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ type: 'text', text: source.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', text: source }];
};

export const normalizeUrl = (url = '') => {
  const value = String(url || '').trim();
  if (/^www\./i.test(value)) {
    return `https://${value}`;
  }
  return value;
};

const parseUrl = (url) => {
  const value = normalizeUrl(url);
  const match = value.match(/^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(?:\?([^#]*))?/i);
  if (!match) {
    return null;
  }

  const query = match[4] || '';
  return {
    protocol: `${match[1].toLowerCase()}:`,
    hostname: (match[2] || '').toLowerCase(),
    pathname: match[3] || '',
    searchParams: {
      get: (key) => {
        const param = query
          .split('&')
          .map((pair) => pair.split('='))
          .find(([name]) => name === key);
        if (!param) {
          return null;
        }
        try {
          return decodeURIComponent(param[1] || '');
        } catch (error) {
          return param[1] || '';
        }
      },
    },
  };
};

export const isOnDeenUrl = (url) => {
  const parsed = parseUrl(url);
  if (!parsed) {
    return false;
  }
  return parsed.protocol === 'ondeen:' || ONDEEN_HOSTS.has(parsed.hostname.toLowerCase());
};

const firstId = (...values) => {
  for (const value of values) {
    const id = Number(value);
    if (Number.isFinite(id) && id > 0) {
      return id;
    }
  }
  return null;
};

const decodeBase64Id = (value) => {
  if (!value || !/^[A-Za-z0-9+/]+=*$/.test(value)) {
    return null;
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of value.replace(/=+$/, '')) {
    const index = chars.indexOf(char);
    if (index < 0) {
      return null;
    }
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return firstId(output);
};

export const resolveOnDeenLink = (url) => {
  const parsed = parseUrl(url);
  if (!parsed || !isOnDeenUrl(url)) {
    return null;
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  if (parsed.protocol === 'ondeen:' && parsed.hostname) {
    segments.unshift(parsed.hostname);
  }

  const route = (segments[0] || '').toLowerCase();
  const id = firstId(parsed.searchParams.get('id'), parsed.searchParams.get('event_id'), segments[1]) || decodeBase64Id(segments[1]);

  if (['open', 'event', 'events', 'course', 'courses'].includes(route) && id) {
    return { screen: 'CourseDetails', params: { eventId: id } };
  }

  if (['user', 'users', 'profile', 'profiles'].includes(route) && id) {
    return { screen: 'ProfileScreen', params: { user_id: id } };
  }

  if (['organizer', 'organizers', 'organiser', 'organisers'].includes(route) && id) {
    return { screen: 'organizerProfile', params: { user_id: id } };
  }

  if (['speaker', 'speakers'].includes(route) && id) {
    return { screen: 'SpeakerScreen', params: { speakerId: id } };
  }

  return null;
};

const internalTargetRequest = (route) => {
  switch (route?.screen) {
    case 'CourseDetails':
      return {
        path: `/customer_app/event/event_id?id=${encodeURIComponent(route.params.eventId)}`,
        method: 'GET',
      };
    case 'ProfileScreen':
      return {
        path: '/customer_app/event/get_user_profile',
        method: 'POST',
        body: { user_id: route.params.user_id },
      };
    case 'organizerProfile':
      return {
        path: `/customer_app/organizer/organizer_id?id=${encodeURIComponent(route.params.user_id)}`,
        method: 'GET',
      };
    case 'SpeakerScreen':
      return {
        path: `/customer_app/speaker/speaker_id?id=${encodeURIComponent(route.params.speakerId)}`,
        method: 'GET',
      };
    default:
      return null;
  }
};

export const validateOnDeenLinkTarget = async (
  route,
  {
    authToken = '',
    bearerToken = '',
    baseUrl = BASE_URL,
    fetchImpl = globalThis.fetch,
  } = {},
) => {
  const request = internalTargetRequest(route);
  if (!request || typeof fetchImpl !== 'function') {
    return false;
  }

  const response = await fetchImpl(`${String(baseUrl || '').replace(/\/+$/, '')}${request.path}`, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'auth-token': authToken } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    ...(request.body ? { body: JSON.stringify(request.body) } : {}),
  });
  if (response?.ok === false) {
    return false;
  }
  const payload = await response.json();
  return payload?.status === true;
};

export const openNotificationLink = async (url, navigation, options = {}) => {
  const safeUrl = normalizeUrl(url);

  if (isOnDeenUrl(safeUrl)) {
    const route = resolveOnDeenLink(safeUrl);
    if (!route) {
      return { ok: false, message: 'This link is no longer valid.' };
    }

    try {
      const targetExists = await validateOnDeenLinkTarget(route, options);
      if (!targetExists) {
        return { ok: false, message: 'This link is no longer valid.' };
      }
    } catch (error) {
      return { ok: false, message: 'Unable to verify this link. Please try again.' };
    }

    navigation.navigate(route.screen, route.params);
    return { ok: true };
  }

  try {
    await Linking.openURL(safeUrl);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: 'Unable to open link.' };
  }
};
