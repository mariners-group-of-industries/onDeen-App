export const ROLE_TYPES = {
  ORGANISER: 3,
  SPEAKER: 4,
  BUDDY: 5,
};

export const roleLabel = roleType => {
  switch (Number(roleType)) {
    case ROLE_TYPES.SPEAKER:
      return 'Speaker';
    case ROLE_TYPES.BUDDY:
      return 'Buddy';
    default:
      return 'Organiser';
  }
};

export const loginRoutesForRole = roleType => {
  switch (Number(roleType)) {
    case ROLE_TYPES.SPEAKER:
      return {
        sendOtp: '/speaker_app/login/send_otp',
        verifyOtp: '/speaker_app/login/verify_otp',
      };
    case ROLE_TYPES.BUDDY:
      return {
        sendOtp: '/buddy_app/login/send_otp',
        verifyOtp: '/buddy_app/login/verify_otp',
      };
    default:
      return {
        sendOtp: '/organizer_app/login/send_otp',
        verifyOtp: '/organizer_app/login/verify_otp',
      };
  }
};
