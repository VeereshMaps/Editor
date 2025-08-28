import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Modal, Paper, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { updateVersionById } from 'redux/Slices/updateVersionSlice';
import { getGoldProjectById, getGoldProjects } from 'redux/Slices/goldProjectSlice';
import { getEditionsById } from 'redux/Slices/editionByIdSlice';

const ViewGoldBook = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const goldProjectsData = location.state?.bookData;
    const [mainTab, setMainTab] = useState(0);
    const [categories, setCategories] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ file: null, projectID: null });
    const loginDetails = useSelector((state) => state.auth);
    const goldProjectsById = useSelector((state) => state.goldProjects);
    const editionsById = useSelector((state) => state.editionsById);
    const role = loginDetails?.user?.role;
    const isAdminOrPM = role === "Admin" || role === "Project Manager";

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (location.state?.bookData?.versionId) {
                    await dispatch(getGoldProjects());
                    await dispatch(getGoldProjectById(location.state.bookData.versionId));
                }
            } finally {
                setIsLoading(false); // Done loading
            }
        };
        fetchData();
    }, [dispatch, location.state?.bookData?.versionId]);
    



    useEffect(() => {
        const versions = goldProjectsById?.selectedProject?.versions || [];
        if (versions.length > 0) {
            const groups = versions.reduce((acc, version) => {
                if (!acc[version.category]) acc[version.category] = [];
                acc[version.category].push(version);
                return acc;
            }, {});
            setGroupedData(groups);
            setCategories(Object.keys(groups));
        }
    }, [goldProjectsById?.selectedProject?.versions]);




    const handleMainTabChange = (event, newValue) => {
        setMainTab(newValue);
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({ file: null, projectID: null }); // Clear file on cancel/close
    };

    const handleFileRemove = () => {
        setFormData({ file: null });
    };

    const matchedVersion = goldProjectsById?.selectedProject?.versions?.find(
        (item) => item.category === categories[mainTab]
    );
    const fetchEditionDetails = async (editionId, dispatch) => {
        if (!editionId) return;

        try {
            await dispatch(getEditionsById(editionId));
        } catch (error) {
            console.error("Error fetching edition details:", error);
        }
    };

    // Use inside useEffect
    useEffect(() => {
        fetchEditionDetails(matchedVersion?.editionId, dispatch);
    }, [matchedVersion?.editionId]);

    const handleSubmit = async () => {
        if (!formData.file || !matchedVersion) return;

        try {
            await dispatch(updateVersionById({ versionId: matchedVersion._id, formData })).unwrap();
            handleCloseModal();
            setTimeout(() => {
                navigate('/goldprojects');
            }, 100);

            //.then(()=>{
            //     dispatch(getGoldProjectById(matchedVersion._id));
            // });

        } catch (error) {
            console.error("Updating Version Error", error);
        }


    };


    const { getRootProps, getInputProps } = useDropzone({
        accept: categories[mainTab] === "coverdesign" ? { 'image/*': [] } : { 'application/pdf': [] },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0 && matchedVersion) {
                setFormData({
                    projectID: matchedVersion._id,
                    file: acceptedFiles[0]
                });
            }
        },
        multiple: false
    });

    const currentFile = groupedData[categories[mainTab]]?.[0];


    return (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Card sx={{ p: 2, width: "100%", minHeight: "80px" }}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography variant="h6">Edition Details</Typography>
                        <Typography variant="h5">Title: {editionsById?.editions?.title}</Typography>
                        <Typography variant="body2">Publisher: {editionsById?.editions?.publisher}</Typography>
                    </Box>
                    {/* Update Button */}
                    {categories.length > 0 && isAdminOrPM && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenModal}
                            sx={{ ml: 2, whiteSpace: "nowrap" }}
                        >
                            Update {categories[mainTab]}
                        </Button>
                    )}
                </CardContent>
            </Card>
            {/* Tabs and Button in the same line */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Tabs
                    value={mainTab}
                    onChange={handleMainTabChange}
                    sx={{ borderBottom: 1, borderColor: "divider", flexGrow: 1 }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {categories.map((cat, index) => (
                        <Tab
                            key={index}
                            label={<Typography sx={{ textTransform: "capitalize" }}>{cat}</Typography>}
                        />
                    ))}
                </Tabs>


            </Box>

            {/* File Viewer */}
            <Box
                sx={{
                    flex: 1,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "500px",
                }}
            >
                    {isLoading ? (
        <CircularProgress />
    ) : currentFile?.fileStorageUrl ? (
                    // <iframe
                    //     src={groupedData[categories[mainTab]]?.[0]?.fileStorageUrl}
                    //     width="100%"
                    //     height="100%"
                    //     style={{ border: "none", minHeight: "500px" }}
                    //     title={`File - ${categories[mainTab]}`}
                    //     onError={(e) => console.error("Failed to load file:", e)}
                    //     aria-label={`Viewing file for ${categories[mainTab]}`}
                    // />
                    <iframe
                        key={groupedData[categories[mainTab]]?.[0]?._id} // or some unique value
                        src={groupedData[categories[mainTab]]?.[0]?.fileStorageUrl}
                        width="100%"
                        height="100%"
                        style={{ border: "none", minHeight: "500px" }}
                        onLoad={() => setIsLoading(false)} 
                        title={`File - ${categories[mainTab]}`}
                        onError={(e) => console.error("Failed to load file:", e)}
                        aria-label={`Viewing file for ${categories[mainTab]}`}
                    />

                ) : (
                    <Typography variant="h6" color="textSecondary">
                        No data found
                    </Typography>
                )}
            </Box>

            {/* Modal for Upload */}
            <Modal open={openModal} onClose={handleCloseModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ width: "100%", maxWidth: 500, p: 3, borderRadius: "10px" }}>
                    <Typography variant="h6" gutterBottom>Upload File for {categories[mainTab]}</Typography>

                    {/* Drag and Drop */}
                    <Box
                        {...getRootProps()}
                        sx={{
                            p: 2,
                            border: "2px dashed #ccc",
                            textAlign: "center",
                            cursor: "pointer",
                            mb: 2,
                            borderRadius: '8px'
                        }}
                    >
                        <input {...getInputProps()} />
                        {formData.file ? (
                            <Typography variant="body1">
                                Uploaded: {formData.file.name}{" "}
                                <Button color="error" size="small" onClick={handleFileRemove} sx={{ ml: 1 }}>
                                    Remove
                                </Button>
                            </Typography>
                        ) : (
                            <Typography variant="body1">Drag & Drop or Click to Upload file</Typography>
                        )}
                    </Box>

                    {/* Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!formData.file}>
                            Submit
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </Box>
    );
};

export default ViewGoldBook;
