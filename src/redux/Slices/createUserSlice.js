import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to create users
export const createUserFunc = createAsyncThunk(
    "user/createUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/users", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Error creating user");
        }
    }
);

// Slice definition
const createUserSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        status: "idle", // 'idle' | 'success' | 'failed'
        error: null,
    },
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(createUserFunc.pending, (state) => {
                state.user = null;
                state.status = "loading";
                state.error = null;
            })
            .addCase(createUserFunc.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.status = "success";
                state.error = null;
            })
            .addCase(createUserFunc.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default createUserSlice.reducer;
