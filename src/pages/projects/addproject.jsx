import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Paper, MenuItem, Select, InputLabel, FormControl, InputAdornment, TextareaAutosize, Checkbox, ListItemText } from '@mui/material';
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
    // State for form fields
    const [project, setProject] = useState({
        title: bookData?.title || '',
        author: authors.find((item) => `${item.firstName} ${item.lastName}` === bookData?.author) || '',
        genre: bookData?.genre || '',
        publicationDate: bookData?.publicationDate || '',
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
        originLanguage: bookData?.originLanguage || '',
        Admin: bookData?.Admin || loginDetails?.user?._id,
        createdBy: bookData?.createdBy || loginDetails?.user?._id,
        // description: bookData?.description || '',
    });




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
            const matchedAuthor = authors.find(
                (item) => `${item.firstName} ${item.lastName}` === project.author
            );
            if (matchedAuthor) {
                setProject((prev) => ({
                    ...prev,
                    author: matchedAuthor, // Set as object
                }));
            }
        }
    }, [project.author, authors]);
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

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
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
        try {
            if (bookData) {
                const data = {
                    userId: bookData.projectId,
                    payload: extractedData
                }
                await dispatch(saveProjectDetailsFunc(data));
            } else {
                await dispatch(createProjectFunc(extractedData));
            }
            navigate(-1);
        } catch (error) {
            console.log("updating error", error);
        }
    };

    return (
        <Paper sx={{ padding: 3 }}>
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
                    {/* <Grid item xs={6}>
                        <TextField
                            label="Language"
                            name="originLanguage"
                            value={project.originLanguage}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            rows={1}
                        />
                    </Grid> */}
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Language</InputLabel>
                            <Select
                                name="originLanguage"
                                value={project.originLanguage || ""}
                                onChange={handleChange}
                            >
                                {languages.map((lang) => (
                                    <MenuItem key={lang.code} value={lang.language}>
                                        {lang.language}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Author Name</InputLabel>
                            <Select
                                name="author"
                                disabled={(formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) && loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === elevatedAccess)}
                                value={typeof project.author === "object" && project.author !== null
                                    ? JSON.stringify(project.author)  // Convert object to string for Select
                                    : ""}
                                onChange={(e) => handleChange({ target: { name: "author", value: JSON.parse(e.target.value) } })}
                            >
                                {authors.length > 0 ?
                                    (
                                        authors.map((authorItem, index) => (
                                            <MenuItem key={authorItem._id} value={JSON.stringify(authorItem)}>{authorItem.firstName + " " + authorItem.lastName}</MenuItem>
                                        )
                                        )) :
                                    (
                                        <MenuItem disabled>No Project Managers available</MenuItem>
                                    )
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker label="Publication Date"
                                    value={project.publicationDate ? dayjs(project.publicationDate) : null} // Convert to dayjs object
                                    onChange={(newValue) => handleChange({
                                        target: { name: "publicationDate", value: newValue ? moment(newValue).format("YYYY-MM-DD") : null }
                                    })}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Project Manager</InputLabel>
                            <Select
                                disabled={(formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) && loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === elevatedAccess)}
                                name="projectManager"
                                value={project.projectManager ? JSON.stringify(project.projectManager) : ""}
                                onChange={(e) => handleChange({ target: { name: "projectManager", value: JSON.parse(e.target.value) } })}
                            >
                                {projectManager.length > 0 ? (
                                    projectManager.map((manager) => (
                                        <MenuItem key={manager._id} value={JSON.stringify(manager)}>
                                            {manager.firstName} {manager.lastName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No Project Managers available</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
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
                                    <MenuItem disabled>No editor available</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Team Lead</InputLabel>
                            <Select
                                name="teamLead"
                                multiple
                                value={project.teamLead?.map(tl => tl._id) || []} // Ensure it does not break if empty
                                onChange={(e) => {
                                    const selectedIds = e.target.value; // Array of selected IDs
                                    // Map selected IDs to full objects
                                    const selectedTeamLeads = teamleads.filter(tl => selectedIds.includes(tl._id));
                                    // Ensure state is updated properly
                                    handleChange({ target: { name: "teamLead", value: selectedIds } });
                                }}
                                renderValue={(selectedIds) => {
                                    // Ensure `selectedIds` is an array
                                    if (!Array.isArray(selectedIds)) return "";
                                    // Get selected objects
                                    const selectedObjects = teamleads.filter(tl => selectedIds.includes(tl._id));
                                    return selectedObjects.map(tl => `${tl.firstName} ${tl.lastName}`).join(", ");
                                }}
                            >
                                {teamleads?.length > 0 ? (
                                    teamleads.map((teamLead) => (
                                        <MenuItem key={teamLead._id} value={teamLead._id}>
                                            <Checkbox checked={project.teamLead?.some(tl => tl._id === teamLead._id) || false} />
                                            {teamLead.firstName} {teamLead.lastName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No Team Leads available</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            {bookData ? 'Save Changes' : 'Add Book/Project'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AddProjectForm;
