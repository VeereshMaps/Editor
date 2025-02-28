import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Typography, Divider, CardActionArea, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { AddBox } from '@mui/icons-material';
import ViewBookDetails from './bookdetails';
import EditBook from './editproject';
import Editions from './editions';
import { Navigate, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectDetailsById } from 'redux/Slices/projectDetailsByIdSlice';

const ViewBook = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const bookData = location.state?.bookData;
  const projectDetailsById = useSelector((state) => state.projectDetailsById);

  const [view, setView] = useState('bookDetails'); // State to control current view

  const [showEditForm, setShowEditForm] = useState(false);

  const getProjectDetails = async () => {
    try {
      await dispatch(getProjectDetailsById(bookData.projectId))
    } catch (error) {
      console.log("project details by id error", error);
    }
  }

  useEffect(() => {
    getProjectDetails();
  }, []);

  const handleTabChange = (event, newValue) => {
    setView(newValue); // Switch between Book Details and Editions based on tab click
  };

  const handleEditClick = () => {
    setShowEditForm(!showEditForm); // Toggle edit mode for book details
  };

  const navigate = useNavigate();

  const handlebackclick = () => {
    navigate('/projects');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Tabs for Navigation */}
      <Paper sx={{ width: '100%', padding: 1 }}>
        <Tabs value={view} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab value="bookDetails" label="Book Details" />
          <Tab value="editions" label="Editions" />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
          p: 3,
          overflowY: 'auto',
          maxHeight: '100vh',
        }}
      >
        {/* Conditional Rendering for Book Details or Editions */}
        {view === 'bookDetails' ? (
          <Box>

            {!showEditForm ? (
              <>
                <ViewBookDetails bookDetails={projectDetailsById}></ViewBookDetails>
                <Box sx={{ marginTop: 3 }}>
                  {/* <Button variant="contained" color="primary" onClick={handleEditClick}>
                    Edit
                  </Button> */}
                  <Button variant="contained" style={{ marginLeft: 10 }} color="primary" onClick={handlebackclick}>
                    Back
                  </Button>
                </Box>
              </>
            ) : (
              <EditBook setShowEditForm={setShowEditForm} bookDetails={projectDetailsById}></EditBook>

            )}
          </Box>

        ) : (
          <Editions bookDetails={projectDetailsById}/>
        )}
      </Box>
    </Box>
  );
};

export default ViewBook;
