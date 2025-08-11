import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk to fetch gold editions by projectId
export const getGoldEditionsByProjectId = createAsyncThunk(
  "editions/getGoldEditionsByProjectId",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/editions/goldEdition/${projectId}`);
      console.log("response", response.data);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch editions");
    }
  }
);

// Slice definition
const editionsGoldSlice = createSlice({
  name: "editionsGold",
  initialState: {
    editions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGoldEditionsByProjectId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoldEditionsByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.editions = action.payload; 
      })
      .addCase(getGoldEditionsByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.editions = [];
      });
  },
});

export default editionsGoldSlice.reducer;
