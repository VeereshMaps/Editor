import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk for updating an edition
export const updateEdition = createAsyncThunk(
    "edition/updateEdition",
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/editions/${id}`, updatedData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const editionSlice = createSlice({
    name: "editionUpdate",
    initialState: {
        editions: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateEdition.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEdition.fulfilled, (state, action) => {
                state.loading = false;
                state.editions = state.editions.map((edition) =>
                    edition._id === action.payload._id ? action.payload : edition
                );
            })
            .addCase(updateEdition.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default editionSlice.reducer;
