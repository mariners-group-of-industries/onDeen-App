import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

// Define the response and state interfaces
interface SearchResult {
  id: number;
  title: string;
}

interface SearchState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchResults: SearchResult[];
}

// Initial state for the search slice
const initialState: SearchState = {
  status: 'idle',
  error: null,
  searchResults: [],
};

// Async thunk for fetching search results
export const fetchSearchResults = createAsyncThunk(
  '/customer_app/event/event_search',
  async (searchQuery: any, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp
      .verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser
      .access_token;
    try {
      const response = await apiRequest({
        url: `/customer_app/event/${
          searchQuery?.length == '' ? 'search_history' : 'event_search'
        }`,
        // url: `/customer_app/event/event_search`,
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: {search: searchQuery},
      });

      if (!response.status) {

        return rejectWithValue(
          response.response?.message || 'Failed to fetch search results',
        );
      }
      
      return response.response; // Ensure data is serializable
    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to fetch search results');
    }
  },
);

// Search slice definition
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: state => {
      state.searchResults = []; // Clear results
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSearchResults.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.searchResults = []; // Reset results during new search
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Unknown error';
        state.searchResults = [];
      });
  },
});

export const {clearSearchResults} = searchSlice.actions;

export default searchSlice.reducer;
