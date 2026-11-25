import * as Yup from 'yup';
const vallabel =
  'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
export const passwordvalidation = Yup.string()
  .min(8, vallabel)
  .matches(/[A-Z]/, vallabel)
  .matches(/[a-z]/, vallabel)
  .matches(/[0-9]/, vallabel)
  .matches(/[\W_]/, vallabel)
  .required(vallabel)
  .test(
    'not-only-spaces',
    'Please enter a valid value',
    (value) => value.trim() !== ''
  );

export const loginValidationSchema = Yup.object().shape({
  email_id: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});
