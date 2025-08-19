import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, InputAdornment, TextareaAutosize } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate } from 'react-router';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowBack } from '@mui/icons-material';
const AddProjectForm = ({ id, Data, onSubmit }) => {
  const location = useLocation();
  const bookData = location.state?.bookData;

  // State for form fields
  const [project, setProject] = useState({
    title: bookData?.title || '',
    author: bookData?.author || '',
    genre: bookData?.genre || '',
    publicationDate: bookData?.publicationDate || '',
    teamlead: bookData?.teamlead || '',
    projectmanager: bookData?.projectmanager || '',
    description: bookData?.description || '',
  });


  useEffect(() => {
    if (location.state && location.state.bookData) {
      const bookData = location.state.bookData;
      setProject({
        title: bookData?.title || '',
        author: bookData?.author || '',
        genre: bookData?.genre || '',
        publicationDate: bookData?.publicationDate || '',
        teamlead: bookData?.teamlead || '',
        projectmanager: bookData?.projectmanager || '',
        description: bookData?.description || '',
      });
    }
  }, [location.state]);


  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const onDrop = (acceptedFiles) => {
    setProject((prev) => ({
      ...prev,
      profilePicture: acceptedFiles[0]  // Store the first uploaded file
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',  // Only accept image files
    multiple: false,    // Only one file at a time
  });

  // Handle file change (Profile picture)
  const handleFileChange = (e) => {
    setProject((prev) => ({
      ...prev,
      profilePicture: e.target.files[0]
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(author);  // Call parent onSubmit handler with form data
  };

  const back = () => {
    const navigate = useNavigate();
    return () => {
        navigate('/goldprojects');
    };
};
  return (
    <>
    <Button title='back to previous' onClick={back()} startIcon={<ArrowBack style={{ fontSize: 25 }} />}>
    </Button>
    <Paper sx={{ padding: 3 }} className='max_height_form'>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Author Name Field */}
          <Grid item xs={12}>
            <TextField
              label="Project Name"
              name="title"
              value={project.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Author Name</InputLabel>
              <Select
                name="author"
                value={project.author}
                onChange={handleChange}
              >
                <MenuItem value="Smith">Smith</MenuItem>
                <MenuItem value="Johnson">Johnson</MenuItem>
                <MenuItem value="Brown">Brown</MenuItem>
                <MenuItem value="Williams">Williams</MenuItem>
                <MenuItem value="Jones">Jones</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Publication Date" />
              </LocalizationProvider>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Genre</InputLabel>
              <Select
                name="genre"
                value={project.genre}
                onChange={handleChange}
              >
                <MenuItem value="Fiction">Fiction</MenuItem>
                <MenuItem value="nonfiction">Non-Fiction                </MenuItem>
                <MenuItem value="Publishing">Publishing</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Project Manager</InputLabel>
              <Select
                name="lname"
                value={project.projectmanager}
                onChange={handleChange}
              >
                <MenuItem value="Smith">Smith</MenuItem>
                <MenuItem value="Johnson">Johnson</MenuItem>
                <MenuItem value="Brown">Brown</MenuItem>
                <MenuItem value="Williams">Williams</MenuItem>
                <MenuItem value="Jones">Jones</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Team Lead</InputLabel>
              <Select
                name="lname"
                value={project.teamlead}
                onChange={handleChange}
              >
                <MenuItem value="Smith">Smith</MenuItem>
                <MenuItem value="Johnson">Johnson</MenuItem>
                <MenuItem value="Brown">Brown</MenuItem>
                <MenuItem value="Williams">Williams</MenuItem>
                <MenuItem value="Jones">Jones</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={project.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              multiline
              rows={4}
            />
          </Grid>
          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              {id ? 'Save Changes' : 'Add Book/Project'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
    </>
  );
};

export default AddProjectForm;
