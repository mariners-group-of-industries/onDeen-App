import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import initialTokenSlice from './slices/initialTokenSlice';
import loginSlice from './slices/loginSlice';
import { loginPersistConfig } from './persistConfigs/loginPersistConfig';
import { tokenPersistConfig } from './persistConfigs/tokenPersistConfig';
import sendOtpSlice from './slices/sendOtpSlice';
import verifyOtpSlice from './slices/verifyOtpSlice';
import registerUserSlice from './slices/registerUserSlice';
import homepageSlice from './slices/homepageSlice';
import eventsSlice from './slices/eventsSlice';
import bookingSlice from './slices/bookingSlice';
import bookingListSlice from './slices/bookingLIstSlice';
import { verifyOtpPersistConfig } from './persistConfigs/verifyOtpPersistConfig';
import { registerPersistConfig } from './persistConfigs/registerPersistConfig';
import profileSlice from './slices/profileSlice';
import logoutSlice from './slices/logoutSlice';
import speakerSlice from './slices/speakerSlice';
import notesSlice from './slices/notesSlice';
import searchSlice from './slices/searchSlice';
import questionAnswerSlice from './slices/questionAnswerSlice';
import sorteventSlice from './slices/sorteventSlice';
import notificationSlice from './slices/notificationSlice';
import wishlistSlice from './slices/wishlistSlice';
import membershipSlice from './slices/membershipSlice';
import journeylevelsSlice from './slices/journeylevelsSlice';
import mymembershipSlice from './slices/mymembershipSlice';
import checkInSlice from './slices/checkInSlice';
import editProfileSlice from './slices/editProfileSlice';
import requestBuddySlice from './slices/requestBuddySlice';
import requestSessionSlice from './slices/requestSessionSlice';
import filterEventSlice from './slices/filterEventSlice';
import applyFilterSlice from './slices/applyFilterSlice';
import createPasswordSlice from './slices/createPasswordSlice';
import categorySlice from './slices/categorySlice';
import homeEventsSlice from './slices/homeEventsSlice';
import mainpageSlice from './slices/mainpageSlice';
import allQrSlice from './slices/allQrSlice';
import speakerSlots from './slices/speakerSlots';
import listRequestBuddy from './slices/listRequestBuddy';
import updateSessionRequest from './slices/updateSessionRequest';
import searchResults from './slices/searchResults';
import fcmTokenSlice from './slices/fcmTokenSlice';
import ratingSlice from './slices/ratingSlice';
import updatePrivacySlice from './slices/updatePrivacySlice';
import cancelBookingSlice from './slices/cancelBookingSlice';
import participantsSlice from './slices/participantsSlice';
import participantProfile from './slices/participantProfile';
import deleteNotification from './slices/deleteNotification';
import paymentStatusSlice from './slices/paymentStatusSlice';
import deleteAccountSlice from './slices/deleteAccountSlice';
// Persisted reducers
const persistedLoginReducer = persistReducer(loginPersistConfig, loginSlice);
const persistedTokenReducer = persistReducer(tokenPersistConfig, initialTokenSlice);
const persistedVerifyOtpReducer = persistReducer(verifyOtpPersistConfig, verifyOtpSlice);
const persistedRegisterReducer = persistReducer(registerPersistConfig, registerUserSlice);

// Store configuration
export const store = configureStore({
  reducer: {
    user: persistedLoginReducer,
    token: persistedTokenReducer,
    sendOtp: sendOtpSlice,
    verifyOtp: persistedVerifyOtpReducer,
    registerUser: persistedRegisterReducer,
    homepage: homepageSlice,
    booking: bookingSlice,
    eventDetails: eventsSlice,
    bookingList: bookingListSlice,
    profileSlice: profileSlice,
    speakerSlice: speakerSlice,
    logout: logoutSlice,
    notesSlice: notesSlice,
    searchSlice: searchSlice,
    questionAnswerSlice: questionAnswerSlice,
    sortevent: sorteventSlice,
    notification: notificationSlice,
    wishlist: wishlistSlice,
    membership: membershipSlice,
    journeylevels: journeylevelsSlice,
    mymembership: mymembershipSlice,
    checkInSlice: checkInSlice,
    editProfileSlice: editProfileSlice,
    requestBuddySlice: requestBuddySlice,
    requestSessionSlice: requestSessionSlice,
    filterEventSlice: filterEventSlice,
    applyFilterSlice: applyFilterSlice,
    createPasswordSlice: createPasswordSlice,
    categorySlice: categorySlice,
    homeEventsSlice: homeEventsSlice,
    mainpagelist:mainpageSlice,
    allQrSlice:allQrSlice,
    speakerSlots:speakerSlots,
    listRequestBuddy:listRequestBuddy,
    updateSessionRequest:updateSessionRequest,
    searchResults:searchResults,
    fcmTokenSlice:fcmTokenSlice,
    ratingSlice:ratingSlice,
    updatePrivacySlice:updatePrivacySlice,
    cancelBookingSlice:cancelBookingSlice,
    participantsSlice:participantsSlice,
    participantProfile:participantProfile,
    deleteNotification:deleteNotification,
    paymentStatusSlice:paymentStatusSlice,
    deleteAccountSlice:deleteAccountSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
