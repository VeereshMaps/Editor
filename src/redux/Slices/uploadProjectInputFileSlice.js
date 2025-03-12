import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // Adjust path to your axios setup

// Thunk to upload file for a project
export const uploadProjectFile = createAsyncThunk(
  "projects/uploadFile",
  async ({ projectId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("projectId", projectId);
      const response = await axiosInstance.post("/api/projects/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; // Assuming the API returns uploaded file info or success message
    } catch (error) {
      return rejectWithValue(error.response?.data || "File upload failed");
    }
  }
);

// Slice definition
const fileUploadSlice = createSlice({
  name: "projectInputFileUpload",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    uploadedFile: null, // Can store response if needed
  },
  reducers: {
    resetFileUpload: (state) => {
      state.status = "idle";
      state.error = null;
      state.uploadedFile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProjectFile.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.uploadedFile = null;
      })
      .addCase(uploadProjectFile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.uploadedFile = action.payload;
      })
      .addCase(uploadProjectFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetFileUpload } = fileUploadSlice.actions;
export default fileUploadSlice.reducer;
