import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../../Layout';

export interface User {
    firstName: string;
    lastName: string;
    phone: string;
}

export interface AuthState {
    firstName: string | null;
    lastName: string | null;
    phone: string;
    token: string | null;
    isLoggedIn: boolean;
    otp: string | null;
    otpExpiresAt: string | null; // ISO string for OTP expiration time
    loading: boolean;
    error:boolean;
}

const initialState: AuthState = {
    firstName: null,
    lastName: null,
    phone: "",
    token: null,
    isLoggedIn: false,
    otp: null,
    otpExpiresAt: null,
    loading: false,
    error: false
};

// Thunk to handle user signup
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (
        payload: { firstName: string; lastName: string; phone: string; otp: string; otpExpiresAt: string },
        thunkAPI
    ) => {
        try {
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to sign up');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to sign up');
        }
    }
);

// Thunk to handle user login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (payload: { phone: string; otp: string }, thunkAPI) => {
        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to login');
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to login');
        }
    }
);

export const logoutUser = createAsyncThunk<void, string>(
    'auth/logoutUser',
    async (phone: string, thunkAPI) => {
        try {
            await axios.post(`${apiUrl}/auth/logout`, { phone });
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to log out');
        }
    }
);


export const getIsLoggedInStatus = createAsyncThunk(
    'auth/getIsLoggedInStatus',
    async (_, thunkAPI) => {
        const state:any = thunkAPI.getState()
        const {phone} = state.auth
        try {
            const response = await axios.get(`${apiUrl}/auth/status/${phone}`);
            console.log(response.data)
            return response.data.isLoggedIn; // Assuming the API returns an object with the isLoggedIn field
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue('Failed to fetch login status');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        login: (
            state,
            action: PayloadAction<{ firstName: string;token: string; lastName: string; phone: string; otp: string; otpExpiresAt: string; isLoggedIn: boolean }>
        ) => {
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.phone = action.payload.phone;
            state.otp = action.payload.otp;
            state.otpExpiresAt = action.payload.otpExpiresAt;
            state.token = action.payload.token;
            state.isLoggedIn = action.payload.isLoggedIn;
        },
    },
    extraReducers: (builder) => {
        builder
            // Signup logic
            .addCase(signupUser.pending, () => {
                // Optionally handle loading state for signup
            })
            .addCase(
                signupUser.fulfilled,
                (state, action: PayloadAction<{ firstName: string; lastName: string; phone: string; otp: string; otpExpiresAt: string }>) => {
                    state.firstName = action.payload.firstName;
                    state.lastName = action.payload.lastName;
                    state.phone = action.payload.phone;
                    state.otp = action.payload.otp;
                    state.otpExpiresAt = action.payload.otpExpiresAt;
                }
            )
            .addCase(signupUser.rejected, (state, action) => {
                console.error(action.payload || 'Error during signup');
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.otp = null;
                state.otpExpiresAt = null;
            })

            // Login logic
            .addCase(loginUser.pending, () => {
                // Optionally handle loading state for login
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.firstName = action.payload.user.firstName;
                state.lastName = action.payload.user.lastName;
                state.phone = action.payload.user.phone;
                state.token = action.payload.token;
                state.isLoggedIn = true;
                state.otp = null;
                state.otpExpiresAt = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.error(action.payload || 'Error during login');
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.token = null;
                state.isLoggedIn = false;
            })

            // Logout logic
            .addCase(logoutUser.pending, () => {
                // Optionally handle loading state for logout
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.firstName = null;
                state.lastName = null;
                state.phone = "";
                state.isLoggedIn = false;
                state.otp = null;
                state.otpExpiresAt = null;
            })
            .addCase(logoutUser.rejected, (_state, action) => {
                console.error(action.payload || 'Error during logout');
            })
            .addCase(getIsLoggedInStatus.pending, () => {
                
            })
            .addCase(getIsLoggedInStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.isLoggedIn = action.payload;
            })
            .addCase(getIsLoggedInStatus.rejected, (state) => {
                 state.isLoggedIn = false;
            })
    },
});

export const {  setToken, login } = authSlice.actions;
export default authSlice.reducer;