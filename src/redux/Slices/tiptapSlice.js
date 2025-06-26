import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
export const createDocument = createAsyncThunk(
  'tiptap/createDocument',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/createJSON", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Document sync failed");
    }
  }
);
export const updateDocument = createAsyncThunk(
  'tiptap/updateJSON',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch("/api/tiptap/updateJSON", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Document sync failed");
    }
  }
);
export const createDocumentFile = createAsyncThunk(
  'tiptap/createDocumentFile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/api/tiptap/createFile',
        formData
        // Don't set headers here; browser sets them correctly
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Document sync file failed');
    }
  }
);
export const updateDocumentFile = createAsyncThunk(
  'tiptap/updateFile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        '/api/tiptap/updateFile',
        formData
        // Don't set headers here; browser sets them correctly
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Document sync file failed');
    }
  }
);
export const getDocumentByEditionId = createAsyncThunk(
  'tiptap/getDocumentByEditionId',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/api/tiptap/getDocumentByEditionId',
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Document sync file failed');
    }
  }
);


/* comments api's started */

export const createThrad = createAsyncThunk(
  'tiptap/createThread',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/createThread", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "comments sync failed");
    }
  }
);
export const updateThrad = createAsyncThunk(
  'tiptap/updateThread',
  async (userData, { rejectWithValue }) => {
    // const { editionId,commentListId, content } = req.body;
    try {
      const response = await axiosInstance.post("/api/tiptap/updateThread", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "comments sync failed");
    }
  }
);
export const createcoments = createAsyncThunk(
  'tiptap/createcomment',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/createcomment", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "comments sync failed");
    }
  }
);
export const updatecoments = createAsyncThunk(
  'tiptap/updatecomment',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/updatecomment", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "comments sync failed");
    }
  }
);

export const getCommentsByEditionId = createAsyncThunk(
  'tiptap/getcomment',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/api/tiptap/getcomment',
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'comments sync file failed');
    }
  }
);

export const deleteThreads = createAsyncThunk(
  'tiptap/deleteThread',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/deleteThread", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "deleteThread sync failed");
    }
  }
);
export const deleteComments = createAsyncThunk(
  'tiptap/deleteCommentByCommentId',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/tiptap/deleteCommentByCommentId", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "deleteThread sync failed");
    }
  }
);
/* comments api's ended */