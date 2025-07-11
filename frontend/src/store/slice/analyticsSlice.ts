// src/store/slice/analyticsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  getUserAnalyticsData,
  getUrlAnalyticsData,
  getGeographicHeatmap,
  getDeviceAnalyticsData,
  getReferrerAnalyticsData
} from '../../api/analytics_api';
import type {
  UserAnalytics,
  UrlAnalytics,
  GeographicData,
  DeviceData,
  ReferrerData
} from '../../api/analytics_api';

interface AnalyticsState {
  userAnalytics: UserAnalytics | null;
  urlAnalytics: UrlAnalytics | null;
  geographicData: GeographicData[] | null;
  deviceData: DeviceData[] | null;
  referrerData: ReferrerData[] | null;
  loading: {
    user: boolean;
    url: boolean;
    geographic: boolean;
    device: boolean;
    referrer: boolean;
  };
  error: string | null;
}

const initialState: AnalyticsState = {
  userAnalytics: null,
  urlAnalytics: null,
  geographicData: null,
  deviceData: null,
  referrerData: null,
  loading: {
    user: false,
    url: false,
    geographic: false,
    device: false,
    referrer: false
  },
  error: null
};

// Async thunks
export const fetchUserAnalytics = createAsyncThunk(
  'analytics/fetchUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserAnalyticsData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user analytics');
    }
  }
);

export const fetchUrlAnalytics = createAsyncThunk(
  'analytics/fetchUrlAnalytics',
  async (shortUrl: string, { rejectWithValue }) => {
    try {
      const data = await getUrlAnalyticsData(shortUrl);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch URL analytics');
    }
  }
);

export const fetchGeographicData = createAsyncThunk(
  'analytics/fetchGeographicData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getGeographicHeatmap();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch geographic data');
    }
  }
);

export const fetchDeviceData = createAsyncThunk(
  'analytics/fetchDeviceData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDeviceAnalyticsData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch device data');
    }
  }
);

export const fetchReferrerData = createAsyncThunk(
  'analytics/fetchReferrerData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getReferrerAnalyticsData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch referrer data');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUrlAnalytics: (state) => {
      state.urlAnalytics = null;
    }
  },
  extraReducers: (builder) => {
    // User Analytics
    builder
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading.user = true;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading.user = false;
        state.userAnalytics = action.payload;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading.user = false;
        state.error = action.payload as string;
      })
      // URL Analytics
      .addCase(fetchUrlAnalytics.pending, (state) => {
        state.loading.url = true;
        state.error = null;
      })
      .addCase(fetchUrlAnalytics.fulfilled, (state, action) => {
        state.loading.url = false;
        state.urlAnalytics = action.payload;
      })
      .addCase(fetchUrlAnalytics.rejected, (state, action) => {
        state.loading.url = false;
        state.error = action.payload as string;
      })
      // Geographic Data
      .addCase(fetchGeographicData.pending, (state) => {
        state.loading.geographic = true;
        state.error = null;
      })
      .addCase(fetchGeographicData.fulfilled, (state, action) => {
        state.loading.geographic = false;
        state.geographicData = action.payload;
      })
      .addCase(fetchGeographicData.rejected, (state, action) => {
        state.loading.geographic = false;
        state.error = action.payload as string;
      })
      // Device Data
      .addCase(fetchDeviceData.pending, (state) => {
        state.loading.device = true;
        state.error = null;
      })
      .addCase(fetchDeviceData.fulfilled, (state, action) => {
        state.loading.device = false;
        state.deviceData = action.payload;
      })
      .addCase(fetchDeviceData.rejected, (state, action) => {
        state.loading.device = false;
        state.error = action.payload as string;
      })
      // Referrer Data
      .addCase(fetchReferrerData.pending, (state) => {
        state.loading.referrer = true;
        state.error = null;
      })
      .addCase(fetchReferrerData.fulfilled, (state, action) => {
        state.loading.referrer = false;
        state.referrerData = action.payload;
      })
      .addCase(fetchReferrerData.rejected, (state, action) => {
        state.loading.referrer = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearUrlAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;