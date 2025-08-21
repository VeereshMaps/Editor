import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Grid,
    Paper,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { updateUserDetailsFunc } from 'redux/Slices/updateUserSlice';
import { createUserFunc } from 'redux/Slices/createUserSlice';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import Notification from "../../../components/Notification";
import countries from 'utils/countries';
import AlertService from 'utils/AlertService';

const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    role: Yup.string().required('Role is required'),
    country: Yup.string().required('Country is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters')
});

const AddTeamMember = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const authorData1 = location.state?.authorData || null;
    // const [notification, setNotification] = useState({ open: false, message: "", severity: "idle" });

    // useEffect(() => {
    //     if (!notification.open && notification.severity === "success") {
    //         setDisableButton(false);
    //         navigate(-1);  // Navigate back after the notification is closed
    //     }
    // }, [notification.open]);

    const formik = useFormik({
        initialValues: {
            firstName: authorData1?.firstName || '',
            lastName: authorData1?.lastName || '',
            email: authorData1?.email || '',
            bio: authorData1?.bio || '',
            role: authorData1?.role || '',
            country: authorData1?.country || '',
            profilePicture: authorData1?.profilePicture || null,
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setDisableButton(true);
            try {
                let result;
                if (!authorData1) {
                    result = await dispatch(createUserFunc(values));
                } else {
                    const submitPayload = { payload: values, userId: authorData1.userId };
                    result = await dispatch(updateUserDetailsFunc(submitPayload));
                }

                if (result?.error) {
                    const errorMessage = result.payload || "Something went wrong";
                    throw new Error(errorMessage);
                }

                AlertService.success(authorData1 ? "User updated successfully" : "User created successfully");
                navigate(-1);
            } catch (error) {
                console.error("Error submitting user form:", error);

                // 🟡 Specific error handling for duplicate email
                if (error.message === "A user with this email already exists.") {
                    formik.setFieldError("email", "A user with this email already exists.");
                    AlertService.error("A user with this email already exists.");
                } else {
                    AlertService.error("Failed to save user");
                }
            } finally {
                setDisableButton(false);
            }
        }

    });

    const onDrop = (acceptedFiles) => {
        formik.setFieldValue('profilePicture', acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const handleGeneratePassword = () => {
        const generatedPassword = Math.random().toString(36).slice(-8);
        formik.setFieldValue('password', generatedPassword);
    };

    // const handleCloseNotification = () => {
    //     setNotification({ ...notification, open: false });
    // };
    const back = () => {
        const navigate = useNavigate();
        return () => {
            navigate('/users/pr');
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
                                {...formik.getFieldProps('firstName')}
                                fullWidth
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Last Name"
                                name="lastName"
                                {...formik.getFieldProps('lastName')}
                                fullWidth
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Email"
                                name="email"
                                {...formik.getFieldProps('email')}
                                fullWidth
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Grid>

                        {/* {!authorData1 && ( */}
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                {...formik.getFieldProps('password')}
                                fullWidth
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button variant="outlined" onClick={handleGeneratePassword} sx={{ mt: 2 }}>
                                Generate Password
                            </Button>
                        </Grid>
                        {/* )} */}

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Country</InputLabel>
                                {/* <Select name="country" {...formik.getFieldProps('country')}>
                                    <MenuItem value="USA">USA</MenuItem>
                                    <MenuItem value="India">India</MenuItem>
                                    <MenuItem value="UK">UK</MenuItem>
                                    <MenuItem value="Australia">Australia</MenuItem>
                                </Select> */}
                                <Select
                                    name="country"
                                    {...formik.getFieldProps('country')}
                                    error={formik.touched.country && Boolean(formik.errors.country)}
                                >
                                    {countries.map((country) => (
                                        <MenuItem key={country} value={country}>
                                            {country}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select name="role" {...formik.getFieldProps('role')}>
                                    <MenuItem value="editor">Editor</MenuItem>
                                    <MenuItem value="designer">Cover Designer</MenuItem>
                                    <MenuItem value="proofReader">Proof Reader</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <div {...getRootProps()} style={{ border: '2px dashed #1976d2', padding: 20, textAlign: 'center' }}>
                                <input {...getInputProps()} />
                                <p>Drag & drop a profile picture, or click to select one</p>
                                {formik.values.profilePicture && <p>Selected File: {formik.values.profilePicture.name}</p>}
                            </div>
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" disabled={disableButton} fullWidth>
                                {authorData1 ? 'Save Changes' : 'Add Team Member'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                {/* <Notification
                    open={notification.open}
                    onClose={handleCloseNotification}
                    message={notification.message}
                    severity={notification.severity}
                /> */}
            </Paper></>
    );
};

export default AddTeamMember;
