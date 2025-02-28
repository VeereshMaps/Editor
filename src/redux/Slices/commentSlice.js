import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to create a comment
export const createComment = createAsyncThunk(
    "comments/createComment",
    async (commentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/comments", commentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Async thunk to fetch comments by versionId
export const fetchCommentsByVersionId = createAsyncThunk(
    "comments/fetchCommentsByVersionId",
    async (versionId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/comments/${versionId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        comments: [],
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createComment.pending, (state) => {
                state.status="loading",
                state.error = null;
                state.comments = [];
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.status="success",
                state.comments.push(action.payload);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.status="failed",
                state.error = action.payload;
            })
            .addCase(fetchCommentsByVersionId.pending, (state) => {
                state.status="loading",
                state.error = null;
                state.comments = [];
            })
            .addCase(fetchCommentsByVersionId.fulfilled, (state, action) => {
                state.status="success",
                state.comments = action.payload;
            })
            .addCase(fetchCommentsByVersionId.rejected, (state, action) => {
                state.status="failed",
                state.error = action.payload;
            });
    },
});

export default commentsSlice.reducer;
