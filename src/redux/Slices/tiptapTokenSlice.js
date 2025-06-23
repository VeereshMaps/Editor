import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch Tiptap token
export const fetchTiptapToken = createAsyncThunk(
  "tiptap/fetchToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/tiptap-token");
      return response.data.token;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Tiptap token");
    }
  }
);

const tiptapTokenSlice = createSlice({
  name: "tiptapToken",
  initialState: {
    token: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    isFetched: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiptapToken.pending, (state) => {
        state.status = "loading";
        state.token = null;
        state.error = null;
      })
      .addCase(fetchTiptapToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload;
        state.isFetched = true;
      })
      .addCase(fetchTiptapToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default tiptapTokenSlice.reducer;
