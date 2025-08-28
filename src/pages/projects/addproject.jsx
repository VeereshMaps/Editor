import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, InputAdornment, TextareaAutosize, Checkbox, ListItemText, FormHelperText } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { json, useLocation, useNavigate } from 'react-router';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import moment from "moment-timezone";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getProjectDetailsById } from 'redux/Slices/projectDetailsByIdSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';
import { saveProjectDetailsFunc } from 'redux/Slices/saveProjectDetails';
import { createProjectFunc } from 'redux/Slices/createProjectSlice';
import { elevatedAccess, formattedUserRole } from 'api/menu';
import LanguageList from "language-list";
import { ArrowBack } from '@mui/icons-material'
import AlertService from 'utils/AlertService';
const AddProjectForm = ({ id, Data, onSubmit }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const bookData = location.state?.bookData;
    const languageList = new LanguageList();
    const languages = languageList.getData(); // Returns an array of language objects
    const loginDetails = useSelector((state) => state.auth);
    const projectDetailsById = useSelector((state) => state.projectDetailsById);
    const roleBasedOrAllUsers = useSelector((state) => state.roleBasedOrAllUsers);
    const [teamleads, setTeamleads] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [projectManager, setProjectManagers] = useState([]);
    const [proofReader, setProofReader] = useState([]);
    const [editor, setEditor] = useState([]);
    const [coverDesigner, setCoverDesigner] = useState([]);
    const [errors, setErrors] = useState({});
    const [disableButton, setDisableButton] = useState(false);
    const userRole = loginDetails?.user?.role?.toLowerCase();

    // State for form fields
    const [project, setProject] = useState({
        title: bookData?.title || '',
        author: authors.find((item) => `${item.firstName} ${item.lastName}` === bookData?.author) || '',
        genre: bookData?.genre || '',
        publicationDate: bookData?.publicationDate || null,
        editor: bookData?.editor || '',
        teamLead: Array.isArray(bookData?.teamLead)
            ? bookData.teamLead.map(name =>
                teamleads.find(item => `${item.firstName} ${item.lastName}` === name) || null
            ).filter(Boolean) // Remove null values if no match is found
            : bookData?.teamLead
                ? [teamleads.find(item => `${item.firstName} ${item.lastName}` === bookData.teamLead) || null].filter(Boolean)
                : [],
        proofReader: proofReader.find((item) => `${item.firstName} ${item.lastName}` === bookData?.proofReader) || '',
        designer: coverDesigner.find((item) => `${item.firstName} ${item.lastName}` === bookData?.designer) || '',
        projectManager: bookData?.projectmanager || '',
        originLanguage: bookData?.originLanguage || 'English', // Default to English if not provided
        Admin: bookData?.Admin || loginDetails?.user?._id,
        createdBy: bookData?.createdBy || loginDetails?.user?._id,
        // description: bookData?.description || '',
    });
    useEffect(() => {
        console.log("loginDetails", loginDetails?.user?.role);

    }, [loginDetails]);

    const getProjectDetails = async () => {
        try {
            if (bookData) {
                await dispatch(getProjectDetailsById(bookData?.projectId));
            }
            await dispatch(getRoleBasedOrAllUsers())
        } catch (error) {
            console.log("project details by id or get users based on role or all users error", error);
        }
    }

    useEffect(() => {
        getProjectDetails();
    }, []);


    useEffect(() => {
        if (roleBasedOrAllUsers.status === "success" && Array.isArray(roleBasedOrAllUsers.data)) {
            // Normalize role names to lowercase
            const normalizedData = roleBasedOrAllUsers.data.map(user => ({
                ...user,
                role: user.role.toLowerCase().replace(/\s+/g, "") // Remove spaces for consistency
            }));

            // Filter users based on roles
            setAuthors(normalizedData.filter(user => user.role === "author"));
            setTeamleads(normalizedData.filter(user => user.role === "teamlead"));
            setProjectManagers(normalizedData.filter(user => user.role === "projectmanager"));
            setProofReader(normalizedData.filter(user => user.role === "proofreader"));
            setEditor(normalizedData.filter(user => user.role === "editor"));
            setCoverDesigner(normalizedData.filter(user => user.role === "designer"));
        }
    }, [roleBasedOrAllUsers]);




    useEffect(() => {
        if (location.state && location.state.bookData && teamleads.length > 0) {
            const bookData = location.state.bookData;
            setProject(prevState => ({
                ...prevState,
                title: bookData?.title || '',
                author: authors.find((item) => `${item.firstName} ${item.lastName}` === bookData?.author) || '',
                genre: bookData?.genre || '',
                publicationDate: bookData?.publicationDate || '',
                originLanguage: bookData?.originLanguage || '',
                Admin: bookData?.Admin,
                createdBy: bookData?.createdBy,
                editor: editor.find((item) => `${item.firstName} ${item.lastName}` === bookData?.editor) || '',
                projectManager: projectManager.find((item) => `${item.firstName} ${item.lastName}` === bookData?.projectManager) || '',
                proofReader: proofReader.find((item) => `${item.firstName} ${item.lastName}` === bookData?.proofReader) || '',
                designer: coverDesigner.find((item) => `${item.firstName} ${item.lastName}` === bookData?.designer) || '',
                teamLead: Array.isArray(location.state.bookData?.teamLead)
                    ? location.state.bookData.teamLead
                        .map(name => teamleads.find(tl =>
                            `${tl.firstName} ${tl.lastName}`.trim().toLowerCase() === name.trim().toLowerCase()
                        ) || null)
                        .filter(Boolean) // Remove null values if no match
                    : []
            }));
        }
    }, [location.state, authors, projectManager, teamleads, proofReader, editor]);




    useEffect(() => {
        if (typeof project.author === "string" && authors.length > 0) {
            console.log("INNN");

            const matchedAuthor = authors.find(
                (item) => `${item.firstName} ${item.lastName}` === (project.author != "" ? project.author : `${loginDetails?.user.firstName} ${loginDetails?.user?.lastName}`)
            );
            console.log("000", matchedAuthor, `${loginDetails?.user.firstName} ${loginDetails?.user?.lastName}`)
            if (matchedAuthor) {
                setProject((prev) => ({
                    ...prev,
                    author: matchedAuthor, // Set as object
                }));
            }
        }
    }, [project.author, authors]);

    useEffect(() => {
        console.log("asdd", project);

    }, [project])
    // Runs when response or authors list changes

    useEffect(() => {
        if (teamleads.length > 0 && project?.teamLead?.length > 0) {
            const matchedTeamLeads = project.teamLead.map(name =>
                teamleads.find(tl => `${tl.firstName} ${tl.lastName}` === name) || null
            ).filter(Boolean); // Remove nulls if no match is found

            setProject(prev => ({
                ...prev,
                teamLead: matchedTeamLeads.length > 0 ? matchedTeamLeads : prev.teamLead, // Keep old values if no match
            }));
        }
    }, [teamleads]);





    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({
            ...prev,
            [name]: name === "teamLead"
                ? teamleads.filter(tl => value.includes(tl._id)) // Keep objects instead of just IDs
                : value
        }));
        setErrors({ ...errors, [name]: value ? "" : `${name} is required.` });

    };

    const onDrop = (acceptedFiles) => {
        setProject((prev) => ({
            ...prev,
            profilePicture: acceptedFiles[0]  // Store the first uploaded file
        }));
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': [],
            'image/webp': [],
            'image/svg+xml': [],
        },  // Only accept image files
        multiple: false,    // Only one file at a time
    });

    // Handle file change (Profile picture)
    const handleFileChange = (e) => {
        setProject((prev) => ({
            ...prev,
            profilePicture: e.target.files[0]
        }));
    };

    const validate = () => {
        let tempErrors = {};
        if (!project.title.trim()) tempErrors.title = "Project Name is required.";
        // if (!project.originLanguage) tempErrors.originLanguage = "Language is required.";
        if (userRole != "author") {
            if (!project.author) tempErrors.author = "Author is required.";
            if (!project.projectManager) tempErrors.projectManager = "Project Manager is required.";
            if (!project.editor) tempErrors.editor = "Editor is required.";
            if (!project.proofReader) tempErrors.proofReader = "Proof Reader is required.";
            if (!project.designer) tempErrors.designer = "Cover Designer is required.";
            if (project.teamLead.length === 0) tempErrors.teamLead = "Select at least one Team Lead.";
        }

        if (!project.publicationDate) tempErrors.publicationDate = "Publication Date is required.";
        if (!project.genre) tempErrors.genre = "Genre is required.";


        setErrors(tempErrors);

        // Return true if no errors
        return Object.keys(tempErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validate()) {
            const extractedData = {
                title: project.title,
                author: project.author?._id || null,
                genre: project.genre,
                publicationDate: project.publicationDate,
                Admin: project.Admin,
                originLanguage: project.originLanguage,
                // description: project.description,
                editor: project.editor?._id || null,
                projectManager: project.projectManager?._id || null,
                proofReader: project.proofReader?._id || null,
                designer: project.designer?._id || null,
                teamLead: Array.isArray(project.teamLead) ? project.teamLead.map(tl => tl._id) : [],
                createdBy: project.createdBy
            };
            setDisableButton(true);
            try {
                if (bookData) {
                    const data = {
                        userId: bookData.projectId,
                        payload: extractedData
                    }
                    await dispatch(saveProjectDetailsFunc(data));
                    AlertService.success("Project updated successfully!");
                } else {
                    console.log("extractedData", extractedData);
                    
                    await dispatch(createProjectFunc(extractedData));
                    AlertService.success("Project created successfully!");
                }
                setDisableButton(false);
                navigate(-1);
            } catch (error) {
                AlertService.error("Failed to save project!");
                console.log("updating error", error);
            }
        } else {
            AlertService.warn("Form has errors. Please check.");
            console.log("Form has errors");
        }
    };

    const back = () => {
        const navigate = useNavigate();
        return () => {
            navigate('/projects');
        };
    };
    return (
        <>
            <Button title='back to previous' onClick={back()} startIcon={<ArrowBack style={{ fontSize: 25 }} />}>
            </Button>

            <Paper sx={{ padding: 3 }} className='max_height_form'>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Form fields start */}
                        <Grid item xs={6}>
                            <TextField
                                label="Project Name"
                                name="title"
                                value={project.title}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                                error={!!errors.title}
                                helperText={errors.title}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth margin="normal" error={!!errors.originLanguage}>
                                <InputLabel>Language</InputLabel>
                                <Select
                                    name="originLanguage"
                                    value={project.originLanguage || "English"} // Default to "English"
                                    onChange={handleChange}
                                    disabled={true}
                                >
                                    {languages.map((lang) => (
                                        <MenuItem
                                            key={lang.code}
                                            value={lang.language}
                                           
                                        >
                                            {lang.language}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.originLanguage && (
                                    <FormHelperText>{errors.originLanguage}</FormHelperText>
                                )}
                            </FormControl>

                        </Grid>

                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.author}>
                                    <InputLabel>Author Name</InputLabel>
                                    <Select
                                        name="author"
                                        value={project.author ? JSON.stringify(project.author) : ""}
                                        onChange={(e) => handleChange({ target: { name: "author", value: JSON.parse(e.target.value) } })}
                                    >
                                        {authors.map((authorItem) => (
                                            <MenuItem key={authorItem._id} value={JSON.stringify(authorItem)}>
                                                {authorItem.firstName} {authorItem.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.author && <FormHelperText>{errors.author}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={6}>
                            <FormControl fullWidth margin="normal" error={!!errors.publicationDate}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Publication Date"
                                        value={project.publicationDate ? dayjs(project.publicationDate) : null}
                                        onChange={(newValue) => handleChange({
                                            target: { name: "publicationDate", value: newValue ? dayjs(newValue).format("YYYY-MM-DD") : null }
                                        })}
                                        minDate={dayjs("1900-01-01")} // Allows selection of past years
                                    />
                                </LocalizationProvider>
                                {errors.publicationDate && <FormHelperText>{errors.publicationDate}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth margin="normal" error={!!errors.genre}>
                                <InputLabel>Genre</InputLabel>
                                <Select
                                    name="genre"
                                    value={project.genre}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Fiction">Fiction</MenuItem>
                                    <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                                    <MenuItem value="Publishing">Publishing</MenuItem>
                                    <MenuItem value="Science">Science</MenuItem>
                                    <MenuItem value="Technology">Technology</MenuItem>
                                </Select>
                                {errors.genre && <FormHelperText>{errors.genre}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.projectManager}>
                                    <InputLabel>Project Manager</InputLabel>
                                    <Select
                                        name="projectManager"
                                        value={project.projectManager ? JSON.stringify(project.projectManager) : ""}
                                        onChange={(e) => handleChange({ target: { name: "projectManager", value: JSON.parse(e.target.value) } })}
                                    >
                                        {projectManager.map((manager) => (
                                            <MenuItem key={manager._id} value={JSON.stringify(manager)}>
                                                {manager.firstName} {manager.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.projectManager && <FormHelperText>{errors.projectManager}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        )}

                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.teamLead}>
                                    <InputLabel>Team Lead</InputLabel>
                                    <Select
                                        name="teamLead"
                                        multiple
                                        value={project.teamLead?.map(tl => tl._id) || []}
                                        onChange={(e) => {
                                            const selectedIds = e.target.value;
                                            const selectedTeamLeads = teamleads.filter(tl => selectedIds.includes(tl._id));
                                            handleChange({ target: { name: "teamLead", value: selectedIds } });
                                        }}
                                        renderValue={(selectedIds) => {
                                            if (!Array.isArray(selectedIds)) return "";
                                            const selectedObjects = teamleads.filter(tl => selectedIds.includes(tl._id));
                                            return selectedObjects.map(tl => `${tl.firstName} ${tl.lastName}`).join(", ");
                                        }}
                                    >
                                        {teamleads.map((teamLead) => (
                                            <MenuItem key={teamLead._id} value={teamLead._id}>
                                                <Checkbox checked={project.teamLead?.some(tl => tl._id === teamLead._id) || false} />
                                                {teamLead.firstName} {teamLead.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.teamLead && <FormHelperText>{errors.teamLead}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        )}

                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.proofReader}>
                                    <InputLabel>Proof Reader</InputLabel>
                                    <Select
                                        name="proofReader"
                                        value={project.proofReader ? JSON.stringify(project.proofReader) : ""}
                                        onChange={(e) => handleChange({ target: { name: "proofReader", value: JSON.parse(e.target.value) } })}
                                    >
                                        {proofReader.length > 0 ? (
                                            proofReader.map((reader) => (
                                                <MenuItem key={reader._id} value={JSON.stringify(reader)}>
                                                    {reader.firstName} {reader.lastName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Proof Reader available</MenuItem>
                                        )}
                                    </Select>
                                    {errors.proofReader && <FormHelperText>{errors.proofReader}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        )}
                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.designer}>
                                    <InputLabel>Cover Designer</InputLabel>
                                    <Select
                                        name="designer"
                                        value={project.designer ? JSON.stringify(project.designer) : ""}
                                        onChange={(e) => handleChange({ target: { name: "designer", value: JSON.parse(e.target.value) } })}
                                    >
                                        {coverDesigner.length > 0 ? (
                                            coverDesigner.map((reader) => (
                                                <MenuItem key={reader._id} value={JSON.stringify(reader)}>
                                                    {reader.firstName} {reader.lastName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Cover Designer available</MenuItem>
                                        )}
                                    </Select>
                                    {errors.designer && <FormHelperText>{errors.designer}</FormHelperText>}
                                </FormControl>

                            </Grid>
                        )}
                        {userRole !== "author" && (
                            <Grid item xs={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.editor}>
                                    <InputLabel>Editor</InputLabel>
                                    <Select
                                        name="editor"
                                        value={project.editor ? JSON.stringify(project.editor) : ""}
                                        onChange={(e) => handleChange({ target: { name: "editor", value: JSON.parse(e.target.value) } })}
                                    >
                                        {editor.length > 0 ? (
                                            editor.map((reader) => (
                                                <MenuItem key={reader._id} value={JSON.stringify(reader)}>
                                                    {reader.firstName} {reader.lastName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Editor available</MenuItem>
                                        )}
                                    </Select>
                                    {errors.editor && <FormHelperText>{errors.editor}</FormHelperText>}
                                </FormControl>

                            </Grid>
                        )}

                        {/* Form fields end */}

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={disableButton}
                                fullWidth
                            >
                                {bookData ? 'Save Changes' : 'Add Book/Project'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    );
};

export default AddProjectForm;
