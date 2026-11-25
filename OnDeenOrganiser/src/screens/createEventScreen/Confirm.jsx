import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Linking, View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import GradientButton from '../../components/gradientButton';
import CustomeInput from '../../components/CustomeInput';
import { fontScale, heightScale, widthScale } from '../../helpers/scale';
import AddAttachment from '../../components/AddAttachment';
import { eventcreateAPI } from '../../redux/slices/eventcreateSlice';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../context/ToastContext';
import { convertTo24HourFormat, formatDateToISO } from '../../common/datetimeformate';
import { fontFamilies } from '../../assets/themes/fonts';
import TouchableLabel from '../../components/customLabels';
import TicketTypes from '../../components/TicketTypes';
import { apiRequest } from '../../services/api';

const validationSchema = Yup.object({
  documents: Yup.array().notRequired(),
});

const Confirm = ({ account, setAccount, id = null, draftId = null, address, latitude, longitude, setActivetab }) => {
  const showToast = useToast();
  const [showError, setShowError] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.token.token?.access_token);
  const bearerToken = useSelector(state => state.user.loginToken);
  const [savingDraft, setSavingDraft] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const formik = useFormik({
    initialValues: account,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      registerapi(values);
    },
  });

  useEffect(() => {
    if (formik.touched?.['documents'] && formik.errors?.['documents']) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formik.errors, formik.touched]);

  useEffect(() => {
    if (formik.isSubmitting && formik.errors?.['documents']) {
      setShowError(true);
    }
  }, [formik.isSubmitting, formik.errors]);

  const refreshStripeStatus = useCallback(async () => {
    if (Number(formik.values?.price_type || 0) !== 1) {
      return;
    }
    try {
      setStripeLoading(true);
      const result = await apiRequest({
        url: '/payment/connect/status',
        method: 'POST',
        data: {},
        authToken: token,
        bearerToken,
      });
      setStripeStatus(result?.response || null);
    } catch (_error) {
      // Keep the paid-listing gate closed and let the Organiser retry in-app.
    } finally {
      setStripeLoading(false);
    }
  }, [bearerToken, formik.values?.price_type, token]);

  useEffect(() => {
    refreshStripeStatus();
  }, [refreshStripeStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshStripeStatus();
      }
    });
    return () => subscription.remove();
  }, [refreshStripeStatus]);

  const connectStripe = async () => {
    try {
      setStripeLoading(true);
      const statusResult = await apiRequest({
        url: '/payment/connect/status',
        method: 'POST',
        data: {},
        authToken: token,
        bearerToken,
      });
      const latestStatus = statusResult?.response;
      if (statusResult?.status && latestStatus?.ready) {
        setStripeStatus(latestStatus);
        showToast('Stripe is connected and ready.', 1);
        return;
      }
      const result = await apiRequest({
        url: '/payment/connect/onboarding',
        method: 'POST',
        data: {},
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });
      const data = result?.response;
      if (result?.status && data?.url) {
        await Linking.openURL(data.url);
      } else {
        showToast(data?.message || 'Stripe onboarding is unavailable.', 3);
      }
    } catch (error) {
      showToast('Stripe onboarding is unavailable.', 3);
    } finally {
      setStripeLoading(false);
    }
  };

  const buildSubmissionData = (values) => {
    const source = { ...account, ...values };
    const start_date = source?.start_date ? formatDateToISO(source.start_date) : '';
    const end_date = source?.end_date ? formatDateToISO(source.end_date) : '';
    const start_time = source?.start_time ? convertTo24HourFormat(source.start_time) : '';
    const end_time = source?.end_time ? convertTo24HourFormat(source.end_time) : '';
    const locationType = Number(source?.location_type || 1);
    const normalizedLocationType = locationType === 2 ? 0 : locationType === 3 ? 2 : 1;
    const locationValue = address || source?.location || '';
    const latitudeValue = latitude || source?.latitude || 0;
    const longitudeValue = longitude || source?.longitude || 0;
    const priceType = Number(source?.price_type || 2);
    const priceValue = priceType === 2 ? 0 : Number(source?.price || 0);
    const tickets = Array.isArray(source?.tickets) ? source.tickets : [];

    return {
      ...source,
      documents: source?.documents || [],
      event_type: Number(source?.event_type || source?.category_id || 1),
      location_type: normalizedLocationType,
      price_type: priceType,
      price: priceValue,
      start_date,
      end_date,
      location: locationValue,
      latitude: latitudeValue,
      longitude: longitudeValue,
      start_time,
      end_time,
      available: Number(source?.available || 100),
      quantity_per_user: Number(source?.quantity_per_user || 5),
      ticket_type: tickets.length > 0 ? 1 : Number(source?.ticket_type || 0),
      qrcode_type: Number(source?.qrcode_type || 0),
      "gender": Number(source?.gender || 0),
      "language_id": Number(source?.language_id),
      occusr_type: Number(source?.occusr_type || 1),
      occusr_weekday: source?.occusr_weekday || '',
      occusr_month: Number(source?.occusr_month || 1),
    };
  };

  const saveDraft = async () => {
    if (savingDraft) {
      return;
    }
    setSavingDraft(true);
    try {
      const draftData = buildSubmissionData(formik.values);
      const result = await apiRequest({
        url: '/organizer_app/drafts/create',
        method: 'POST',
        data: {
          ...(draftId ? { id: draftId } : {}),
          json_data: JSON.stringify(draftData),
        },
        authToken: token,
        bearerToken,
        contentType: 'application/json',
      });
      if (result?.status) {
        showToast(result?.response?.message || 'Draft saved successfully.', 1);
      } else {
        showToast(result?.response?.message || result?.message || 'Unable to save draft.', 3);
      }
    } catch (error) {
      showToast('Unable to save draft.', 3);
    } finally {
      setSavingDraft(false);
    }
  };

  // A draft can be saved while editing an existing listing.  Publishing that
  // draft creates a new listing, so relation IDs from the source listing must
  // not be replayed against the new event (the backend correctly rejects
  // cross-event curriculum/document/ticket ownership).  Keep the values but
  // let the create path persist fresh child rows.
  const prepareDraftForPublish = values => {
    const withoutId = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
      }
      const { id: _sourceId, ...rest } = value;
      return rest;
    };
    const data = { ...values };
    ['images', 'tickets', 'curriculum', 'itinerary', 'speakers'].forEach(key => {
      if (Array.isArray(data[key])) {
        data[key] = data[key].map(withoutId);
      }
    });
    if (Array.isArray(data.documents)) {
      data.documents = data.documents.map(document => {
        const next = withoutId(document);
        if (!next || !Array.isArray(next.files)) {
          return next;
        }
        return { ...next, files: next.files.map(withoutId) };
      });
    }
    return data;
  };

  const registerapi = async (values) => {

    try {
      const builtData = buildSubmissionData(values);
      const data = draftId && !id ? prepareDraftForPublish(builtData) : builtData;


      setAccount(data);
      const finalData = {
        ...data,
        "price_type": data?.price_type === 2 ? 0 : 1,
      };

      ;

      if (data?.journey_level_id === "") {
        delete finalData?.journey_level_id;
      }

      const resultAction = id
        ? await dispatch(eventcreateAPI({ data: { ...finalData, id }, showToast }))
        : await dispatch(eventcreateAPI({ data: finalData, showToast }));

      ;

      if (eventcreateAPI.fulfilled.match(resultAction)) {
        const responsePayload = resultAction.payload;
        const responseData = responsePayload?.response;
        const eventId = responseData?.id || responsePayload?.id || id;
        if (responsePayload?.status && eventId) {
          ;
          // navigation.navigate('MainEventDetail', { id: eventId });
          navigation.navigate('MainNavigator');
        } else {
          showToast(responseData?.message || 'Failed to save event. Please try again.', 3);
        }
      } else {
        ;
        showToast('Failed to create event. Please try again.');
      }

    } catch (error) {
      ;
      showToast('An error occurred while creating the event. Please try again.');
    }
  };



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formikContainer}>
          <View style={styles.cardbox}>
            <TicketTypes
              value={formik?.values?.tickets}
              onChange={tickets => formik.setFieldValue('tickets', tickets)}
            />
          </View>

          {Number(formik.values?.price_type || 0) === 1 ? (
            <View style={styles.stripeCard}>
              <View style={styles.stripeCopy}>
                <Text style={styles.stripeTitle}>Stripe payouts</Text>
                <Text style={styles.stripeDescription}>
                  {stripeStatus?.ready
                    ? 'Connected and ready for paid listings.'
                    : 'Connect Stripe before publishing this paid listing.'}
                </Text>
              </View>
              {stripeLoading ? (
                <ActivityIndicator color="#422199" />
              ) : (
                <View style={styles.stripeActions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={stripeStatus?.ready ? refreshStripeStatus : connectStripe}
                    style={styles.stripeButton}
                  >
                    <Text style={styles.stripeButtonText}>
                      {stripeStatus?.ready
                        ? 'Refresh'
                        : stripeStatus?.connected
                          ? 'Continue setup'
                          : 'Connect Stripe'}
                    </Text>
                  </TouchableOpacity>
                  {stripeStatus?.connected && !stripeStatus?.ready ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={refreshStripeStatus}
                      style={styles.stripeRefreshButton}
                    >
                      <Text style={styles.stripeRefreshText}>Refresh status</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </View>
          ) : null}
          <View style={styles.cardbox}>

            <Text style={[styles.label, { fontSize: 16 }]}>Event Material</Text>

            <AddAttachment
              setValues={formik.setFieldValue}
              value={formik?.values?.documents}
              formik={formik}
              name={'documents'}
              label={'documents'}
            />
            {(formik.touched?.['documents'] && showError && formik.errors?.['documents']) && (
              <Text style={[styles.errorMessage]}>
                {formik.errors?.['documents']}
              </Text>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <View style={styles.infoBtnContainer}>
              <TouchableLabel
                label={'Save Draft'}
                onPress={saveDraft}
                disabled={savingDraft}
                containerStyle={styles.viewallContainer}
                labelStyle={styles.viewallLabel}
              />
            </View>
            <GradientButton
              onPress={formik.handleSubmit}
              title="Publish"
              containerStyle={styles.customButtonContainer}
              textStyle={styles.customButtonText}
              gradientstyles={styles?.gradientstyles}
              colors={['#DB3171', '#FFCC33']}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 1, y: 0.1 }}
            />
          </View>
          <TouchableLabel
            label={'Preview User View'}
            accessibilityLabel="Preview event"
            onPress={() => navigation.navigate('PreviewEvent', { data: buildSubmissionData(formik.values) })}
            containerStyle={styles.previewContainer}
            labelStyle={styles.previewLabel}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formikContainer: {
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    fontSize: fontScale(12),
    color: '#161616',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
  },
  textInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#161616',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },


  errorMessage: {
    color: 'red',
    marginTop: heightScale(4),
  }, 
  cardbox: {
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    borderWidth:0.2,
    borderColor:'gray'
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingTop: 26
  },
  stripeCard: {
    alignItems: 'center',
    backgroundColor: '#F9F6FD',
    borderColor: '#D9CDEA',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 10,
    padding: 16,
  },
  stripeCopy: {
    flex: 1,
    paddingRight: 12,
  },
  stripeTitle: {
    color: '#191719',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: fontScale(14),
  },
  stripeDescription: {
    color: '#706A76',
    fontFamily: fontFamilies.SFProRoundedBlackRegular,
    fontSize: fontScale(11),
    marginTop: 4,
  },
  stripeButton: {
    borderColor: '#422199',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  stripeButtonText: {
    color: '#422199',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
    fontSize: fontScale(11),
  },
  stripeActions: {
    alignItems: 'center',
    gap: 8,
  },
  stripeRefreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stripeRefreshText: {
    color: '#706A76',
    fontFamily: fontFamilies.SFProRoundedBlackMedium,
    fontSize: fontScale(10),
    textDecorationLine: 'underline',
  },
  previewContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderColor: '#422199',
    borderWidth: 1,
    marginTop: heightScale(12),
    minHeight: heightScale(48),
  },
  previewLabel: {
    color: '#422199',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  infoBtnContainer: {
    width: '50%',
  },
  gradientBorder: {
    borderRadius: widthScale(90),
    padding: widthScale(1.3),
  },
  viewallContainer: {
    height: heightScale(55),
    width: '98%',
    borderRadius: widthScale(90),
    paddingVertical: heightScale(8),
    paddingHorizontal: widthScale(16),
    backgroundColor: '#FDFBFF',
    borderWidth: 1,
    borderColor: "#422199"
  },
  viewallLabel: {
    color: '#161616',
    fontSize: 12,
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  customButtonContainer: {
    width: '50%',
    marginBottom: heightScale(0),
    backgroundColor: '#fff',

  },
  customButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: fontFamilies.SFProRoundedBlackBold,
  },
  gradientstyles: {
    paddingVertical: heightScale(15),
  }
});

export default Confirm;
