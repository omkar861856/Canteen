import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

// to extract kitchenId from url
function getFirstPathOrEndpoint(pathname:string) {
  // Remove leading and trailing slashes, then split the pathname
  const parts = pathname.replace(/^\/|\/$/g, '').split('/');
  // Return the first part of the split array
  return parts[0];
}

const kitchenId = getFirstPathOrEndpoint(location.pathname)

interface AppState {
  kitchenNumber:string;
  kitchenId: string;
  kitchenName: string;
  loading:boolean;
  error:string | null;
  status: "loading" | "succeeded" | "failed" | null;
  kitchenStatus: boolean;
}

const initialState: AppState = {
  kitchenId:kitchenId,
  kitchenNumber:"8888888888",
  loading:false,
  error:null,
  status: null,
  kitchenStatus: false,
  kitchenName:"Demo"
};

// Thunk to send feedback to the backend
export const connectKitchen = createAsyncThunk(
  'app/connectKitchen',
  async (appData: AppState, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${apiUrl}/connect-kitchen`, appData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Failed to send feedback');
    }
  }
);

export const fetchKitchenStatus = createAsyncThunk(
  'kitchen/fetchKitchenStatus',
  async (_, { rejectWithValue }) => {
    if (!kitchenId) {
      return rejectWithValue('Kitchen ID is required');
    }
    try {
      const response = await axios.get(`${apiUrl}/auth/kitchen-status/${kitchenId}`);
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch kitchen status');
    }
  }
);

// Create the slice
const feedbackSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Optionally, you can add synchronous reducers if needed
    setKitchenStatus: (state, action) => {
      state.kitchenStatus = action.payload; // Assuming `kitchenStatus` exists in the initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectKitchen.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(connectKitchen.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(connectKitchen.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchKitchenStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.kitchenStatus = action.payload.status;
        state.kitchenNumber = action.payload.kitchenNumber;
        state.kitchenName = action.payload.kitchenName;
      })
      .addCase(fetchKitchenStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setKitchenStatus } = feedbackSlice.actions;
export default feedbackSlice.reducer;