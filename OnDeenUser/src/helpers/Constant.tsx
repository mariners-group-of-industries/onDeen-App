import * as Yup from 'yup';
// Google sign-in is intentionally disabled until the iOS URL-scheme/client
// configuration is available for this app.  Keeping this empty prevents the
// native module from opening a redbox; the auth helper still returns a
// friendly fallback if an old route invokes it.
export const GOOGLESIGNINWEBCLIENTID = ''

export const ITS_LIVE = false
export const ENABLE_VERSION_UPDATE_CHECK = ITS_LIVE
// Stripe publishable keys. The backend currently accepts Test mode only, so the
// live key is intentionally not stored in source. Set it here (or inject it at
// build time) as part of the real-payments go-live work, together with ITS_LIVE.
const STRIPE_LIVE_PUBLISHABLE_KEY = "";
const STRIPE_TEST_PUBLISHABLE_KEY = "pk_test_51R8kcYE3po3v3vTQtCLcDWvdvuydg4EgXw3HAkEYFvkOXBJ4C9IR7o5iw8q25jck2QPE5oh76w4xdWDTopQXWriw006EJyRh14";
export const PAYMENTKEY = ITS_LIVE ? STRIPE_LIVE_PUBLISHABLE_KEY : STRIPE_TEST_PUBLISHABLE_KEY
// Keep local/debug APKs usable while bundled FCM config is not available.
// Set this to true only when testing push delivery with valid FCM mobile config.
export const ENABLE_FCM_NOTIFICATIONS = false;
export const BASE_PRODUCTION_URL = 'https://ondeen-app-production.up.railway.app';
const BUNDLED_BACKEND_URL =
  typeof globalThis !== 'undefined' ? (globalThis as any).__ONDEEN_BASE_URL__ : '';
export const BASE_URL =
  typeof BUNDLED_BACKEND_URL === 'string' && BUNDLED_BACKEND_URL.trim()
    ? BUNDLED_BACKEND_URL.replace(/\/+$/, '')
    : BASE_PRODUCTION_URL;

export const API_END_POINT = {
  generate_token: `${BASE_URL}/generate_token`,
  login: `${BASE_URL}/customer_app/users/login`,
};

export const validationSchema = Yup.object().shape({
  first_name: Yup.string().required("This is required").test("not-only-spaces", "Please enter a valid value", (value) => value.trim() !== "",),
  last_name: Yup.string().required("This is required").test("not-only-spaces", "Please enter a valid value", (value) => value.trim() !== "",),
  // gender: Yup.string().required("This is required").test("not-only-spaces", "Please enter a valid value", (value) => value.trim() !== "",),
  password: Yup.string().required("This is required").test("not-only-spaces", "Please enter a valid value", (value) => value.trim() !== "",),
  email_id: Yup.string().email('Invalid email').required('Email is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  // gender: Yup.string().required('Gender is required'),
  // profile_image: Yup.string().required('Profile image is required'),
});


// Client-side Maps key: it ships inside the app binary, so it MUST be restricted
// in Google Cloud (Android package + SHA-1, iOS bundle ID, Maps/Geocoding APIs only).
export const GOOGLE_MAP_KEY = 'AIzaSyAwhW-oxoIPQo_lbiO5Izr7m2Sal6h51os';
export const IS_IT_NEED_NOW = false
