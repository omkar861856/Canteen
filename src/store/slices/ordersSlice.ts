import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';
import { InventoryItem } from './menuSlice';

// Define interfaces for orders and their statuses
export interface Order {
    orderId: string;
    userId: string | undefined;
    userPhoneNumber: string | undefined;
    userFullName: string | undefined | null;
    items: InventoryItem[];
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    totalPreparationTime: number;
    totalPrice?:number;
    orderedAt?:string | undefined;
    completedAt?:string | undefined | null;
    razorpayPaymentId: string;
}

export interface AddressDetails {
    cabinName: string;
    extraInfo?: string;
    specialInstructions?: string;
  }

export interface CombinedOrder extends Order, AddressDetails {}

interface OrdersState {
    orders: Order[];
    pendingOrders: Order[];
    addressDetails: AddressDetails | null;
    loading: boolean;
    error: string | null | undefined;
}

// Initial state for orders
const initialState: OrdersState = {
    orders: [],
    pendingOrders: [],
    addressDetails: null, // Initialize as null
    loading: false,
    error: null,
};

// Async thunk to fetch orders
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async () => {
        try {
            const response = await axios.get(`${apiUrl}/orders`);
            return response.data; // Assuming the response contains the orders in the "orders" field
        } catch (error) {
            throw Error('Failed to fetch orders');
        }
    }
);

// Async thunk to fetch orders
export const fetchOrdersByUserId = createAsyncThunk(
  'orders/fetchByUserId',
  async (userId: string | undefined) => {
      try {
          const response = await axios.get(`${apiUrl}/orders/${userId}`);
          return response.data; 
      } catch (error) {
          throw Error('Failed to fetch orders');
      }
  }
);

// Async thunk to update the order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status }: { orderId: string; status: string }) => {
        try {
            const response = await axios.put(`${apiUrl}/order/${orderId}`, { status });
            return response.data.updatedOrder; // Assuming the updated order is returned
        } catch (error) {
            throw Error('Failed to update order status');
        }
    }
);

// Async thunk to fetch orders
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (order: Partial<Order>, thunkAPI) => {
    const state:any = thunkAPI.getState();
    console.log(state)
    const newOrder = {...order, ...state.orders.addressDetails}
      try {
          const response = await axios.post(`${apiUrl}/orders`, newOrder);
          return response.data; 
      } catch (error) {
          throw Error('Failed to fetch orders');
      }
  }
);

// Redux slice to manage orders
const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setAddressDetails: (state, action: PayloadAction<AddressDetails | null>) => {
            state.addressDetails = action.payload;
          },
    },
    extraReducers: (builder) => {
        builder
            // Handle fetch all orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                const ordersFiltered = action.payload.filter(e => e.status === 'pending');;
                state.pendingOrders = ordersFiltered;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Handle fetch orders by user ID
            .addCase(fetchOrdersByUserId.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrdersByUserId.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                const userOrders = action.payload;
                state.orders = userOrders; // Replace current orders with the fetched user-specific orders
                state.pendingOrders = userOrders.filter(order => order.status === 'pending'); // Filter pending orders
            })
            .addCase(fetchOrdersByUserId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Handle update order status
            .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(order => order.orderId === updatedOrder.orderId);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                    if (updatedOrder.status === 'pending') {
                        const pendingIndex = state.pendingOrders.findIndex(order => order.orderId === updatedOrder.orderId);
                        if (pendingIndex !== -1) {
                            state.pendingOrders[pendingIndex] = updatedOrder;
                        } else {
                            state.pendingOrders.push(updatedOrder);
                        }
                    } else {
                        state.pendingOrders = state.pendingOrders.filter(order => order.orderId !== updatedOrder.orderId);
                    }
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.error.message;
            })
            // Handle create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                const newOrder = action.payload;
                state.orders.push(newOrder);
                if (newOrder.status === 'pending') {
                    state.pendingOrders.push(newOrder);
                }
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create order';
            });
    },
});

export const { setAddressDetails } = ordersSlice.actions;

export default ordersSlice.reducer;