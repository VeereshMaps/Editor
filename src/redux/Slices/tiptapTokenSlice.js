import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch document collaboration token
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

// Async thunk to fetch ContentAI conversion token
export const fetchContentAIToken = createAsyncThunk(
  "tiptap/fetchContentAIToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/tiptap-token-contentai");
      return response.data.token;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch ContentAI token");
    }
  }
);

const tiptapTokenSlice = createSlice({
  name: "tiptapToken",
  initialState: {
    documentToken: null,
    documentStatus: "idle",
    documentError: null,

    contentAIToken: null,
    contentAIStatus: "idle",
    contentAIError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // 🔵 Document token reducers
      .addCase(fetchTiptapToken.pending, (state) => {
        state.documentStatus = "loading";
        state.documentToken = null;
        state.documentError = null;
      })
      .addCase(fetchTiptapToken.fulfilled, (state, action) => {
        state.documentStatus = "succeeded";
        state.documentToken = action.payload;
      })
      .addCase(fetchTiptapToken.rejected, (state, action) => {
        state.documentStatus = "failed";
        state.documentError = action.payload;
      })

      // 🔵 Content AI token reducers
      .addCase(fetchContentAIToken.pending, (state) => {
        state.contentAIStatus = "loading";
        state.contentAIToken = null;
        state.contentAIError = null;
      })
      .addCase(fetchContentAIToken.fulfilled, (state, action) => {
        state.contentAIStatus = "succeeded";
        state.contentAIToken = action.payload;
      })
      .addCase(fetchContentAIToken.rejected, (state, action) => {
        state.contentAIStatus = "failed";
        state.contentAIError = action.payload;
      });
  },
});

export default tiptapTokenSlice.reducer;
