// redux/slices/docxParserSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk to upload DOCX file and get parsed content
export const uploadDocxFile = createAsyncThunk(
  "docx/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/selfPublish/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data; // Expecting parsed JSON structure
    } catch (error) {
      return rejectWithValue(error.response?.data || "Upload failed");
    }
  }
);

const docxParserSlice = createSlice({
  name: "docxParser",
  initialState: {
    status: "idle",
    error: null,
    parsedData: null,
  },
  reducers: {
    resetDocxUpload: (state) => {
      state.status = "idle";
      state.error = null;
      state.parsedData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocxFile.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.parsedData = null;
      })
      .addCase(uploadDocxFile.fulfilled, (state, action) => {
        state.status = "success";
        state.parsedData = action.payload;
      })
      .addCase(uploadDocxFile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetDocxUpload } = docxParserSlice.actions;
export default docxParserSlice.reducer;
