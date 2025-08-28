import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch all gold projects
export const getGoldProjects = createAsyncThunk(
  "gold/getProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/gold/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Gold Projects");
    }
  }
);

// Async thunk to fetch a gold project by ID
export const getGoldProjectById = createAsyncThunk(
  "gold/getProjectById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/gold/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Gold Project by ID");
    }
  }
);

// Combined slice definition
const goldProjectsSlice = createSlice({
  name: "goldProjects",
  initialState: {
    projects: [],  // Holds all projects
    selectedProject: null, // Holds project fetched by ID
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all projects
      .addCase(getGoldProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoldProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getGoldProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch project by ID
      .addCase(getGoldProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoldProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(getGoldProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default goldProjectsSlice.reducer;
