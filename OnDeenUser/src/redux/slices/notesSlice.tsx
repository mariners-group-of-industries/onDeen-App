import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface Note {
  id: number;
  event_id: number;
  notes: string;
  title: string;
}

interface NotesState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  notes: Note[];
  noteDetail: Note | null;
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
}

const initialState: NotesState = {
  status: 'idle',
  error: null,
  notes: [],
  noteDetail: null,
  createStatus: 'idle',
  deleteStatus: {},
};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
});

// Async thunk to create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ eventId, note,title, id }: { eventId: number; note: string; title:string, id:string}, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/event_note_add',
        method: 'POST',
        data: { event_id: eventId, note, title, id },
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });


if (!response.status) {
    const errorMessage =
      typeof response.message === 'string'
        ? response.message
        : 'An unknown error occurred';
    return rejectWithValue(errorMessage);
  }
      return response.response.message; // Returning success message
    } catch (error: any) {
        
        
      return rejectWithValue(error.response?.data?.message || 'Failed to create note.');
    }
  }
);

// Async thunk to fetch all notes for an event
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (eventId: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/get_all_event_note',
        method: 'POST',
        data: { event_id: eventId },
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });


      if (!response.status) return rejectWithValue(response.message);
      return response.response; // Returning notes array
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes.');
    }
  }
);

// Async thunk to fetch a note by ID
export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (id: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/get_event_note_byid',
        method: 'POST',
        data: { id },
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });      

      if (!response.status) return rejectWithValue(response.message);
      return response.response; // Returning note detail
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch note details.');
    }
  }
);

// Async thunk to delete a note by ID
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: number, { getState, rejectWithValue }) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    try {
      const response = await apiRequest({
        url: '/customer_app/event/event_note_delete',
        method: 'POST',
        data: { id },
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });

      if (!response.status) return rejectWithValue(response.message);
      return id; // Returning the deleted note ID
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note.');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    resetNotesState: state => {
      state.status = 'idle';
      state.error = null;
      state.notes = [];
      state.noteDetail = null;
      state.createStatus = 'idle';
      state.deleteStatus = {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createNote.pending, state => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
      })
      .addCase(createNote.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchNotes.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchNoteById.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.noteDetail = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteNote.pending, (state, action) => {
        state.deleteStatus[action.meta.arg] = 'loading';
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.deleteStatus[action.payload] = 'succeeded';
        state.notes = state.notes.filter(note => note.id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.deleteStatus[action.meta.arg] = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetNotesState } = notesSlice.actions;
export default notesSlice.reducer;
