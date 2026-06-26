import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUserRequest, logoutUserRequest, registerVendorRequest } from "../api/authApi";
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  persistAuthSession,
} from "./authStorage";

const storedSession = loadStoredAuthSession();

const initialState = {
  accessToken: storedSession.accessToken,
  user: storedSession.user,
  loginStatus: "idle",
  registerStatus: "idle",
  error: null,
  registerError: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const session = await loginUserRequest(credentials);
      persistAuthSession(session);
      return session;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed.");
    }
  },
);

export const registerVendor = createAsyncThunk(
  "auth/registerVendor",
  async (payload, { rejectWithValue }) => {
    try {
      return await registerVendorRequest(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed.");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    const accessToken = getState().auth.accessToken;

    if (!accessToken) {
      clearStoredAuthSession();
      return {
        message: "Logged out locally.",
      };
    }

    try {
      const result = await logoutUserRequest(accessToken);
      clearStoredAuthSession();
      return result;
    } catch (error) {
      clearStoredAuthSession();
      return rejectWithValue(error.message || "Logout failed.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearRegisterError(state) {
      state.registerError = null;
    },
    clearRegisterState(state) {
      state.registerStatus = "idle";
      state.registerError = null;
    },
    sessionInvalidated(state) {
      state.accessToken = null;
      state.user = null;
      state.loginStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.error = action.payload || "Login failed.";
      })
      .addCase(registerVendor.pending, (state) => {
        state.registerStatus = "loading";
        state.registerError = null;
      })
      .addCase(registerVendor.fulfilled, (state) => {
        state.registerStatus = "succeeded";
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.registerError = action.payload || "Registration failed.";
      })
      .addCase(logoutUser.pending, (state) => {
        state.loginStatus = "logging-out";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
        state.loginStatus = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.loginStatus = "idle";
        state.error = null;
      });
  },
});

export const {
  clearAuthError,
  clearRegisterError,
  clearRegisterState,
  sessionInvalidated,
} = authSlice.actions;

export default authSlice.reducer;
