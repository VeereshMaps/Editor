import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"; // Ensure it includes base URL

export const proofreadText = createAsyncThunk("proofread/text", async (textContent, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/api/proofread", { text: textContent, });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Proofread failed");
  }
});

const proofreadSlice = createSlice({
  name: "proofread",
  initialState: {
    suggestions: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(proofreadText.pending, (state) => {
        state.status = "loading";
        state.suggestions = null;
      })
      .addCase(proofreadText.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suggestions = action.payload;
      })
      .addCase(proofreadText.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default proofreadSlice.reducer;
