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
            console.log("editionId", editionId);

            const response = await axiosInstance.get(`/api/suggestion/${editionId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Error fetching suggestions");
        }
    }
);

export const updateSuggestion = createAsyncThunk(
  "suggestion/update",
  async ({ suggestionId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/suggestion/by-suggestion-id/${suggestionId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating suggestion");
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

            // UPDATE
            .addCase(updateSuggestion.fulfilled, (state, action) => {
                const index = state.suggestions.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.suggestions[index] = {
                        ...state.suggestions[index],
                        ...action.payload, // merge updated fields (like isApproved or text)
                    };
                }
            })
            .addCase(updateSuggestion.rejected, (state, action) => {
                state.error = action.payload;
            })


            // DELETE
            .addCase(deleteSuggestion.fulfilled, (state, action) => {
                state.suggestions = state.suggestions.filter(s => s._id !== action.meta.arg);
            });
    },
});

export default suggestionSlice.reducer;
