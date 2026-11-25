import * as Yup from 'yup';

export const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be 6 digits'),
});

import * as yup from 'yup';
export const emailRegex: any =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const emailConfirmationValidation = yup.object().shape({
  email: yup
    .string()
    .email('Errors.validEmail')
    .matches(emailRegex, 'Errors.validEmail')
    .required('Errors.emailRequired'),
});

export const emailValidationValidation = yup.object().shape({
  email: yup
    .string()
    .email('Errors.validEmail')
    .matches(emailRegex, 'Errors.validEmail')
    .required('Errors.emailRequired'),
});

export const loginValidation = yup.object().shape({
  email: yup
    .string()
    .email('Errors.validEmail')
    .matches(emailRegex, 'Errors.validEmail')
    .required('Errors.emailRequired'),
  password: yup
    .string()
    .min(6, 'Errors.minCharactersLength')
    .required('Errors.passwordRequired'),
});

export const signUpDetailsValidation = yup.object().shape({
  firstName: yup.string().required('Errors.firstNameRequired'),
  lastName: yup.string().required('Errors.lastNameRequired'),
  email: yup
    .string()
    .email('Errors.validEmail')
    .matches(emailRegex, 'Errors.validEmail')
    .required('Errors.emailRequired'),
  password: yup
    .string()
    .min(8, 'Errors.charactersLength')
    .required('Errors.passwordRequired'),
});

export const socialLoginValidation = yup.object().shape({
  email: yup
    .string()
    .email('Errors.validEmail')
    .matches(emailRegex, 'Errors.validEmail')
    .required('Errors.emailRequired'),
});

export const createAccountValidation = yup.object().shape({
  organizationName: yup.string().required('Errors.organizationRequired'),
  managerFullName: yup.string().required('Errors.managerNAmeRequired'),
  phoneNumber: yup.string().required('Errors.phoneNumberRequired'),
  webSite: yup.string().required('Errors.websiteRequired'),
  address: yup.string().required('Errors.addressRequired'),
});

export const signupValidationSchema = Yup.object().shape({
  mobile_number: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits'), // Adjust regex based on your requirement
  country_code: Yup.string().required('Country code is required'),
});
