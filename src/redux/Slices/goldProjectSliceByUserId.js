import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getGoldProjectsUser = createAsyncThunk(
  "projects/fetchGoldProjects",
  async (userRole, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?._id; // Get user ID from Redux state
      let response;
      if (userRole === "Admin") {
        // Super Admin fetches all projects
        response = await axiosInstance.get("/api/projects/usergoldProject/");
      } else {
        // Other users fetch only assigned projects
        response = await axiosInstance.get(`/api/projects/gold/user/${userId}`);
      }
      console.log("Gold Projects Response:", response.data);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const goldProjectSlice = createSlice({
  name: "goldProjectsUser",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGoldProjectsUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoldProjectsUser.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getGoldProjectsUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default goldProjectSlice.reducer;
