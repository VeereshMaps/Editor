import { Button, Chip, Grid, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { DeleteOutlineSharp, EditOutlined, EyeOutlined, AddCircleOutline } from '@mui/icons-material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getProjects } from 'redux/Slices/projectSlice';
import { archiveProjectsFunc } from 'redux/Slices/archiveProjectSlice';
import { elevatedAccess, formattedUserRole, superAccess } from 'api/menu';



const BooksRepo = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteProjectId, setDeleteProjectId] = useState(null);
    const loginDetails = useSelector((state) => state.auth);
    const projectDetails = useSelector((state) => state.projects);

    useEffect(() => {
        if (loginDetails?.user) {
            projectDataAPI(loginDetails?.user);
        }
    }, []);

    const projectDataAPI = async (userData) => {
        try {
            await dispatch(getProjects(userData.role));
        } catch (error) {
            console.log("getting project error", error);
        }
    };

    const handleDeleteClick = (projectId) => {
        setDeleteProjectId(projectId);
        setOpenDialog(true);
    };

    const confirmDelete = async () => {
        if (!deleteProjectId) return;
        try {
            await dispatch(archiveProjectsFunc(deleteProjectId)).then(() => {
                projectDataAPI(loginDetails?.user);
            });
        } catch (error) {
            console.log("unable to delete project", error);
        } finally {
            setOpenDialog(false);
            setDeleteProjectId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'success';
            case 'Editing': return 'warning';
            case 'In Progress': return 'primary';
            case 'Review': return 'error';
            default: return 'default';
        }
    };

    const columns = [
        { field: 'id', headerName: 'Sl No', width: 70 },
        { field: 'title', headerName: 'Book Title', flex: 2 },
        { field: 'author', headerName: 'Author', flex: 1 },
        { field: 'genre', headerName: 'Genre', width: 150 },
        { field: 'publicationDate', headerName: 'Publication Date', width: 150 },
        // {
        //     field: 'status',
        //     headerName: 'Status',
        //     width: 130,
        //     renderCell: (params) => (
        //         <Chip size='small' variant='outlined' label={params.value} color={getStatusColor(params.value)} />
        //     ),
        // },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => {
                const handleEdit = () => {
                    setSelectedRow(params.row);
                    navigate('/projects/edit', { state: { bookData: params.row } });
                };

                const handleview = () => {
                    setSelectedRow(params.row);
                    navigate('/projects/view', { state: { bookData: params.row } });
                };

                return (
                    <>
                        {formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) &&
                            (loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess ||
                                loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === elevatedAccess) && (
                                <IconButton onClick={handleEdit} color="primary">
                                    <EditOutlined />
                                </IconButton>
                            )}
                        <IconButton onClick={handleview} color="warning">
                            <EyeOutlined />
                        </IconButton>
                        {formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) &&
                            loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess && (
                                <IconButton onClick={() => handleDeleteClick(params.row.projectId)} color="error">
                                    <DeleteOutline />
                                </IconButton>
                            )}
                    </>
                );
            },
        },
    ];

    const handleAddBook = () => {
        navigate('/projects/add', { state: { bookData: null } });
    };

    const rows = projectDetails?.projects?.map((item, index) => ({
        id: index + 1,
        title: item.title,
        originLanguage: `${item?.originLanguage || "N/A"}`,
        author: `${item.author?.firstName || "N/A"} ${item.author?.lastName || ""}`.trim(),
        editor: `${item.editor?.firstName || "N/A"} ${item.editor?.lastName || ""}`.trim(),
        projectManager: `${item.projectManager?.firstName || "N/A"} ${item.projectManager?.lastName || ""}`.trim(),
        proofReader: item.proofReader ? `${item.proofReader.firstName} ${item.proofReader.lastName}` : "N/A",
        designer: item.designer ? `${item.designer.firstName} ${item.designer.lastName}` : null,
        teamLead: Array.isArray(item.teamLead)
            ? item.teamLead.map(tl => `${tl.firstName} ${tl.lastName}`)
            : item.teamLead
                ? [`${item.teamLead.firstName} ${item.teamLead.lastName}`]
                : [],
        genre: ["Fiction", "Non-Fiction", "Technology", "Publishing", "Science"][index % 5],
        publicationDate: item.publicationDate ? new Date(item.publicationDate).toISOString().split("T")[0] : null,
        status: item.status || "Unknown",
        projectId: item._id
    })) || [];

    return (
        <Paper sx={{ padding: 2 }}>
            <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
                {formattedUserRole.includes(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase()) &&
                    (loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === superAccess ||
                        loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === "project manager") && (
                        <Button endIcon={<AddCircleOutline />} variant="contained" color="primary" onClick={handleAddBook}>
                            Add Book/Project
                        </Button>
                    )}
            </Grid>
            {projectDetails?.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <DataGrid rows={rows} columns={columns}  pageSize={10} style={{height:'100%',maxHeight:'75vh'}} />
            )}


            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this project?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Yes, Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default BooksRepo;