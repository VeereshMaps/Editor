import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// CREATE SUGGESTION
export const createSuggestion = createAsyncThunk(
  "suggestion/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/suggestion/", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error creating suggestion");
    }
  }
);

// FETCH SUGGESTIONS
export const fetchSuggestions = createAsyncThunk(
  "suggestion/fetchAll",
  async (editionId, { rejectWithValue }) => {
    try {
        console.log("editionId",editionId);
        
      const response = await axiosInstance.get(`/api/suggestion/${editionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching suggestions");
    }
  }
);

// APPROVE SUGGESTION
export const approveSuggestion = createAsyncThunk(
  "suggestion/approve",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/suggestion/${suggestionId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error approving suggestion");
    }
  }
);

// REJECT SUGGESTION
export const rejectSuggestion = createAsyncThunk(
  "suggestion/reject",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/suggestion/${suggestionId}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error rejecting suggestion");
    }
  }
);

// DELETE SUGGESTION (Soft Delete)
export const deleteSuggestion = createAsyncThunk(
  "suggestion/delete",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/suggestion/${suggestionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error deleting suggestion");
    }
  }
);

const suggestionSlice = createSlice({
  name: "suggestion",
  initialState: {
    suggestions: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createSuggestion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSuggestion.fulfilled, (state, action) => {
        state.suggestions.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(createSuggestion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // FETCH
      .addCase(fetchSuggestions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // APPROVE
      .addCase(approveSuggestion.fulfilled, (state, action) => {
        const index = state.suggestions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.suggestions[index].isApproved = true;
      })

      // REJECT
      .addCase(rejectSuggestion.fulfilled, (state, action) => {
        const index = state.suggestions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.suggestions[index].isApproved = false;
      })

      // DELETE
      .addCase(deleteSuggestion.fulfilled, (state, action) => {
        state.suggestions = state.suggestions.filter(s => s.suggestionId !== action.meta.arg);
      });
  },
});

export default suggestionSlice.reducer;
