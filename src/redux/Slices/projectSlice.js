import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (userRole, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?._id; // Get user ID from Redux state
      let response;
      console.log("userRole",userRole);
      if (userRole === "Admin") {
        // Super Admin fetches all projects
        response = await axiosInstance.get("/api/projects/");
      } else {
        // Other users fetch only assigned projects
        response = await axiosInstance.get(`/api/projects/user/${userId}`);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectsSlice.reducer;
