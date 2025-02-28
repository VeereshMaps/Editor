import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Typography, Divider, CardActionArea, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { AddBox } from '@mui/icons-material';

const ViewGoldBook = () => {
  const [view, setView] = useState('bookDetails'); // State to control current view
  const [showBookDetails, setShowBookDetails] = useState(true);
  const [formData, setFormData] = React.useState({
    title: '',
    subtitle: '',
    author: '',
    genre: '',
    isbn: '',
    language: '',
    releaseDate: '',
    royaltyRate: '',
    advancePayment: '',
    price: '',
    territoryRights: '',
    marketingPlan: '',
    pageCount: '',
    dimensions: '',
    paperType: '',
    coverType: '',
    copyright: '',
  });
  const [showEditForm, setShowEditForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTabChange = (event, newValue) => {
    setView(newValue); // Switch between Book Details and Editions based on tab click
  };

  const handleEditClick = () => {
    setShowEditForm(!showEditForm); // Toggle edit mode for book details
  };

  const handleAddEdition = () => {
    alert();
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

                <Grid container spacing={3}>
                  {/* Display Book Details */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Title:</strong> {formData.title || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Subtitle:</strong> {formData.subtitle || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Author(s):</strong> {formData.author || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Genre:</strong> {formData.genre || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>ISBN:</strong> {formData.isbn || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Language:</strong> {formData.language || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Release Date:</strong> {formData.releaseDate || 'Not Available'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Price:</strong> ${formData.price || 'Not Available'}</Typography>
                  </Grid>
                </Grid>

                {/* Edit Button */}
                <Box sx={{ marginTop: 3 }}>
                  <Button variant="contained" color="primary" onClick={handleEditClick}>
                    Edit
                  </Button>
                </Box>
              </>
            ) : (
              // Edit Form View

              <Box sx={{ padding: 0 }}>
                <Grid spacing={3}>
                  {/* Book Form Fields */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Title"
                      name="title"
                      fullWidth
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Subtitle"
                      name="subtitle"
                      fullWidth
                      value={formData.subtitle}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Author(s)"
                      name="author"
                      fullWidth
                      value={formData.author}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Language"
                      name="language"
                      fullWidth
                      value={formData.language}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Grid>

                {/* Save Button */}
                <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                  <Button variant="contained" color="primary" onClick={handleEditClick}>
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

        ) : (
          <Grid container spacing={2} alignItems="stretch">
            {/* Add New Edition Card */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardActionArea onClick={handleAddEdition}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <AddBox fontSize="large" color="secondary" />
                    <Typography variant="body2" sx={{ marginTop: 1 }}>Add New Edition</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Edition Cards */}
            {[1, 2, 3, 4, 5].map((edition, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ padding: 2, flexGrow: 1 }}>
                    <Typography variant="h6">Edition {edition}</Typography>
                    <Typography variant="body2">Some details about Edition {edition}</Typography>
                  </CardContent>
                  {/* Buttons Section */}
                  <Stack direction="row" spacing={1} sx={{ padding: 2, justifyContent: 'flex-start' }}>
                    <Button variant="outlined" color="primary" size="small" onClick={() => handleEdit(edition)}>Edit</Button>
                    <Button variant="outlined" color="primary" size="small" onClick={() => handleView(edition)}>View</Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>



        )}
      </Box>
    </Box>
  );
};

export default ViewGoldBook;
