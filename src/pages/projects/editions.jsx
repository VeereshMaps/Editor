import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    CardActionArea,
    Stack,
    Modal,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from "@mui/material";
import { AddBox } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getEditionsByProjectId } from "redux/Slices/editionByProjectIdSlice";
import { createEditionFunc } from "redux/Slices/createEditionSlice";
import { updateEdition } from "redux/Slices/updateEditionSlice";
import moment from "moment-timezone";
import { elevatedAccess, formattedUserRole, superAccess } from "api/menu";
// import { updateEditionFunc } from "redux/Slices/updateEditionSlice"; // New API call for editing

const Editions = ({ setShowEditForm, bookDetails }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [errors, setErrors] = useState({});
    const editionByProjectIdDetails = useSelector((state) => state.editionsByProjectId);
    const loginDetails = useSelector((state) => state.auth);

    const [editionData, setEditionData] = useState({
        title: "",
        seriesTitle: "",
        contributor: "",
        publicationDate: "",
        publisher: "",
        isbn10: "",
        isbn13: "",
        eISBN: "",
        price: "",
        ebookPrice: "",
        bookType: "",
        noOfPages: "",
        language: "",
        keywords: "",
        category: "",
        grade: "",
        subject: "",
        illustrations: "",
        textcolor: "",
        description: "",
        status: "",
        createdBy: loginDetails?.user?._id,
        projectID: bookDetails.projects._id
    });

    useEffect(() => {
        if (bookDetails?.projects?._id) {
            getEditionsFunc();
        }
    }, [bookDetails]);

    const getEditionsFunc = async () => {
        try {
            await dispatch(getEditionsByProjectId(bookDetails.projects._id));
        } catch (error) {
            console.log("Error getting edition details", error);
        }
    };

    const handleAddEdition = () => {
        setEditData(null); // Reset editing data
        setEditionData({
            title: "",
            seriesTitle: "",
            contributor: "",
            publicationDate: "",
            publisher: "",
            isbn10: "",
            isbn13: "",
            eISBN: "",
            price: "",
            ebookPrice: "",
            bookType: "",
            noOfPages: "",
            language: "",
            keywords: "",
            category: "",
            grade: "",
            subject: "",
            illustrations: "",
            textcolor: "",
            description: "",
            status: "WIP",
            createdBy: loginDetails?.user?._id,
            projectID: bookDetails.projects._id
        });
        setOpenModal(true);
    };

    const handleEdit = (edition) => {
        setEditData(edition); // Store the edition to edit
        setEditionData(edition); // Populate the form with existing data
        setOpenModal(true);
        setErrors({});
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditData(null); // Clear edit mode
    };

    const handleMoveToGold = async (edition) => {
        try {
            const updatedEdition = { ...edition, status: "Gold" };
    
            await dispatch(updateEdition({ id: edition._id, updatedData: updatedEdition }));
    
            getEditionsFunc(); // Refresh the list after successful update
        } catch (error) {
            console.error("Error updating edition status to Gold:", error);
        }
    };
    

    const handleSubmit = async () => {
        let newErrors = {};
        
        if (!editionData.title) newErrors.title = "Edition Name is required";
        if (!editionData.seriesTitle) newErrors.seriesTitle = "Series Title is required";
        if (!editionData.publicationDate) {
            newErrors.publicationDate = "Publication Date is required";
        } else if (
            !moment(editionData.publicationDate, moment.ISO_8601, true).isValid() &&
            !moment(editionData.publicationDate, "YYYY-MM-DD", true).isValid()
        ) {
            newErrors.publicationDate = "Invalid date format";
        }
        if (!editionData.publisher) newErrors.publisher = "Publisher is required";
        if (!editionData.isbn10) newErrors.isbn10 = "ISBN-10 is required";
        if (!editionData.isbn13) newErrors.isbn13 = "ISBN-13 is required";
        if (!editionData.eISBN) newErrors.eISBN = "eISBN is required";
        if (!editionData.price) newErrors.price = "Price is required";
        if (!editionData.ebookPrice) newErrors.ebookPrice = "eBook Price is required";
        if (!editionData.bookType) newErrors.bookType = "Book Type is required";
        if (!editionData.noOfPages) newErrors.noOfPages = "Number of Pages is required";
        if (!editionData.language) newErrors.language = "Language is required";
        if (!editionData.keywords) newErrors.keywords = "Keywords are required";
        if (!editionData.category) newErrors.category = "Category is required";
        if (!editionData.grade) newErrors.grade = "Grade is required";
        if (!editionData.subject) newErrors.subject = "Subject is required";
        if (editionData.illustrations === "") newErrors.illustrations = "Illustrations field is required";
        if (!editionData.textcolor) newErrors.textcolor = "Text Color is required";
        if (!editionData.description) newErrors.description = "Description is required";
        if (!editionData.status) newErrors.status = "Status is required";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        try {
            if (editData) {
                // If editing, call the update API
                await dispatch(updateEdition({ id: editData._id, updatedData: editionData }));
            } else {
                // If creating, call the create API
                await dispatch(createEditionFunc(editionData));
            }
            handleCloseModal();
            getEditionsFunc(); // Refresh list
        } catch (error) {
            console.log("Error while saving edition", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditionData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "", // Clear the error when the field is updated
        }));
    };

    return (
        <>
            <Grid container spacing={2} alignItems="stretch">
                {/* Add New Edition Card */}
                {formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) && loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess &&
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ textAlign: "center", height: "100%" }}>
                            <CardActionArea onClick={handleAddEdition}>
                                <CardContent
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                    }}
                                >
                                    <AddBox fontSize="large" color="secondary" />
                                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                                        Add New Edition
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                }
                {/* Edition Cards */}
                {editionByProjectIdDetails.editions.length > 0 ? editionByProjectIdDetails.editions.map((edition, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",    position: "relative" }}>
                            <CardContent sx={{ padding: 2, flexGrow: 1 }}>
                                <Typography variant="h6"><b>Title: {edition.title}</b></Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        // textAlign:"justify",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 4, // Limits to 2 lines
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    <b>Description : </b>{edition.description}
                                </Typography>

                            </CardContent>
                            <Stack direction="row" spacing={1} sx={{ padding: 2, justifyContent: "flex-start" }}>
                                {formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) && (loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess || loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === elevatedAccess) &&
                                    <Button variant="outlined" color="primary" size="small" onClick={() => handleEdit(edition)}>
                                        Edit
                                    </Button>
                                }
                                {/* <Button variant="outlined" color="primary" size="small" onClick={() => navigate("/projects/editions", { state: { editionDetails: edition, projectDetails: editionByProjectIdDetails } })}>
                                    View
                                </Button> */}
                                <Button variant="outlined" color="primary" size="small" onClick={() => navigate(`/projects/editions/${edition._id}/${edition.projectID._id}`)}>
                                    View
                                </Button>
                                {(!edition.status || edition.status === "WIP") && formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) && (loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess || loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === elevatedAccess) && (edition?.isCoverDesignedApproved && edition?.isTypesettingApproved) && (
                                <Button variant="outlined" color="primary" size="small"  onClick={() => handleMoveToGold(edition)}>
                                    Move to GOLD
                                </Button>
                                )}
                            </Stack>
                        </Card>
                    </Grid>
                )) : <Typography>{editionByProjectIdDetails?.error?.message}</Typography>}
            </Grid>

            {/* Modal for Adding or Editing Edition */}
            <Modal open={openModal} onClose={handleCloseModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ width: "100%", maxWidth: 500, p: 3, borderRadius: 2, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: 24, maxHeight: "90vh", overflowY: "auto" }}>
                    <Typography variant="h6" gutterBottom>
                        {editData ? "Edit Edition" : "Add New Edition"}
                    </Typography>

                    <TextField fullWidth label="Edition Name" variant="outlined" name="title" value={editionData.title} onChange={handleInputChange} error={!!errors.title} helperText={errors.title} sx={{ mb: 2 }} />

                    <TextField fullWidth label="Series Title" variant="outlined" name="seriesTitle" value={editionData.seriesTitle} error={!!errors.seriesTitle} helperText={errors.seriesTitle} onChange={handleInputChange} sx={{ mb: 2 }} />

                    <TextField
                        fullWidth
                        label="Publication Date"
                        type="date"
                        variant="outlined"
                        name="publicationDate"
                        value={editionData.publicationDate ? moment(editionData.publicationDate).format("YYYY-MM-DD") : ""}
                        onChange={handleInputChange}
                        error={!!errors.publicationDate}
                        helperText={errors.publicationDate}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField fullWidth label="Publisher" variant="outlined" name="publisher" value={editionData.publisher} onChange={handleInputChange} error={!!errors.publisher} helperText={errors.publisher} sx={{ mb: 2 }} />


                    <TextField fullWidth label="ISBN-10" variant="outlined" name="isbn10" value={editionData.isbn10} onChange={handleInputChange} error={!!errors.isbn10} helperText={errors.isbn10} sx={{ mb: 2 }} />

                    <TextField fullWidth label="ISBN-13" variant="outlined" name="isbn13" value={editionData.isbn13} onChange={handleInputChange} error={!!errors.isbn13} helperText={errors.isbn13} sx={{ mb: 2 }} />

                    <TextField fullWidth label="eISBN" variant="outlined" name="eISBN" value={editionData.eISBN} onChange={handleInputChange} error={!!errors.eISBN} helperText={errors.eISBN} sx={{ mb: 2 }} />

                    <TextField fullWidth label="Price" variant="outlined" name="price" type="number" value={editionData.price} onChange={handleInputChange} error={!!errors.price} helperText={errors.price} sx={{ mb: 2 }} />

                    <TextField fullWidth label="eBook Price" variant="outlined" name="ebookPrice" type="number" inputProps={{ min: 0 }} value={editionData.ebookPrice} onChange={handleInputChange} error={!!errors.ebookPrice} helperText={errors.ebookPrice} sx={{ mb: 2 }} />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Book Type</InputLabel>
                        <Select name="bookType" value={editionData.bookType} onChange={handleInputChange}>
                            <MenuItem value="Hardcover">Hardcover</MenuItem>
                            <MenuItem value="Paperback">Paperback</MenuItem>
                            <MenuItem value="eBook">eBook</MenuItem>
                        </Select>
                        {errors.bookType && <FormHelperText>{errors.bookType}</FormHelperText>}
                    </FormControl>

                    <TextField fullWidth label="Number of Pages" variant="outlined" name="noOfPages" type="number" value={editionData.noOfPages} onChange={handleInputChange} error={!!errors.noOfPages} helperText={errors.noOfPages} sx={{ mb: 2 }} />

                    <TextField fullWidth label="Language" variant="outlined" name="language" value={editionData.language} onChange={handleInputChange} error={!!errors.language} helperText={errors.language} sx={{ mb: 2 }} />

                    <TextField fullWidth label="Keywords" variant="outlined" name="keywords" value={editionData.keywords} onChange={handleInputChange} error={!!errors.keywords} helperText={errors.keywords} sx={{ mb: 2 }} />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select name="category" value={editionData.category} onChange={handleInputChange}>
                            <MenuItem value="Fiction">Fiction</MenuItem>
                            <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                            <MenuItem value="Science">Science</MenuItem>
                            <MenuItem value="History">History</MenuItem>
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                    </FormControl>

                    <TextField fullWidth label="Grade" variant="outlined" name="grade" value={editionData.grade} onChange={handleInputChange} error={!!errors.grade} helperText={errors.grade} sx={{ mb: 2 }} />

                    <TextField fullWidth label="Subject" variant="outlined" name="subject" value={editionData.subject} onChange={handleInputChange} error={!!errors.subject} helperText={errors.subject} sx={{ mb: 2 }} />

                    {/* Fixed Illustrations (Boolean) */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Illustrations</InputLabel>
                        <Select name="illustrations" value={editionData.illustrations} onChange={handleInputChange}>
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                        {errors.illustrations && <FormHelperText>{errors.illustrations}</FormHelperText>}
                    </FormControl>

                    {/* Fixed Text Color (Enum) */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Text Color</InputLabel>
                        <Select name="textcolor" value={editionData.textcolor} onChange={handleInputChange}>
                            <MenuItem value="Black">Black</MenuItem>
                            <MenuItem value="Blue">Blue</MenuItem>
                            <MenuItem value="Red">Red</MenuItem>
                            <MenuItem value="Green">Green</MenuItem>
                            <MenuItem value="Black & White">Black & White</MenuItem>
                            <MenuItem value="Colored">Colored</MenuItem>
                        </Select>
                        {errors.textcolor && <FormHelperText>{errors.textcolor}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={editionData.status} onChange={handleInputChange}>
                            <MenuItem value="WIP">WIP</MenuItem>
                            <MenuItem value="Gold">Gold</MenuItem>
                        </Select>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>

                    <TextField fullWidth label="Description" variant="outlined" name="description" multiline rows={3} value={editionData.description} onChange={handleInputChange} error={!!errors.description} helperText={errors.description} sx={{ mb: 2 }} />

                    {/* Fixed CreatedBy (ObjectId) */}
                    {/* <TextField fullWidth label="Created By" variant="outlined" name="createdBy" value={editionData.createdBy} onChange={handleInputChange} sx={{ mb: 2 }} disabled /> */}

                    <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                        <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {editData ? "Update" : "Submit"}
                        </Button>
                    </Stack>
                </Paper>
            </Modal>
        </>
    );
};

export default Editions;
