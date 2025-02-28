import { Button, Grid, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditOutlined, DeleteOutlineSharp } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';
import { deleteUserDetailsFunc } from 'redux/Slices/deleteUserSlice';

export default function ProjectManager() {
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
            await dispatch(getRoleBasedOrAllUsers('Project Manager'));
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleEdit = (row) => {
        setSelectedRow(row);
        navigate('/users/add-manager', { state: { authorData: row } });
    };

    const handleDeleteClick = (row) => {
        setUserToDelete(row);
        setOpenDialog(true); // Open confirmation dialog
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            const deletePayload = { userId: userToDelete.userId };
            try {
                await dispatch(deleteUserDetailsFunc(deletePayload));
                await dispatch(getRoleBasedOrAllUsers('Project Manager'));
            } catch (error) {
                console.log('Cannot delete user', error);
            }
            setOpenDialog(false);
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
                    <IconButton onClick={() => handleEdit(params.row)} color='primary'>
                        <EditOutlined />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row)} color="error">
                        <DeleteOutlineSharp />
                    </IconButton>
                </>
            ),
        }
    ];

    const rows = roleBasedOrAllUsers?.data?.map((item, index) => ({
        id: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        role: item.role,
        userId: item._id
    }));

    return (
        <>
            <Grid container justifyContent="flex-end">
                <Button
                    onClick={() => navigate('/users/add-manager', { state: { authorData: null } })}
                    variant="contained"
                    color="primary"
                    sx={{ maxWidth: '150px', width: 'auto', marginBottom: 2 }}
                >
                    Add Manager
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
                        Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}