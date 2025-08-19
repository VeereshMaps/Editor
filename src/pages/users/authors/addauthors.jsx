import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, InputAdornment, IconButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate } from 'react-router';
import { updateUserDetailsFunc } from 'redux/Slices/updateUserSlice';
import { useDispatch } from 'react-redux';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { createUserFunc } from 'redux/Slices/createUserSlice';
import Notification from "../../../components/Notification";
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').when("isNewUser", {
        is: true, // Apply validation only if isNewUser is true
        then: (schema) => schema.required('Password is required'),
        otherwise: (schema) => schema.notRequired()
    }),
    bio: yup.string().required('Bio is required'),
    country: yup.string().required('Country is required'),
});

const AddAuthorForm = ({ id, onSubmit }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const authorData1 = location.state?.authorData || null;
    const [notification, setNotification] = useState({ open: false, message: "", severity: "idle" });

    useEffect(() => {
        if (!notification.open && notification.severity === "success") {
            setDisableButton(false);
            navigate(-1);  // Navigate back after the notification is closed
        }
    }, [notification.open]);

    const formik = useFormik({
        initialValues: {
            firstName: authorData1?.firstName || '',
            lastName: authorData1?.lastName || '',
            email: authorData1?.email || '',
            bio: authorData1?.bio || '',
            role: "author",
            country: authorData1?.country || '',
            password: authorData1?.password || '',
            profilePicture: authorData1?.profilePicture || null,
        },
        validationSchema,
        context: { isNewUser: !authorData1 },
        onSubmit: async (values) => {
            setDisableButton(true);
            try {
                const submitPayload = {
                    payload: values,
                    userId: authorData1?.userId
                };
                if (authorData1) {
                    const updatedUserResponse = await dispatch(updateUserDetailsFunc(submitPayload));
                    setNotification({ open: true, message: updatedUserResponse?.payload?.message, severity: "success" });
                } else {
                    const createdUserResponse = await dispatch(createUserFunc(values));
                    setNotification({ open: true, message: createdUserResponse?.payload?.message, severity: "success" });

                }
            } catch (error) {
                console.error("Updating author failed", error);
            }
        },
    });

    const handleGeneratePassword = () => {
        const generatedPassword = Math.random().toString(36).slice(-8);
        formik.setFieldValue('password', generatedPassword);
    };

    const onDrop = (acceptedFiles) => {
        formik.setFieldValue('profilePicture', acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false,
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };
    const back = () => {
        const navigate = useNavigate();
        return () => {
            navigate('/users/authors');
        };
    };


    return (
        <>
            <Button title='back to previous' onClick={back()} startIcon={<ArrowBack style={{ fontSize: 25 }} />}>
            </Button>
            <Paper sx={{ padding: 3 }} className='max_height_form'>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="First Name"
                                name="firstName"
                                fullWidth
                                margin="normal"
                                {...formik.getFieldProps('firstName')}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Last Name"
                                name="lastName"
                                fullWidth
                                margin="normal"
                                {...formik.getFieldProps('lastName')}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                fullWidth
                                margin="normal"
                                {...formik.getFieldProps('email')}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>
                        {!authorData1 && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Password"
                                    name="password"
                                    fullWidth
                                    margin="normal"
                                    type={showPassword ? "text" : "password"}
                                    {...formik.getFieldProps('password')}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button variant="outlined" color="primary" onClick={handleGeneratePassword} sx={{ marginTop: 2 }}>Generate Password</Button>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Bio"
                                name="bio"
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                {...formik.getFieldProps('bio')}
                                error={formik.touched.bio && Boolean(formik.errors.bio)}
                                helperText={formik.touched.bio && formik.errors.bio}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Country</InputLabel>
                                <Select
                                    name="country"
                                    {...formik.getFieldProps('country')}
                                    error={formik.touched.country && Boolean(formik.errors.country)}
                                >
                                    <MenuItem value="USA">USA</MenuItem>
                                    <MenuItem value="India">India</MenuItem>
                                    <MenuItem value="UK">UK</MenuItem>
                                    <MenuItem value="Australia">Australia</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <div {...getRootProps()} style={{ border: '2px dashed #1976d2', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                                <input {...getInputProps()} />
                                <p>Drag & drop a profile picture, or click to select one</p>
                                {formik.values.profilePicture && <p>Selected File: {formik.values.profilePicture.name}</p>}
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" disabled={disableButton} variant="contained" color="primary" fullWidth>{authorData1 ? 'Save Changes' : 'Add Author'}</Button>
                        </Grid>
                    </Grid>
                </form>
                <Notification
                    open={notification.open}
                    onClose={handleCloseNotification}
                    message={notification.message}
                    severity={notification.severity}
                />
            </Paper>
        </>
    );
};

export default AddAuthorForm;
