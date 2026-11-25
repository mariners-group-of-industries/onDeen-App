import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomeInput from '../../components/CustomeInput';
import GradientButton from '../../components/gradientButton';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { useToastForPopup } from '../../context/ToastContext';
import { emailSendOtpAPI } from '../../redux/callapis/CommonService';
import { DEBUG_OTP, isDebugApiMocksEnabled } from '../../helpers/debugApiMocks';

export default function EmailForm() {
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const showToast = useToastForPopup();

    const handleEmailSubmit = async (values) => {
        try {
            setIsLoading(true);

            const payload = { email_id: values?.email_id };

            if (isDebugApiMocksEnabled()) {
                showToast(`Debug OTP is ${DEBUG_OTP}`);
                navigation.navigate('VerifyEmailOTP', { email_id: values?.email_id });
                return;
            }

            const resultAction = await emailSendOtpAPI(payload);

            if (resultAction?.status) {
                showToast(resultAction?.response?.message || 'Otp Sent Successfully');
                navigation.navigate('VerifyEmailOTP', { email_id: values?.email_id });
            } else {
                if (!resultAction?.response?.status) {
                    showToast(
                        resultAction?.response[0] ||
                        resultAction?.response?.message ||
                        'Registration Failed'
                    );
                } else {
                    showToast('Unexpected registration response');
                }
            }
        } catch (error) {
            console.log(error);
            showToast('Something went wrong, please try again');
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: { email_id: '' },
        validationSchema: Yup.object({
            email_id: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
        }),
        onSubmit: handleEmailSubmit,
    });

    return (
        <View style={{ width: '100%' }}>
            <View style={{ width: '100%', paddingHorizontal: 24 }}>
                <CustomeInput
                    formik={formik}
                    name="email_id"
                    label="Email"
                    placeholder="Enter Email ID"
                    type="email-address"
                />
            </View>

            <Text
                onPress={() => navigation.navigate('ForgotPasswordScreen')}
                style={styles.forgotPasswordText}>
                Forgot your password?
            </Text>

            <GradientButton
                onPress={formik.handleSubmit}
                title="Continue"
                disabled={!formik.isValid || isLoading}
                loading={isLoading}
                containerStyle={styles.customButtonContainer}
                textStyle={styles.customButtonText}
            />
        </View>
    );
}
