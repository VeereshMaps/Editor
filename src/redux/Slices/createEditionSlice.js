import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const createEditionFunc = createAsyncThunk(
  "editions/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/editions/`,payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create new edition");
    }
  }
);

// Slice definition
const createNewEditionSlice = createSlice({
  name: "createNewEdition",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createEditionFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(createEditionFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createEditionFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default createNewEditionSlice.reducer;
