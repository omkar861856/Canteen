import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  itemId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  availability: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  preparationTime: number;
}

const initialState: CartItem[] = [];

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;

      // Check if the item already exists in the cart
      const existingItem = state.find(cartItem => cartItem.itemId === item.itemId);

      if (existingItem) {
        // If the item exists, increase the quantity by 1
        existingItem.quantity += 1;
      } else {
        // If the item doesn't exist, add it to the cart with quantity 1
        state.push({ ...item, quantity: 1 });
      }
    },
    decrementCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;

      // Find the item in the cart
      const existingItem = state.find(cartItem => cartItem.itemId === item.itemId);

      if (existingItem) {
        // Decrement the quantity, but do not go below 1
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          // If quantity is 1, remove the item from the cart
          state.splice(state.indexOf(existingItem), 1);
        }
      }
    },
    incrementCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;

      // Find the item in the cart
      const existingItem = state.find(cartItem => cartItem.itemId === item.itemId);

      if (existingItem) {
        // Check if the current quantity is less than the available quantity
          existingItem.quantity += 1; // Increment the quantity
      }
    },
    removeFromCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;

      // Find the index of the item in the cart
      const existingItemIndex = state.findIndex(cartItem => cartItem.itemId === item.itemId);

      // If the item exists in the cart, remove it
      if (existingItemIndex !== -1) {
        state.splice(existingItemIndex, 1); // Remove the item from the cart
      }
    },
    // Action to empty the cart
    emptyCart: () => {
      return []; // Reset the state to an empty array
    },
  },
});

export const { setCart, incrementCart, decrementCart, removeFromCart, emptyCart } = cartSlice.actions;
export default cartSlice.reducer;