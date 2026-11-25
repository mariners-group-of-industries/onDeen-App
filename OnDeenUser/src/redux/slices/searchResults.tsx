import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

// Define TypeScript interfaces for state and API response
interface SearchResult {
  id: number;
  title: string;
}

interface SearchState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchResults: SearchResult[];
}

// Initial state
const initialState: SearchState = {
  status: 'idle',
  error: null,
  searchResults: [],
};

// Async thunk to fetch search results
export const fetchSearchResultsNewScenario = createAsyncThunk<
  SearchResult[],  // Return type
  string,          // Argument type (search query)
  { state: RootState }
>(
  'search/fetchSearchResultsNewScenario',
  async (searchQuery, { getState, rejectWithValue }) => {
    try {
      const token = getState().token?.token?.access_token;
      const bearerToken = getState().user?.loginToken;
      const accessTokenVerifyOtp = getState().verifyOtp.verifyOtp_access_token;
      const accessTokenNewRegister = getState().registerUser.access_token;

      const response = await apiRequest({
        url: '/customer_app/event/event_search',
        method: 'POST',
        authToken: token,
        bearerToken:
          bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
        data: { search: searchQuery },
      });
      
      if (!response.status) {

        return rejectWithValue(
          response.response?.message || 'Failed to fetch search results'
        );
      }

      return response.response; // Return fetched data
    } catch (error: any) {

      return rejectWithValue(error.message || 'Failed to fetch search results');
    }
  }
);

// Redux slice
const fetchSearchResultsNewScenarioSlice = createSlice({
  name: 'searchResults',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResultsNewScenario.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.searchResults = []; // Reset results while fetching new data
      })
      .addCase(fetchSearchResultsNewScenario.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchResultsNewScenario.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Unknown error';
        state.searchResults = [];
      });
  },
});

// Export actions & reducer
export const { clearSearchResults } = fetchSearchResultsNewScenarioSlice.actions;
export default fetchSearchResultsNewScenarioSlice.reducer;
