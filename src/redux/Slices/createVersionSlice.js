import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to create a version
export const createVersion = createAsyncThunk(
  "version/createVersion",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/versions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

const newVersionSlice = createSlice({
  name: "createVersion",
  initialState: {
    version: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearVersionState: (state) => {
      state.version = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVersion.fulfilled, (state, action) => {
        state.loading = false;
        state.version = action.payload;
      })
      .addCase(createVersion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVersionState } = newVersionSlice.actions;
export default newVersionSlice.reducer;
