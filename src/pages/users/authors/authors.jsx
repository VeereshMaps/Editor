import { Button, Grid, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditOutlined, DeleteOutlineSharp } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';
import { deleteUserDetailsFunc } from 'redux/Slices/deleteUserSlice';

export default function Authors() {
    const dispatch = useDispatch();
    const roleBasedOrAllUsers = useSelector((state) => state.roleBasedOrAllUsers);
    const navigate = useNavigate();

    const [selectedRow, setSelectedRow] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            await dispatch(getRoleBasedOrAllUsers('author'));
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const deletePayload = { userId: deleteTarget.userId };

        try {
            await dispatch(deleteUserDetailsFunc(deletePayload));
            await dispatch(getRoleBasedOrAllUsers('author'));
        } catch (error) {
            console.log('Couldn’t delete user', error);
        } finally {
            setOpenDeleteDialog(false);
            setDeleteTarget(null);
        }
    };

    const handleOpenDeleteDialog = (row) => {
        setDeleteTarget(row);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteTarget(null);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email Address', flex: 2 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 150,
            renderCell: (params) => {
                const handleEdit = () => {
                    setSelectedRow(params.row);
                    navigate('/users/add-author', { state: { authorData: params.row } });
                };

                return (
                    <>
                        <IconButton onClick={handleEdit} color='primary' variant="contained">
                            <EditOutlined />
                        </IconButton>
                        <IconButton variant="outlined" onClick={() => handleOpenDeleteDialog(params.row)} color="error">
                            <DeleteOutlineSharp twotonecolor={'red'} />
                        </IconButton>
                    </>
                );
            },
        }
    ];

    const handleAddAuthor = () => {
        navigate('/users/add-author', { state: { authorData: null } });
    };

    const rows = roleBasedOrAllUsers?.data?.map((item, index) => ({
        id: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        role: item.role,
        country: item.country,
        bio: item.bio,
        userId: item._id,
        password:item.password
    }));

    const paginationModel = { page: 0, pageSize: 15 };

    return (
        <>
            <Grid item container justifyContent="flex-end">
                <Button
                    onClick={handleAddAuthor}
                    disableElevation
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ maxWidth: '150px', width: 'auto', marginBottom: 2 }}
                >
                    Add Author
                </Button>
            </Grid>
            <Paper sx={{ height: '80%', width: '100%' }}>
                {roleBasedOrAllUsers?.status === "loading" ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this author? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
