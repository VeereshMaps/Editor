import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getEditions = createAsyncThunk(
  "edition/fetchEditions",
  async ({rejectWithValue }) => {
    try {
     const response = await axiosInstance.get("/api/editions/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const editionSlice = createSlice({
  name: "editions",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEditions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEditions.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getEditions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default editionSlice.reducer;
