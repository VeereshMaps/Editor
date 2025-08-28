import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to update version
export const updateVersionById = createAsyncThunk(
  "edition/version/updateVersionById",
  async ({ versionId, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/versions/${versionId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update version");
    }
  }
);

// Slice definition
const updateVersionSlice = createSlice({
  name: "updateVersion",
  initialState: {
    updatedVersion: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearUpdateVersionState: (state) => {
      state.updatedVersion = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateVersionById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateVersionById.fulfilled, (state, action) => {
        state.status = "success";
        state.updatedVersion = action.payload.data; // Assuming response has { message, data }
      })
      .addCase(updateVersionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.updatedVersion = null; // Reset on error
      });
  },
});

export const { clearUpdateVersionState } = updateVersionSlice.actions;

export default updateVersionSlice.reducer;
