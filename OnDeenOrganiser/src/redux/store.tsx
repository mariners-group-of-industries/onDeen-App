import {configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import initialTokenSlice from './slices/initialTokenSlice';
import loginSlice from './slices/loginSlice';
import {loginPersistConfig} from './persistConfigs/loginPersistConfig';
import {tokenPersistConfig} from './persistConfigs/tokenPersistConfig';
import sendOtpSlice from './slices/sendOtpSlice';
import verifyOtpSlice from './slices/verifyOtpSlice';
import registerUserSlice from './slices/registerUserSlice';
import categorySlice from './slices/categorySlice';
import schooltypeSlice from './slices/schooltypeSlice';
import sectlistSlice from './slices/sectlistSlice';
import registerquestionSlice from './slices/registerquestionSlice';
import subcategorySlice from './slices/subcategorySlice';
import createAccountSlice from './slices/createAccountSlice';
import imageuploadSlice from './slices/imageuploadSlice';
import getmasterdataSlice from './slices/getallmastereventListing';
import eventcreateSlice from './slices/eventcreateSlice';
import eventbyidSlice from './slices/eventbyidSlice';
import geteventListingSlice from './slices/geteventListingSlice';
import geteventFilteredListingSlice from './slices/geteventFilteredListingSlice';
import getprofileSlice from './slices/getprofileSlice'
import getdashboardSlice from './slices/getdashboardSlice'
import participantidSlice from './slices/participantidSlice'
import getparticipantattendancelistidSlice from './slices/getparticipantattendancelistidSlice'
import walletTransactionsSlice from './slices/walletTransactionsSlice'
import bookingListSlice from './slices/bookingLIstSlice'
import updateattendanceSlice from './slices/updateattendanceSlice'
import eventquestionSlice from './slices/eventquestionSlice';
import oneToOneSessionsSlice from './slices/oneToOneSessionsSlice';

// Persisted reducers
const persistedLoginReducer = persistReducer(loginPersistConfig, loginSlice);
const persistedTokenReducer = persistReducer(
  tokenPersistConfig,
  initialTokenSlice,
);

// Store configuration
export const store = configureStore({
  reducer: {
    user: persistedLoginReducer,
    token: persistedTokenReducer,
    sendOtp: sendOtpSlice,
    verifyOtp: verifyOtpSlice,
    registerUser: registerUserSlice,
    category: categorySlice,
    schooltype: schooltypeSlice,
    sectlist: sectlistSlice,
    registerquestion: registerquestionSlice,
    subcategory: subcategorySlice,
    createaccount: createAccountSlice,
    imageupload: imageuploadSlice,
    getmasterdata: getmasterdataSlice,
    eventcreate: eventcreateSlice,
    geteventlist:geteventListingSlice,
    getfilteredeventlist:geteventFilteredListingSlice,
    eventbyid: eventbyidSlice,
    profiledatails: getprofileSlice,
    getdashboard: getdashboardSlice,
    participantlist: participantidSlice,
    getparticipantattendancelist:getparticipantattendancelistidSlice,
    wallettransactions:walletTransactionsSlice,
    bookingList: bookingListSlice,
    updateattendance: updateattendanceSlice,
    eventquestion: eventquestionSlice,
    oneToOneSessions: oneToOneSessionsSlice,

  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['meta.arg.showToast'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
