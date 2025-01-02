import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface Notification {
  type: String;
  data: String;
  date: string;
}


// Define the state structure
export interface NotificationsState {
  notifications: Notification[];
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
};

// Create the slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Push the notification object to the notifications array
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      // Clear all notifications
      state.notifications = [];
    },
  },
});

// Export actions and reducer
export const { addNotification, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;