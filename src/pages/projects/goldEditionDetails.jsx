import React, { useEffect, useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Paper,
    Button,
} from '@mui/material';
import ViewBookDetails from './bookdetails';
import GoldEditions from './goldEditions';
import { useNavigate, useParams } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectDetailsById } from 'redux/Slices/projectDetailsByIdSlice';

const GoldEditionDetails = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const bookData = location.state?.bookData;
    const projectDetailsById = useSelector((state) => state.projectDetailsById);
    const [view, setView] = useState('bookDetails');

    const { projectId } = useParams(); // Still included in case GoldEditions uses it internally

    useEffect(() => {
        getProjectDetails(projectId);
        if (bookData?.projectId) {
            dispatch(getProjectDetailsById(bookData.projectId));
        }
    }, [bookData, dispatch]);

    const handleTabChange = (_, newValue) => {
        setView(newValue);
    };

    const handleBackClick = () => {
        navigate('/goldprojects');
    };
    const getProjectDetails = async (id) => {
        try {
            await dispatch(getProjectDetailsById(id))
        } catch (error) {
            console.log("project details by id error", error);
        }
    }
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Paper sx={{ width: '100%', padding: 1 }}>
                <Tabs
                    value={view}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab value="bookDetails" label="Book Details" />
                    <Tab value="editions" label="Editions" />
                </Tabs>
            </Paper>

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
                {view === 'bookDetails' ? (
                    <>
                        <ViewBookDetails bookDetails={projectDetailsById} />
                        <Box sx={{ marginTop: 3 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBackClick}
                                sx={{ ml: 1 }}
                            >
                                Back
                            </Button>
                        </Box>
                    </>
                ) : (
                    <GoldEditions />
                )}
            </Box>
        </Box>
    );
};

export default GoldEditionDetails;
