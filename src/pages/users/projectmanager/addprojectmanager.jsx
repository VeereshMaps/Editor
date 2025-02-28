import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, InputAdornment, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate } from 'react-router';
import { updateUserDetailsFunc } from 'redux/Slices/updateUserSlice';
import { useDispatch } from 'react-redux';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createUserFunc } from 'redux/Slices/createUserSlice';

const AddProjectManagerForm = ({ id, authorData, onSubmit }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authorData1 = location.state?.authorData;
    const [showPassword, setShowPassword] = useState(false);
    
    // State for form fields
    const [author, setAuthor] = useState({
        firstName: authorData1?.firstName || '',
        lastName: authorData1?.firstName || '',
        email: authorData1?.email || '',
        bio: authorData1?.bio || '',
        role:"Project Manager",
        country: authorData1?.country || '',
        profilePicture: authorData1?.profilePicture || null,
        // dob: authorData1?.dob || '',
        // twitter: authorData1?.twitter || '',
        // linkedin: authorData1?.linkedin || '',
    });


    useEffect(() => {
        if (location.state && location.state.authorData) {
            const authorData = location.state.authorData;
            setAuthor({
                firstName: authorData?.firstName || '',
                lastName: authorData?.lastName || '',
                email: authorData?.email || '',
                bio: authorData?.bio || '',
                role:authorData?.role || 'Project Manager',
                country: authorData?.country || '',
                profilePicture: authorData?.profilePicture || null,
                // dob: authorData?.dob || '',
                // twitter: authorData?.twitter || '',
                // linkedin: authorData?.linkedin || '',
            });
        }
    }, [location.state]);


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAuthor((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    const onDrop = (acceptedFiles) => {
        setAuthor((prev) => ({
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
        setAuthor((prev) => ({
            ...prev,
            profilePicture: e.target.files[0]
        }));
    };

    const handleGeneratePassword = () => {
        const generatedPassword = Math.random().toString(36).slice(-8); // Generates an 8-character random password
        setAuthor((prev) => ({
            ...prev,
            password: generatedPassword
        }));
    };

    // Handle form submit
    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            if(authorData1 === null ){
                dispatch(createUserFunc(author));
            }else{
                const submitPayload = {
                    payload: author,
                    userId: authorData1.userId
                }
                await dispatch(updateUserDetailsFunc(submitPayload));
            }
            
            navigate(-1);
        } catch (error) {
            console.log("updating author failed", error);
        }
    };

    return (
        <Paper sx={{ padding: 3 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* Author Name Field */}
                    <Grid item xs={12}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={author.firstName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={author.lastName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                    </Grid>

                    {/* Email Field */}
                    <Grid item xs={12}>
                        <TextField
                            label="Email"
                            name="email"
                            value={author.email}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            type="email"
                            required
                        />
                    </Grid>
                    {authorData1 === null &&
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                name="password"
                                value={author.password}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                required
                                type={showPassword ? "text" : "password"}
                                InputLabelProps={{ shrink: true }} // Prevents label overlap
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleGeneratePassword}
                                sx={{ marginTop: 2, display: "block" }} // Ensures visibility & spacing
                            >
                                Generate Password
                            </Button>
                        </Grid>
                    }
                    {/* Bio Field */}
                    <Grid item xs={12}>
                        <TextField
                            label="Bio"
                            name="bio"
                            value={author.bio}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    </Grid>

                    {/* Date of Birth Field */}
                    {/* <Grid item xs={12}>
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              value={author.dob}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid> */}

                    {/* Country Field */}
                    <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Country</InputLabel>
                            <Select
                                label="Country"
                                name="country"
                                value={author.country}
                                onChange={handleChange}
                            >
                                <MenuItem value="USA">USA</MenuItem>
                                <MenuItem value="India">India</MenuItem>
                                <MenuItem value="UK">UK</MenuItem>
                                <MenuItem value="Australia">Australia</MenuItem>
                                {/* Add more countries as needed */}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Profile Picture Upload */}
                    <Grid item xs={12}>
                        <div {...getRootProps()} style={{
                            border: '2px dashed #1976d2',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer'
                        }}>
                            <input {...getInputProps()} />
                            <p>Drag & drop a profile picture, or click to select one</p>
                            {author.profilePicture && (
                                <p>Selected File: {author.profilePicture.name}</p>
                            )}
                        </div>
                    </Grid>

                    {/* Social Media Links */}
                    {/* <Grid item xs={12}>
            <TextField
              label="Twitter Link"
              name="twitter"
              value={author.twitter}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="LinkedIn Link"
              name="linkedin"
              value={author.linkedin}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid> */}

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            {authorData1 ? 'Save Changes' : 'Add Manager'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AddProjectManagerForm;
