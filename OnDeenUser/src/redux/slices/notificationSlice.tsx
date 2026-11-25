// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiGetRequest } from '../../services/api';
// import { RootState } from '../store';

// export interface NotificationItem {
//   created_on: string;
//   event_id: number;
//   id: number;
//   message: string;
//   seen: number;
//   title: string;
//   type: number;
// }

// interface NotificationsState {
//   status: 'idle' | 'loading' | 'succeeded' | 'failed';
//   error: string | null;
//   notifications: NotificationItem[];
// }

// const initialState: NotificationsState = {
//   status: 'idle',
//   error: null,
//   notifications: [],
// };

// // Thunk to fetch notifications
// export const fetchNotifications = createAsyncThunk(
//   'notifications/fetchNotifications',
//   async (_, { getState, rejectWithValue }) => {
//     try {
//       const token = (getState() as RootState).token?.token?.access_token;
//     const bearerToken = (getState() as RootState).user?.loginToken;
//     const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
//     const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;

//       const response = await apiGetRequest({
//         url: '/customer_app/users/get_notifications',
//         method: 'GET',
//         authToken: token,
//         bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
//         contentType: 'application/json',
//       });
// console.log('notttt resss >>>>',response);

//       return response.response; // assuming response has the `response` array
//     } catch (error: any) {
//       console.error('Notifications Fetch Error :::::', error);
//       const message =
//         error?.response?.data?.message || 'Failed to fetch notifications';
//       return rejectWithValue(message);
//     }
//   }
// );

// const notificationsSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     resetNotificationsState: (state) => {
//       state.status = 'idle';
//       state.error = null;
//       state.notifications = [];
//     },
//     markNotificationSeen: (state, action) => {
//       const id = action.payload;
//       const notification = state.notifications.find(n => n.id === id);
//       if (notification) {
//         notification.seen = 1;
//       }
//     },
//     markAllNotificationsSeen: (state) => {
//       state.notifications = state.notifications.map(n => ({
//         ...n,
//         seen: 1,
//       }));
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNotifications.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchNotifications.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.notifications = action.payload;
//       })
//       .addCase(fetchNotifications.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload as string;
//       });
//   },
// });

// export const {
//   resetNotificationsState,
//   markNotificationSeen,
//   markAllNotificationsSeen,
// } = notificationsSlice.actions;

// export default notificationsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiPostRequest, apiRequest } from '../../services/api';
import { RootState } from '../store';

export interface NotificationItem {
  created_on: string;
  event_id: number;
  id: number;
  message: string;
  link_url?: string | null;
  seen: number;
  title: string;
  type: number;
}

interface MarkSeenResponse {
  message: string;
  user_id: number;
}

interface NotificationsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  notifications: NotificationItem[];
  markSeenStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  markSeenError: string | null;
  markSeenResponse: MarkSeenResponse | null;
}

const initialState: NotificationsState = {
  status: 'idle',
  error: null,
  notifications: [],
  markSeenStatus: 'idle',
  markSeenError: null,
  markSeenResponse: null,
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    try {
     const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;

      const response = await apiGetRequest({
        url: '/customer_app/users/get_notifications',
        method: 'GET',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });

      return response.response;
    } catch (error: any) {

      const message =
        error?.response?.data?.message || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

// Mark single notification as seen
export const markNotificationAsSeen = createAsyncThunk(
  'notifications/markNotificationAsSeen',
  async (id: number, { getState, rejectWithValue }) => {
    try {
     const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;

      const response = await apiRequest({
        url: '/customer_app/users/seen_notification',
        method: 'POST',
        data: { id },
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });

      return response.response as MarkSeenResponse;
    } catch (error: any) {

      const message =
        error?.response?.data?.message || 'Failed to update notification';
      return rejectWithValue(message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationsState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.notifications = [];
      state.markSeenStatus = 'idle';
      state.markSeenError = null;
      state.markSeenResponse = null;
    },
    markNotificationSeenLocally: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        notification.seen = 1;
      }
    },
    markAllNotificationsSeen: (state) => {
      state.notifications = state.notifications.map(n => ({
        ...n,
        seen: 1,
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Mark notification as seen
      .addCase(markNotificationAsSeen.pending, (state) => {
        state.markSeenStatus = 'loading';
        state.markSeenError = null;
        state.markSeenResponse = null;
      })
      .addCase(markNotificationAsSeen.fulfilled, (state, action) => {
        state.markSeenStatus = 'succeeded';
        state.markSeenResponse = action.payload;
      })
      .addCase(markNotificationAsSeen.rejected, (state, action) => {
        state.markSeenStatus = 'failed';
        state.markSeenError = action.payload as string;
      });
  },
});

export const {
  resetNotificationsState,
  markNotificationSeenLocally,
  markAllNotificationsSeen,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
