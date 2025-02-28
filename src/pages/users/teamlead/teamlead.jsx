import { Button, Grid, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditOutlined, DeleteOutlineSharp } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';
import { deleteUserDetailsFunc } from 'redux/Slices/deleteUserSlice';

export default function TeamLead() {
    const dispatch = useDispatch();
    const roleBasedOrAllUsers = useSelector((state) => state.roleBasedOrAllUsers);
    const [selectedRow, setSelectedRow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            await dispatch(getRoleBasedOrAllUsers('teamLead'));
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setOpenDialog(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await dispatch(deleteUserDetailsFunc({ userId: userToDelete.userId }));
                await dispatch(getRoleBasedOrAllUsers('teamLead'));
            } catch (error) {
                console.log('Could not delete user', error);
            } finally {
                setOpenDialog(false);
                setUserToDelete(null);
            }
        }
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
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => navigate('/users/add-teamlead', { state: { authorData: params.row } })} color='primary'>
                        <EditOutlined />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row)} color="error">
                        <DeleteOutlineSharp />
                    </IconButton>
                </>
            ),
        }
    ];

    const handleAddAuthor = () => {
        navigate('/users/add-teamlead', { state: { authorData: null } });
    };

    const rows = roleBasedOrAllUsers?.data?.map((item, index) => ({
        id: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        userId: item._id
    }));

    return (
        <>
            <Grid item container justifyContent="flex-end">
                <Button
                    onClick={handleAddAuthor}
                    disableElevation
                    fullWidth
                    size="large"
                    variant="contained"
                    color="primary"
                    sx={{ maxWidth: '150px', width: 'auto', marginBottom: 2 }}
                >
                    Add TeamLead
                </Button>
            </Grid>
            <Paper sx={{ height: '80%', width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold' },
                    }}
                />
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}