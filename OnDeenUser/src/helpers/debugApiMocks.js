export const DEBUG_OTP = '123456';
export const DEBUG_AUTH_TOKEN = 'debug-auth-token';
export const DEBUG_USER_TOKEN = 'debug-user-token';

export const isDebugApiMocksEnabled = () =>
  Boolean(
    typeof globalThis !== 'undefined' &&
      globalThis.__ONDEEN_ENABLE_DEBUG_API_MOCKS__ === true,
  );

const pagedEvents = {
  current_page: 1,
  events: [],
  pages: 0,
  per_page: 10,
  total: 0,
};

const profile = {
  id: 1,
  first_name: 'Debug',
  last_name: 'User',
  email_id: 'debug@ondeen.local',
  country_code: '+44',
  mobile_number: '555999120',
  profile_image: '',
  gender: 0,
  event_count: 0,
  course_count: 0,
  tour_count: 0,
  status: 1,
  created_on: '',
  gamification: {
    total_xp: 3269,
    level: 5,
    tier_key: 'seeker',
    tier_name: 'Seeker',
    tier_arabic: 'طالب',
    tier_transliteration: 'Talib',
    tier_meaning: 'One who seeks knowledge',
    tier_sublevel: 5,
    level_label: 'Seeker 5',
    current_level_floor_xp: 2821,
    next_level_xp: 4291,
    xp_to_next_level: 1022,
    progress_percent: 70,
    classes_to_next_level: 3,
    current_streak: 6,
    longest_streak: 6,
    streak_state: 'strong',
    streak_multiplier: 1.5,
    total_sessions: 8,
    lifetime_hours: 16,
    has_started: true,
    is_max_level: false,
  },
};

const ok = (response = {}) => ({
  status: true,
  response,
});

const otpSent = {
  message: `Debug OTP is ${DEBUG_OTP}`,
  is_register: true,
};

const otpVerified = {
  message: 'Debug OTP verified successfully',
  is_register: true,
  access_token: DEBUG_USER_TOKEN,
};

const isDebugToken = token =>
  token === DEBUG_AUTH_TOKEN ||
  token === DEBUG_USER_TOKEN ||
  (typeof token === 'string' && token.startsWith('debug-'));

export const getDebugApiResponse = ({
  url,
  data = null,
  authToken = '',
  bearerToken = '',
}) => {
  if (!isDebugApiMocksEnabled()) {
    return null;
  }

  const path = String(url || '').split('?')[0];
  const hasDebugAuth = isDebugToken(authToken) || isDebugToken(bearerToken);

  if (path === '/generate_token') {
    return {
      status: true,
      access_token: DEBUG_AUTH_TOKEN,
      response: {
        access_token: DEBUG_AUTH_TOKEN,
      },
    };
  }

  if (
    path === '/customer_app/users/send_otp' ||
    path === '/customer_app/users/email_send_otp'
  ) {
    return ok(otpSent);
  }

  if (
    path === '/customer_app/users/verify_otp' ||
    path === '/customer_app/users/email_verify_otp'
  ) {
    if (String(data?.otp || '') !== DEBUG_OTP) {
      return {
        status: false,
        response: {
          message: `Invalid debug OTP. Use ${DEBUG_OTP}.`,
        },
      };
    }

    return ok(otpVerified);
  }

  if (path === '/customer_app/users/login') {
    return ok({
      ...profile,
      access_token: DEBUG_USER_TOKEN,
    });
  }

  if (path === '/customer_app/users/register') {
    return ok({
      ...profile,
      access_token: DEBUG_USER_TOKEN,
      is_register: true,
      message: 'Debug registration completed',
    });
  }

  if (!hasDebugAuth) {
    return null;
  }

  if (path === '/customer_app/home/home') {
    return ok({
      banner: pagedEvents,
      category: [],
      organizer: [],
      recent: pagedEvents,
      event_types: [],
    });
  }

  if (path === '/customer_app/home/get_category') {
    return ok([]);
  }

  if (path === '/customer_app/event/event') {
    return ok(pagedEvents);
  }

  if (path === '/customer_app/event/event_id') {
    return ok(null);
  }

  if (
    path === '/customer_app/users/get_profile' ||
    path === '/customer_app/event/get_user_profile'
  ) {
    return ok(profile);
  }

  if (path === '/customer_app/users/gamification_profile') {
    return ok(profile.gamification);
  }

  if (path === '/customer_app/users/gamification_summary') {
    return ok({ summary: null });
  }

  if (path === '/customer_app/users/gamification_summary_seen') {
    return ok({ message: 'Summary updated' });
  }

  if (path === '/customer_app/users/session_feedback') {
    return ok({
      message: 'Feedback recorded',
      feedback_id: 1,
      summary_id: data?.summary_id || null,
      created: true,
    });
  }

  if (path === '/customer_app/users/session_feedback_skip') {
    return ok({
      message: 'Feedback skipped',
      feedback_id: 1,
      summary_id: data?.summary_id || null,
      created: true,
    });
  }

  if (path === '/customer_app/event/booking_list') {
    return ok({
      bookings: [],
      total_count: 0,
    });
  }

  if (path === '/customer_app/users/get_notifications') {
    return ok([
      {
        id: -101,
        event_id: 1,
        type: 7,
        title: 'Debug event link',
        message: 'Open this seeded event: https://api-production-517c1.up.railway.app/open?id=1',
        seen: 0,
      },
    ]);
  }

  if (path === '/customer_app/wishlist/list') {
    return ok({
      wishlist: [],
    });
  }

  if (path.startsWith('/customer_app/membership/')) {
    return ok({
      memberships: [],
      active_membership: null,
    });
  }

  if (
    path === '/customer_app/event/get_all_event_note' ||
    path === '/customer_app/event/question_and_answers'
  ) {
    return ok([]);
  }

  if (path.startsWith('/customer_app/')) {
    return ok({
      message: 'Debug mock response',
    });
  }

  return null;
};
