import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

import authReducer from './Slices/authSlice';
import userIdReducer from './Slices/userSlice';
import projectDetailsReducer from './Slices/projectSlice';
import projectDetailsByIdReducer from './Slices/projectDetailsByIdSlice';
import saveProjectDetailsByIdReducer from './Slices/saveProjectDetails';
import roleBasedOrAllUsersReducer from './Slices/roleBasedOrAllUserSlice';
import createProjectReducer from './Slices/createProjectSlice';
import archiveProjectsReducer from './Slices/archiveProjectSlice';
import deleteUserReducer from './Slices/deleteUserSlice';
import createUserReducer from './Slices/createUserSlice';
import editionsReducer from './Slices/editionSlice';
import editionsByIdReducer from './Slices/editionByIdSlice';
import editionsByProjectIdReducer from './Slices/editionByProjectIdSlice';
import editionUpdateReducer from './Slices/updateEditionSlice';
import versionsByIdReducer from './Slices/versionByIdSlice';
import commentsReducer from './Slices/commentSlice';
import forgotPasswordReducer from './Slices/forgotPasswordSlice';
import createAsset from './Slices/createAssetSlice';
import AssetsReducer from './Slices/assetsSlice';
import goldProjectReducer from './Slices/goldProjectSlice';
import fileUploadReducer from './Slices/uploadProjectInputFileSlice';
import versionApproveReducer from './Slices/versionApproveSlice';
import updateVersionReducer from './Slices/updateVersionSlice';
import docxParserReducer from './Slices/docxParserSlice';
import tiptapTokenReducer from './Slices/tiptapTokenSlice';
import proofreadReducer from "./Slices/proofreadSlice";
import suggestionReducer from "./Slices/suggestionSlice";
import goldEditionsByProjectId from './Slices/goldEditionByProjectIdSlice';
import getGoldProjectsUser from './Slices/goldProjectSliceByUserId';
const rootReducer = combineReducers({
  auth: authReducer,
  userDetailsById: userIdReducer,
  forgotPassword: forgotPasswordReducer,
  projects: projectDetailsReducer,
  projectDetailsById: projectDetailsByIdReducer,
  saveProjectDetailsById: saveProjectDetailsByIdReducer,
  roleBasedOrAllUsers: roleBasedOrAllUsersReducer,
  createProject: createProjectReducer,
  archiveProjects: archiveProjectsReducer,
  deleteUser: deleteUserReducer,
  createUser: createUserReducer,
  editions: editionsReducer,
  editionsById: editionsByIdReducer,
  editionsByProjectId: editionsByProjectIdReducer,
  editionUpdate: editionUpdateReducer,
  versionsById: versionsByIdReducer,
  comments: commentsReducer,
  createAsset: createAsset,
  assets: AssetsReducer,
  goldProjects: goldProjectReducer,
  projectInputFileUpload: fileUploadReducer,
  versionApprove: versionApproveReducer,
  updateVersion: updateVersionReducer,
  docxParser: docxParserReducer,
  tiptapToken: tiptapTokenReducer,
  proofread: proofreadReducer,
  suggestion: suggestionReducer,
  editionsGold: goldEditionsByProjectId,
  goldProjectsUser: getGoldProjectsUser
});

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: rootReducer,
});
