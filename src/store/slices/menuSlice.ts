// menuSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

export interface InventoryItem {
  itemId: string;
  name: string;
  category: string;
  price: number;
  quantityAvailable: number;
  availability: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  preparationTime: number;
}

interface InventoryState {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  inventory: [],
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk<InventoryItem[]>(
  'menu/fetchInventory',
  async () => {
    const response = await axios.get(`${apiUrl}/inventory`);
    return response.data; 
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload; // Wrap payload in an object
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data';
      });
  },
});

export default menuSlice.reducer;