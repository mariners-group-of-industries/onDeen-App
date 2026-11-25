    import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
    import {apiRequest} from '../../services/api';
    import {RootState} from '../store';

    interface BookingResponse {
      event_id: number;
      participant_id: number;
      payment_status: number;
      payment_transaction_id: number;
      qrcode: string;
      user_id: number;
      client_secret:any
    }

    interface BookingState {
      status: 'idle' | 'loading' | 'succeeded' | 'failed';
      error: string | null;
      bookingMessage: string | null;
      bookingData: BookingResponse | null;
      apiStatus: boolean | null;
      client_secret: any;
    }

    const initialState: BookingState = {
      status: 'idle',
      error: null,
      bookingMessage: null,
      bookingData: null,
      apiStatus: null,
      client_secret:null,
    };
    
    export const fetchBookingData = createAsyncThunk(
      '/customer_app/event/booking',
      async (
        bookingData: { 
          event_id: number; 
          date_time_id?: number; 
          quantity?: number; 
          tickets: { id: number; quantity: number }[] 
        },
        { getState, rejectWithValue }
      ) => {
    
        const token = (getState() as RootState).token?.token?.access_token;
        const bearerToken = (getState() as RootState).user?.loginToken;
        const accessTokenVerifyOtp = (getState() as RootState).verifyOtp?.verifyOtp_access_token;
        const accessTokenNewRegister = (getState() as RootState).registerUser?.access_token;
    
        const validTickets = bookingData?.tickets?.filter(ticket => ticket.quantity > 0) || [];
    
        // ✅ Ensure all scenarios are correctly formatted
        const formattedData: any = {
          event_id: bookingData.event_id,
          tickets: validTickets.length > 0 ? validTickets : [],
        };
    
        if (bookingData.date_time_id) {
          formattedData.date_time_id = bookingData.date_time_id; // Only add if it exists
        }
    
        if (validTickets.length === 0 && bookingData.quantity) {
          formattedData.quantity = bookingData.quantity; // Only send if no tickets
        }
    
    
        try {
          const response = await apiRequest({
            url: '/customer_app/event/booking',
            method: 'POST',
            authToken: token,
            bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
            contentType: 'application/json',
            data: formattedData,
          });
    
          return response;
        } catch (error: any) {

          return rejectWithValue(error.message || 'Failed to fetch booking data');
        }
      }
    );
    
    
    
    
    const bookingSlice = createSlice({
      name: 'booking',
      initialState,
      reducers: {
        resetApiStatus: state => {
          state.apiStatus = null;
        },
      },
      extraReducers: builder => {
        builder
          .addCase(fetchBookingData.pending, state => {
            state.status = 'loading';
            state.error = null;
            state.bookingMessage = null;
            state.bookingData = null;
            state.apiStatus = null;
            state.client_secret = null;
          })
          .addCase(fetchBookingData.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.bookingData = action.payload.response;
            state.apiStatus = action.payload.status;
            state.client_secret = action.payload.response.client_secret;
            state.bookingMessage = action.payload.response.message;
          })
          .addCase(fetchBookingData.rejected, (state, action) => {
            state.status = 'failed';
            state.error =
              typeof action.payload === 'string' ? action.payload : 'Unknown error';
            state.bookingMessage = null;
            state.bookingData = null;
            state.client_secret = null;
            state.apiStatus = false;
          });
      },
    });
    export const {resetApiStatus} = bookingSlice.actions;

    export default bookingSlice.reducer;
