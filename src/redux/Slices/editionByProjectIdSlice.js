import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch editions by project ID
export const getEditionsByProjectId = createAsyncThunk(
  "edition/fetchEditionsByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      console.log("Fetching editions for projectId:", projectId);
      const response = await axiosInstance.get(`/api/editions/project/${projectId}`);
      return response.data; // Expecting an array of editions
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch editions");
    }
  }
);

// Slice definition
const editionsSlice = createSlice({
  name: "editions",
  initialState: {
    editions: [],  // Renamed from 'projects' to 'editions'
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEditionsByProjectId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEditionsByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.editions = Array.isArray(action.payload) ? action.payload : []; // Store editions
      })
      .addCase(getEditionsByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.editions = []; // Reset only on failure
      });
  },
});

export default editionsSlice.reducer;
