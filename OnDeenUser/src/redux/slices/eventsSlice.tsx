import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

interface Event {
  id: number;
  title: string;
  ar_title: string;
  start_date: string;
  end_date: string;
  price: number;
  price_type: number;
  primary_image: string;
  tags: string;
}

interface EventsState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  events: Event[];
  currentPage: number;
  pages: number;
  total: number;
  eventsSort1: Event[];
  eventsSort2: Event[];
  eventsSort3: Event[];
  eventsSort4: Event[];
  eventDetail: Event | null;
  organizerEvents1: [];
  organizerEvents2: [];
  organizerEvents3: [];
  organizerEvents4: [];
  organizerStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
  organizerDetail: Record<string, any> | null;
}

const initialState: EventsState = {
  status: 'idle',
  error: null,
  events: [],
  currentPage: 1,
  pages: 0,
  total: 0,
  eventsSort1: [],
  eventsSort2: [],
  eventsSort3: [],
  eventsSort4: [],
  eventDetail: null,
  organizerEvents1: [],
  organizerEvents2: [],
  organizerEvents3: [],
  organizerEvents4: [],
  organizerStatus: {},
  organizerDetail: null,
};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken,
});

// Async Thunk for fetching events
export const fetchEvents = createAsyncThunk(
  'eventDetails/fetchEvents',
  async (
    // {
    //   categoryId,
    //   eventType,
    //   latitude,
    //   longitude,
    // }: {categoryId: number; eventType: number; latitude: any; longitude: any},
    // {getState, rejectWithValue},
  ) => {
    const {authToken, bearerToken} = getAuthTokens(getState() as RootState);

    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        data: {
          category_id: categoryId,
          event_type: eventType,
          latitude: latitude,
          longitude: longitude,
        },
        authToken,
        bearerToken,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      const {events, current_page, pages, total} = response.response;
      return {events, currentPage: current_page, pages, total};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch event details.',
      );
    }
  },
);

export const fetchEventsByOrganizer = createAsyncThunk(
  'organizerDetails/fetchEventsByOrganizer',
  async (
    {organizerId, sortType}: {organizerId: number; sortType: number},
    {getState, rejectWithValue},
  ) => {
    const {authToken, bearerToken} = getAuthTokens(getState() as RootState);

    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        data: {organizer_id: organizerId, sort: sortType},
        authToken,
        bearerToken,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      return {events: response.response.events, sortType};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch organizer events.',
      );
    }
  },
);

// Generic Async Thunk for fetching events by sort type
export const fetchEventsBySort = createAsyncThunk(
  'eventDetails/fetchEventsBySort',
  async (
    {sortType, categoryId}: {sortType: number; categoryId: number},
    {getState, rejectWithValue},
  ) => {
    const {authToken, bearerToken} = getAuthTokens(getState() as RootState);
    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        data: {category_id: categoryId, sort: sortType},
        authToken,
        bearerToken,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      return {events: response.response.events, sortType};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sorted events.');
    }
  },
);

// Async Thunk for fetching event details by ID
export const fetchEventById = createAsyncThunk(
  'eventDetails/fetchEventById',
  async (eventId: number, {getState, rejectWithValue}) => {
    const {authToken} = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
      
    try {
      const response = await apiGetRequest({
        url: `/customer_app/event/event_id?id=${eventId}`,
        method: 'GET',
        authToken,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      if (!response.status) return rejectWithValue(response.message);

      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch event details.',
      );
    }
  },
);

export const fetchEventByIdForRepeatBooking = createAsyncThunk(
  'eventDetails/fetchEventById',
  async (
    { eventId, participant_id }: { eventId: number; participant_id?: number },
    { getState, rejectWithValue }
  ) => {
    const { authToken } = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const params = new URLSearchParams({ id: eventId?.toString() });
      if (participant_id !== undefined) {
        params.append('participant_id', participant_id?.toString());
      }

      const response = await apiGetRequest({
        url: `/customer_app/event/event_id?${params?.toString()}`,
        method: 'GET',
        authToken,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch event details.',
      );
    }
  }
);

export const fetchOrganizerById = createAsyncThunk(
  'organizerDetails/fetchOrganizerById',
  async (organizerId: number, {getState, rejectWithValue}) => {
    const {authToken} = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    try {
      const response = await apiGetRequest({
        url: `/customer_app/organizer/organizer_id?id=${organizerId}`,
        method: 'GET',
        authToken,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);

      return response.response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch organizer details.',
      );
    }
  },
);

const eventsSlice = createSlice({
  name: 'eventDetails',
  initialState,
  reducers: {
    resetEventDetailsState: state => {
      state.status = 'idle';
      state.error = null;
      state.events = [];
      state.eventsSort1 = [];
      state.eventsSort2 = [];
      state.eventsSort3 = [];
      state.eventsSort4 = [];
      state.organizerEvents1 = [];
      state.organizerEvents2 = [];
      state.organizerEvents3 = [];
      state.organizerEvents4 = [];
      state.organizerStatus = {};
      state.currentPage = 1;
      state.pages = 0;
      state.total = 0;
      state.eventDetail = null;
      state.organizerDetail = null;
    },
    resetOrganizerDetailsState: state => {
      state.status = 'idle';
      state.error = null;
      state.events = [];
      state.eventsSort1 = [];
      state.eventsSort2 = [];
      state.eventsSort3 = [];
      state.eventsSort4 = [];
      state.organizerEvents1 = [];
      state.organizerEvents2 = [];
      state.organizerEvents3 = [];
      state.organizerEvents4 = [];
      state.organizerStatus = {};
      state.currentPage = 1;
      state.pages = 0;
      state.total = 0;
      state.eventDetail = null;
      state.organizerDetail = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEvents.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        const {events, currentPage, pages, total} = action.payload;
        state.status = 'succeeded';
        state.events = events;
        state.currentPage = currentPage;
        state.pages = pages;
        state.total = total;
        state.eventsSort1 = events;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchEventsBySort.fulfilled, (state, action) => {
        const {events, sortType} = action.payload;
        if (sortType === 1) state.eventsSort1 = events;
        if (sortType === 2) state.eventsSort2 = events;
        if (sortType === 3) state.eventsSort3 = events;
        if (sortType === 4) state.eventsSort4 = events;
      })
      .addCase(fetchEventsByOrganizer.pending, (state, action) => {
        const {organizerId} = action.meta.arg;
        state.organizerStatus[organizerId] = 'loading';
      })
      .addCase(fetchEventsByOrganizer.fulfilled, (state, action) => {
        const {events, sortType} = action.payload;
        state.organizerEvents1 = events;
        if (sortType === 1) state.organizerEvents1 = events;
        if (sortType === 2) state.organizerEvents2 = events;
        if (sortType === 3) state.organizerEvents3 = events;
        if (sortType === 4) state.organizerEvents4 = events;
        // state.organizerStatus[sortType] = 'succeeded';
        // state.organizerEvents[sortType] = events;
      })
      .addCase(fetchEventsByOrganizer.rejected, (state, action) => {
        const {organizerId} = action.meta.arg;
        state.organizerStatus[organizerId] = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchEventsBySort.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchEventById.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventDetail = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchOrganizerById.pending, (state, action) => {
        const organizerId = action.meta.arg;
        state.organizerStatus[organizerId] = 'loading';
      })
      .addCase(fetchOrganizerById.fulfilled, (state, action) => {
        state.organizerStatus[action.meta.arg] = 'succeeded';
        state.organizerDetail = action.payload; // Store organizer details
      })
      .addCase(fetchOrganizerById.rejected, (state, action) => {
        const organizerId = action.meta.arg;
        state.organizerStatus[organizerId] = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {resetEventDetailsState, resetOrganizerDetailsState} =
  eventsSlice.actions;
export default eventsSlice.reducer;
