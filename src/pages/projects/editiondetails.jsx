import React, { useEffect, useState, useRef } from "react";
import { Box, Tabs, Tab, Typography, Card, CardContent, Button, TextField, Paper, Stack, IconButton, List, ListItem, ListItemText, Divider, Modal } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import { Rnd } from "react-rnd"; // Import react-rnd
import { CommentOutlined } from "@ant-design/icons";
import { CommentBankOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { clearVersionState, createVersion } from "redux/Slices/createVersionSlice";
import { getVersionsById } from "redux/Slices/versionByIdSlice";
import { createComment, fetchCommentsByVersionId } from "redux/Slices/commentSlice";
import moment from "moment-timezone";
import { uploadProjectFile } from "redux/Slices/uploadProjectInputFileSlice";
// import { approveVersionById } from "redux/Slices/versionApproveSlice";
import { getProjectDetailsById } from "redux/Slices/projectDetailsByIdSlice";
import { getEditionsById } from "redux/Slices/editionByIdSlice";
import Notification from "../../components/Notification";
import CollabEditor from "components/CollabEditor";
import { fetchContentAIToken, fetchTiptapToken } from "redux/Slices/tiptapTokenSlice";
import TiptapEditor from "components/TiptabEditor";
import ProofReaderEditorProvider from "components/ProofReader";

const EditionDetails = () => {
    const dispatch = useDispatch();
    const { editionId, projectId } = useParams();
    const fileInputRef = useRef(null);
    const [mainTab, setMainTab] = useState(0);
    const [subTab, setSubTab] = useState(0);
    const [approvedCategories, setApprovedCategories] = useState({});
    const [chatOpen, setChatOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [inputFiles, setInputFiles] = useState([]);
    const [openInputModal, setOpenInputModal] = useState(false);
    const [chatMessage, setChatMessage] = useState("");
    const [chatname, setChatname] = useState();
    const [submitAvailable, setSubmitAvailable] = useState(true);
    const loginDetails = useSelector((state) => state.auth);
    const versionDetails = useSelector((state) => state.versionsById);
    const commentDetails = useSelector((state) => state.comments);
    const editionDetailsById = useSelector((state) => state.editionsById);
    const projectDetailsById = useSelector((state) => state.projectDetailsById);
    const [tabData, setTabData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [subTabArray, setSubTabArray] = useState([]);
    
    const editionsById = useSelector((state) => state.editionsById);
    
    const role = loginDetails?.user?.role;
    
    const categoryRoleMap = {
        editorial: "editor",
        coverdesign: "designer",
        TypeSetting: "proofReader",
    };
    
    // , "coverdesign", "TypeSetting"
    const isAdminOrPM = role === "Admin" || role === "Project Manager" || role === "author";
    const isProofReader = role === "proofReader" || role === "editor";
    const fixedTabs = [
        "Inputs",
        "editor",
        ...((editionsById?.editions?.isAuthorApproved === true &&isProofReader) ? ["Proof Read"] : []),
    ];
    const mainTabs = fixedTabs; // Ensure it’s always an array
    const selectedCategory = mainTabs[mainTab] || ""; // Avoid undefined index errors
    const pdfLinks = selectedCategory ? tabData[selectedCategory] : []; // Ensure it's always an array
    const [chatHistory, setChatHistory] = useState([]);
    const [notification, setNotification] = useState({ open: false, message: "", severity: "idle" });
    const [selectedFile, setSelectedFile] = useState(null);
    const currentUserName = `${loginDetails?.user.firstName} ${loginDetails?.user.lastName}`;


    const [formData, setFormData] = useState({
        projectID: projectId,
        versionName: "",
        category: selectedCategory,
        remarks: "",
        file: null,
        editionId: editionId,
        createdBy: loginDetails?.user?._id,
    });


   
    const canShowButton =
        (
            isAdminOrPM ||
            categoryRoleMap[selectedCategory] === role
        )

    useEffect(() => {
        if (tabData[selectedCategory]) {
            setSubTabArray(Object.keys(tabData[selectedCategory]));
        } else {
            setSubTabArray([]);
        }
    }, [tabData, selectedCategory]);

    useEffect(() => {
        if (!notification.open && notification.severity === "success") {
            handleInputCloseModal();
            setOpenModal(false);
        }
    }, [notification.open]);


    useEffect(() => {
        getProjectDetails(projectId);
        // getVersionDetails(editionId);
        dispatch(getEditionsById(editionId));
    }, [editionId, projectId]);

    const handleMainTabChange = (_, newValue) => {
        setMainTab(newValue);
        setSubTab(0); // Reset version tab when switching main tabs
    };

    const handleSubTabChange = (_, newValue) => {
        setSubTab(newValue);
    };

    useEffect(() => {
        if (!openModal) {
            setSubmitAvailable(false);
        }
    }, [openModal])

    useEffect(() => {
        dispatch(fetchTiptapToken());
        dispatch(fetchContentAIToken());
    }, []);

    useEffect(() => {
        const filesArr = { Inputs: [] }
        projectDetailsById && projectDetailsById?.projects?.files?.forEach(file => {
            filesArr["Inputs"].push({ filePath: file }); // or { url: file }, whatever key you need
        });
        setTabData(prevData => ({ ...prevData, ...filesArr }));
    }, [projectDetailsById]);

    const getVersionDetails = async (id) => {
        try {
            dispatch(getVersionsById(id))
        } catch (error) {
            console.log("Error while getting version details", error);
        }
    }

    useEffect(() => {
        if (versionDetails.status === "success") {
            const approved = versionDetails?.versions?.reduce((acc, item) => {
                const hasApprovedItem = item.isApproved;
                if (hasApprovedItem) {
                    acc[item.category] = true;
                }
                return acc;
            }, {});

            setApprovedCategories(approved);


            const categorizedData = { editorial: [], coverdesign: [], TypeSetting: [] };
            versionDetails?.versions?.forEach(version => {
                if (categorizedData[version.category]) {
                    categorizedData[version.category].push({ ...version });
                }
            });

            setTabData(prevData => ({ ...prevData, ...categorizedData }));
        }
    }, [versionDetails]);



    useEffect(() => {
        if (commentDetails.status === "success") {
            const formattedChatHistory = commentDetails.comments.map((comment) => ({
                username: `${comment?.userId?.firstName} ${comment?.userId?.lastName}`,
                message: comment.message,
                timestamp: formatChatTimestamp(comment.createdAt),
                fileUrl: comment.fileUrl || null, // Add this
            }));
            setChatHistory(formattedChatHistory);
        }
    }, [commentDetails]);




    useEffect(() => {
        // Clear state when component unmounts
        return () => {
            dispatch(clearVersionState());
        };
    }, [dispatch]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, category: selectedCategory }));
    }, [selectedCategory]);

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleCreateNewVersion = () => {
        setOpenModal(true);
        setFormData({
            projectID: projectId,
            versionName: "",
            category: selectedCategory,
            remarks: "",
            file: null,
            editionId: editionId,
            createdBy: loginDetails?.user?._id,
        });
        // Handle creating a new version
    };
    const handleCloseModal = () => {
        setOpenModal(false)
        // Handle creating a new version
    };
    const handleFileInputs = async () => {
        setOpenInputModal(true);
        // fileInputRef.current.click(); // Programmatically open file dialog
    }
    const handleInputCloseModal = () => {
        setOpenInputModal(false)
        // Handle creating a new version
    };

    const validateForm = () => {
        let errors = {};

        if (!formData.versionName.trim()) {
            errors.versionName = "Version Name is required";
        }

        if (!selectedCategory) {
            errors.category = "Category is required";
        }

        if (!formData.remarks.trim()) {
            errors.remarks = "Remarks are required";
        }

        if (!formData.file) {
            errors.file = "File is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Returns true if no errors
    };
    const handleSubmit = async () => {
        // Handle creating a new version
        if (validateForm()) {
            setSubmitAvailable(true);
            try {
                const createVersionResponse = await dispatch(createVersion(formData));
                setNotification({ open: true, message: createVersionResponse?.payload?.message, severity: "success" });
                // await getVersionDetails(editionId);
            } catch (error) {
                console.log("error", error);
                setSubmitAvailable(false);
                console.log("error creating new version", error);
            }
        }
    };

    const handleFileChange = (file) => {
        setFormData((prev) => ({
            ...prev,
            file: file,
        }));
    };

    const onDrop = (acceptedFiles) => {
        setFormData((prev) => ({
            ...prev,
            file: acceptedFiles[0], // Store the first uploaded file
        }));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "application/pdf",
        multiple: false
    });

    const onDropMultiple = (acceptedFiles) => {
        // const filteredFiles = acceptedFiles.filter(file => file.type === "application/pdf");
        // if (filteredFiles.length !== acceptedFiles.length) {
        //     alert("Only PDF files are allowed!");
        //     return;
        // }
        setInputFiles((prevFiles) => [...prevFiles, ...acceptedFiles]); // Store multiple files
    };

    const { getRootProps: getRootPropsMultiple, getInputProps: getInputPropsMultiple } = useDropzone({
        onDrop: onDropMultiple,
        accept: "",
        multiple: true, // Allow multiple files
    });


    const handleRemoveFile = (index) => {
        setInputFiles(inputFiles.filter((_, i) => i !== index));
    };




    const handleCommentClick = async (index) => {
        setChatname(index)
        setChatOpen(true); // Open the chat interface on comment icon click

        if (tabData[selectedCategory]?.[subTab]?._id) {
            try {
                await dispatch(fetchCommentsByVersionId(tabData[selectedCategory][subTab]._id));
            } catch (error) {
                console.log("errr", error);

            }

        }
    };

    // const handleChatSubmit = () => {
    //     if (chatMessage.trim()) {
    //         const newMessage = {
    //             versionId: tabData[selectedCategory]?.[subTab]?._id,
    //             userId: loginDetails?.user?._id,
    //             message: chatMessage,
    //         };

    //         try {
    //             dispatch(createComment(newMessage)).then(() => {
    //                 dispatch(fetchCommentsByVersionId(newMessage.versionId));
    //                 setChatMessage("");
    //             });
    //             // Fetch comments again after sending to ensure state updates
    //         } catch (error) {
    //             console.log("Error sending chat message:", error);
    //         }
    //     }
    // };

    //New chat with file attachments
    const handleChatSubmit = () => {
        if (chatMessage.trim() || selectedFile) {
            const formData = new FormData();
            formData.append("versionId", tabData[selectedCategory]?.[subTab]?._id);
            formData.append("userId", loginDetails?.user?._id);
            formData.append("message", chatMessage);
            if (selectedFile) {
                console.log("selectedFile", selectedFile);

                formData.append("file", selectedFile);
            }

            try {
                dispatch(createComment(formData)).then(() => {
                    dispatch(fetchCommentsByVersionId(tabData[selectedCategory]?.[subTab]?._id));
                    setChatMessage("");
                    setSelectedFile(null); // Reset after sending
                });
            } catch (error) {
                console.log("Error sending chat message:", error);
            }
        }
    };



    // const handleApprove = (version) => {
    //     if (version) {
    //         try {
    //             dispatch(approveVersionById(version?._id)).then((response) => {
    //                 setNotification({ open: true, message: response?.payload?.message, severity: "success" });
    //                 // alert('Version approved successfully!');
    //                 getVersionDetails(editionId);
    //             });

    //         } catch (error) {
    //             console.log("error in approving version", error);
    //             setNotification({ open: true, message: "Failed to create round", severity: "failed" });
    //         }
    //     }
    // }

    const getProjectDetails = async (id) => {
        try {
            await dispatch(getProjectDetailsById(id))
        } catch (error) {
            console.log("project details by id error", error);
        }
    }

    const handleInputFileChange = async (event) => {
        if (inputFiles) {
            try {
                await dispatch(uploadProjectFile({ projectId: projectId, file: inputFiles })).then((response) => {
                    setNotification({ open: true, message: response?.payload?.message, severity: "success" });
                    getProjectDetails(projectId);
                    dispatch(getEditionsById(editionId));
                });
            } catch (error) {
                console.log("Failed to upload to inputs", error);
                setNotification({ open: true, message: "Failed to upload to inputs", severity: "failed" });
            }
        }
    };

    const formatChatTimestamp = (timestamp) => {
        return moment(timestamp)
            // .tz("Asia/Kolkata") // Change to your preferred timezone
            .format("DD MMM YYYY, hh:mm A"); // Example: 05 Feb 2025, 05:38 PM
    };

    const lastIndex = subTabArray.length - 1;



    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100px" }}>

            {/*  <Card sx={{ p: 2, width: "100%", minHeight: "80px" }}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography variant="h6">Edition Details</Typography>
                        <Typography variant="h5">{editionDetailsById && editionDetailsById?.editions?.title || 'NA'}</Typography>
                        <Typography variant="body2">{editionDetailsById && editionDetailsById?.editions?.publisher || 'NA'}</Typography>
                    </Box>
                    {canShowButton && (
                        selectedCategory === "Inputs" ? (
                            <Button variant="contained" color="primary" onClick={handleFileInputs}>
                                Upload File
                            </Button>) : (
                            <Button variant="contained" color="primary" onClick={handleCreateNewVersion}>
                                Create {selectedCategory} Rounds
                            </Button>
                        )
                    )}

                </CardContent>
            </Card> */}

            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Main Tabs */}
                <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="h6" >  Edition : </Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}> {editionDetailsById && editionDetailsById?.editions?.title || 'NA'}</Typography>

                </Box>
                <Tabs value={mainTab} onChange={handleMainTabChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    {mainTabs.map((tab, index) => (
                        <Tab key={index} label={tab.charAt(0).toUpperCase() + tab.slice(1)} />
                    ))}
                </Tabs>

                <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
                    {/* Vertical Tabs for Versions */}
                    <Box sx={{ width: "auto", borderRight: 1, borderColor: "divider", p: 2 }}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={subTab}
                            onChange={handleSubTabChange}
                            sx={{ borderRight: 1, borderColor: "divider", alignItems: "flex-start" }}
                        >
                            {selectedCategory != "Inputs" ?
                                Object.entries(tabData).length > 0 && tabData[selectedCategory]?.map((item, index) => (
                                    <Tab
                                        key={index}
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                                <Typography sx={{ flexGrow: 1 }}>{item.versionName}</Typography>
                                                <IconButton
                                                    sx={{
                                                        ml: 1,
                                                        backgroundColor: "#e6f4ff",
                                                        borderRadius: "8px",
                                                        "&:hover": { backgroundColor: "#b3e5fc" },
                                                        padding: "6px"
                                                    }}
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (index === subTab) {
                                                            handleCommentClick(item.versionName);
                                                        }
                                                    }}

                                                >
                                                    <CommentBankOutlined style={{ color: "orange" }} fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                        sx={{ textAlign: "left", justifyContent: "flex-start" }}
                                    />
                                )) :
                                Object.entries(tabData).length > 0 && tabData[selectedCategory].map((item, index) => (
                                    <Tab
                                        key={index}
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                                <Typography sx={{ flexGrow: 1 }}>{'File ' + (index + 1)}</Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                        </Tabs>
                    </Box>
                    {/* PDF Viewer */}
                    {/* PDF Viewer */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            height: "100%", // ✅ critical
                            minHeight: "500px",
                            width: "100%",
                        }}
                    >
                        {selectedCategory === "editor" ? (
                            // <CollabEditor />
                            <TiptapEditor />
                        ) :
                            selectedCategory === "Proof Read" ? (
                                <ProofReaderEditorProvider />
                            ) :
                                (

                                    <Box
                                        sx={{
                                            flex: 1,
                                            p: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                            minHeight: "500px"
                                        }}
                                    >
                                        {/* {tabData[selectedCategory]?.[subTab] &&
                                    selectedCategory !== "Inputs" &&
                                    canShowButton &&
                                    (!approvedCategories?.TypeSetting ||
                                        !approvedCategories?.coverdesign) &&
                                    !approvedCategories?.[selectedCategory] &&
                                    subTab === parseInt(subTabArray[lastIndex]) && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            sx={{ alignSelf: "flex-end", mb: 1 }}
                                            onClick={() => handleApprove(tabData[selectedCategory][subTab])}
                                        >
                                            Approve
                                        </Button>
                                    )} */}
                                        {tabData[selectedCategory]?.[subTab] ? (() => {
                                            const fileObj = tabData[selectedCategory][subTab];
                                            const fileUrl = selectedCategory === "Inputs" ? fileObj.filePath : fileObj.fileStorageUrl;
                                            const cleanUrl = fileUrl.split("?")[0];
                                            const extension = cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1).toLowerCase();

                                            const supportedExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "webp", "svg"];

                                            if (!supportedExtensions.includes(extension)) {
                                                return (
                                                    <Typography variant="h6" color="textSecondary">
                                                        This document type ({extension}) is not supported for preview.
                                                    </Typography>
                                                );
                                            }

                                            return (
                                                <iframe
                                                    src={fileUrl}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: "none", minHeight: "500px" }}
                                                    title={`File ${subTab + 1}`}
                                                    onError={(e) => console.error("Failed to load file:", e)}
                                                ></iframe>
                                            );
                                        })() : (
                                            <Typography variant="h6" color="textSecondary">
                                                No data found
                                            </Typography>
                                        )}

                                    </Box>
                                )}
                    </Box>
                </Box>
            </Box>

            <Modal open={openModal} onClose={handleCloseModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ width: "100%", maxWidth: 500, p: 3, borderRadius: "10px" }}>
                    <Typography variant="h6" gutterBottom>
                        Add New Version
                    </Typography>

                    <TextField
                        fullWidth
                        label="Version Name"
                        variant="outlined"
                        name="versionName"
                        value={formData.versionName}
                        onChange={(e) => {
                            setFormData({ ...formData, versionName: e.target.value });
                            setFormErrors((prevErrors) => ({ ...prevErrors, versionName: "" }));
                            setSubmitAvailable(false);
                        }}
                        error={!!formErrors.versionName}
                        helperText={formErrors.versionName}
                        sx={{ mb: 2 }}
                    />

                    {/* <TextField
                        fullWidth
                        label="Category"
                        variant="outlined"
                        value={selectedCategory}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 2 }}
                        disabled={true}
                        error={!!formErrors.category}
                        helperText={formErrors.category}
                    /> */}

                    <TextField
                        fullWidth
                        label="Remarks"
                        variant="outlined"
                        multiline
                        rows={3}
                        name="remarks"
                        value={formData.remarks}
                        onChange={(e) => {
                            setFormData({ ...formData, remarks: e.target.value });
                            setFormErrors((prevErrors) => ({ ...prevErrors, remarks: "" }));
                            setSubmitAvailable(false);
                        }}
                        error={!!formErrors.remarks}
                        helperText={formErrors.remarks}
                        sx={{ mb: 2 }}
                    />

                    <Box {...getRootProps()} sx={{ p: 2, border: "2px dashed #ccc", textAlign: "center", cursor: "pointer", mb: 2 }}>
                        <input {...getInputProps()} onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setSubmitAvailable(false);
                                setFormData({ ...formData, file: e.target.files[0] });
                                setFormErrors((prevErrors) => ({ ...prevErrors, file: "" }));
                            }
                        }}
                        />
                        {formData.file ? (
                            <Typography variant="body1">Uploaded: {formData.file.name}</Typography>
                        ) : (
                            <Typography variant="body1">Drag & Drop or Click to Upload PDF</Typography>
                        )}
                    </Box>
                    {formErrors.file && <Typography color="error">{formErrors.file}</Typography>}
                    {formData.file && (
                        <>
                            <Typography color="success" variant="body2">
                                File uploaded successfully!
                            </Typography>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setFormData({ ...formData, file: null })}
                            >
                                Remove File
                            </Button>

                        </>
                    )}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={handleCloseModal} variant="outlined">
                            Cancel
                        </Button>
                        <Button disabled={submitAvailable} onClick={handleSubmit} variant="contained" color="primary">
                            Submit
                        </Button>
                    </Stack>
                </Paper>
            </Modal>

            <Modal open={openInputModal} onClose={handleInputCloseModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ width: "100%", maxWidth: 500, p: 3, borderRadius: "10px" }}>
                    <Typography variant="h6" gutterBottom>
                        Upload Input Files
                    </Typography>

                    <Box {...getRootPropsMultiple()} sx={{ p: 2, border: "2px dashed #ccc", textAlign: "center", cursor: "pointer", mb: 2 }}>
                        <input {...getInputPropsMultiple()} />
                        <Typography variant="body1">Drag & Drop or Click to Upload PDFs</Typography>
                    </Box>

                    {inputFiles.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {inputFiles.map((file, index) => (
                                <Stack key={index} direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                                    <Typography variant="body2">{file.name}</Typography>
                                    <Button size="small" variant="outlined" color="secondary" onClick={() => handleRemoveFile(index)}>
                                        Remove
                                    </Button>
                                </Stack>
                            ))}
                        </Box>
                    )}

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={handleInputCloseModal} variant="outlined">
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleInputFileChange}>
                            Submit
                        </Button>
                    </Stack>
                </Paper>
            </Modal>

            {chatOpen && (
                <Rnd
                    default={{
                        x: 0,
                        y: 0,
                        width: 600,
                        height: 500,
                    }}
                    minWidth={200}
                    minHeight={200}
                    bounds="window"
                >
                    <Box sx={{
                        background: 'linear-gradient(to bottom, #ffffff, #e6f4ff)', // Light blue to white gradient
                        padding: 2,
                        boxShadow: 24,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        width: "100%",
                        border: "1px solid #0288d1", // Light blue border
                    }}>
                        <Typography variant="h6" sx={{
                            background: 'linear-gradient(to right, #000000, #b3e5fc)', // Black to light blue gradient for header
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            textAlign: "center",
                        }}>
                            Chat for {chatname} {/* Dynamic version name */}
                        </Typography>

                        <Paper sx={{
                            p: 2,
                            mt: 2,
                            maxHeight: 250,
                            overflowY: "auto",
                            borderRadius: "8px",
                            boxShadow: "none"
                        }}>
                            <List>
                                {chatHistory.map((chat, index) => {
                                    const isCurrentUser = chat.username === currentUserName; // adjust as per your logic
                                    const isImage = /\.(jpeg|jpg|png|gif|bmp)$/i.test(chat.fileUrl || '');
                                    const isDoc = /\.(pdf|docx?|xlsx?)$/i.test(chat.fileUrl || '');

                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        maxWidth: "75%",
                                                        background: isCurrentUser
                                                            ? 'linear-gradient(to right, #2196f3, #64b5f6)'
                                                            : '#e3f2fd',
                                                        color: isCurrentUser ? 'white' : 'black',
                                                        borderRadius: "16px",
                                                        padding: "12px",
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "13px" }}>
                                                        {chat.message}
                                                    </Typography>

                                                    {chat.fileUrl && (
                                                        <Box sx={{ mt: 1 }}>
                                                            {isImage ? (
                                                                <img
                                                                    src={`https://publishingplatform.s3.ap-south-1.amazonaws.com/${chat.fileUrl}`}
                                                                    alt="Attachment"
                                                                    style={{ width: "100%", borderRadius: 8 }}
                                                                />
                                                            ) : isDoc ? (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Typography variant="body2" sx={{ fontSize: "12px" }}>
                                                                        {chat.fileUrl.split('/').pop()}
                                                                    </Typography>
                                                                    <a
                                                                        href={chat.fileUrl}
                                                                        download
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Button variant="contained" size="small" sx={{ fontSize: "10px" }}>
                                                                            Download
                                                                        </Button>
                                                                    </a>
                                                                </Box>
                                                            ) : null}
                                                        </Box>
                                                    )}

                                                    <Typography variant="caption" sx={{ display: "block", fontStyle: "italic", fontSize: "10px", mt: 1 }}>
                                                        {chat?.username} • {formatChatTimestamp(chat.updatedAt)}
                                                    </Typography>
                                                </Box>
                                            </ListItem>
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Paper>

                        <TextField
                            fullWidth
                            label="Type your message"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            multiline
                            rows={4}
                            variant="outlined"
                            sx={{
                                mt: 2,
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                '& .MuiOutlinedInput-root': {
                                    borderColor: "#0288d1",
                                },
                                '&:hover .MuiOutlinedInput-root': {
                                    borderColor: "#0277bd", // Darker blue border on hover
                                }
                            }}
                        />

                        <Box sx={{
                            display: "flex",
                            mt: 2,
                            gap: "8px",
                        }}>
                            <Button
                                variant="contained"
                                sx={{
                                    //    background: 'linear-gradient(to right, #000000, #e6f4ff)', // Black to light blue gradient for Send button
                                    color: "white",
                                    //    '&:hover': {
                                    //      background: 'linear-gradient(to right, #333333, #b3e5fc)', // Darker gradient on hover
                                    //    },
                                }}
                                onClick={handleChatSubmit}
                            >
                                Send
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: "#0288d1", // Light blue border color
                                    color: "#0288d1",
                                    '&:hover': {
                                        borderColor: "#0277bd", // Darker blue on hover
                                        color: "#0277bd", // Darker blue on hover
                                    },
                                }}
                                onClick={() => setChatOpen(false)}
                            >
                                Close
                            </Button>
                            <input
                                type="file"
                                style={{ display: "none" }}
                                id="upload-file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            <label htmlFor="upload-file">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    sx={{
                                        borderColor: "#0288d1",
                                        color: "#0288d1",
                                        '&:hover': {
                                            borderColor: "#0277bd",
                                            color: "#0277bd",
                                        },
                                    }}
                                >
                                    Attach File
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="body2" sx={{ fontSize: "12px", color: "#000" }}>
                                    {selectedFile.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Rnd>





            )}

            <Notification
                open={notification.open}
                onClose={handleCloseNotification}
                message={notification.message}
                severity={notification.severity}
            />
        </Box>
    );
};

export default EditionDetails;

