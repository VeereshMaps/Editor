import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Typography, Divider, CardActionArea, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { AddBox } from '@mui/icons-material';
import ViewBookDetails from './bookdetails';
import { useDispatch } from 'react-redux';
import { saveProjectDetailsFunc } from 'redux/Slices/saveProjectDetails';

const EditBook = ({ setShowEditForm, bookDetails }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "",
    // subtitle: '',
    author: {
      _id: "", // Ensure ID is included
      firstName: "",
    },
    // genre: '',
    // isbn: '',
    originLanguage: "",
    // releaseDate: '',
    // royaltyRate: '',
    // advancePayment: '',
    // price: '',
    // territoryRights: '',
    // marketingPlan: '',
    // pageCount: '',
    // dimensions: '',
    // paperType: '',
    // coverType: '',
    // copyright: '',
  });

  useEffect(() => {
    if (bookDetails?.projects) {
      setFormData({
        title: bookDetails.projects?.title || "",
        author: {
          _id: bookDetails.projects?.author?._id || "",
          firstName: bookDetails.projects?.author?.firstName || "",
        },
        originLanguage: bookDetails.projects?.originLanguage || "",
      });
    }
  }, [bookDetails]); // Runs when bookDetails changes

  const handleFormSubmit = async () => {
    const updateProjectDetailPayload = {
      userId: bookDetails.projects._id,
      payload: formData
    }
    try {
      await dispatch(saveProjectDetailsFunc(updateProjectDetailPayload));
      setShowEditForm(false);
    } catch (error) {
      console.log("Unable to Save Book Details", error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "author"
        ? { ...prevFormData.author, firstName: value } // Only update author name
        : value,
    }));
  };
  

  return (
    <Box sx={{ padding: 0 }}>

      <Grid container spacing={2}>
        {/* Book Form Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={formData.title || ""}
            onChange={handleChange}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <TextField
            label="Subtitle"
            name="subtitle"
            fullWidth
            value={formData.subtitle}
            onChange={handleChange}
          />
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Author(s)"
            name="author"
            fullWidth
            value={formData.author.firstName}
            onChange={handleChange}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select
              label="Genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
            >
              <MenuItem value="fiction">Fiction</MenuItem>
              <MenuItem value="non-fiction">Non-Fiction</MenuItem>
              <MenuItem value="fantasy">Fantasy</MenuItem>
              <MenuItem value="thriller">Thriller</MenuItem>
              <MenuItem value="science-fiction">Science Fiction</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="ISBN"
            name="isbn"
            fullWidth
            value={formData.isbn}
            onChange={handleChange}
          />
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Language"
            name="originLanguage"
            fullWidth
            value={formData.originLanguage}
            onChange={handleChange}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <TextField
            label="Release Date"
            name="releaseDate"
            fullWidth
            value={formData.releaseDate}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Price"
            name="price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleChange}
          />
        </Grid> */}
      </Grid>

      {/* Save Button */}
      <Grid container spacing={2} sx={{ marginTop: 1 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>
            Save
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={() => {
            // alert()
            setShowEditForm(false)
          }} variant="contained" color="primary">
            Back
          </Button>
        </Grid>
      </Grid>
    </Box>





  );
};

export default EditBook;
