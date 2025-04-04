import { Button, Grid, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Box, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { EditOutlined, DeleteOutlineSharp } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';
import { deleteUserDetailsFunc } from 'redux/Slices/deleteUserSlice';

export default function TeamMember() {
    const dispatch = useDispatch();
    const roleBasedOrAllUsers = useSelector((state) => state.roleBasedOrAllUsers);
    const navigate = useNavigate();

    const [selectedRow, setSelectedRow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [roleFilter, setRoleFilter] = useState(''); // Filter state

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            await dispatch(getRoleBasedOrAllUsers('designer,editor,proofReader'));
        } catch (error) {
            console.log("error", error);
        }
    };

    const handleEdit = (row) => {
        setSelectedRow(row);
        navigate('/users/add-reader', { state: { authorData: row } });
    };

    const handleDeleteClick = (row) => {
        setUserToDelete(row);
        setOpenDialog(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            const deletePayload = { userId: userToDelete.userId };
            try {
                await dispatch(deleteUserDetailsFunc(deletePayload));
                await dispatch(getRoleBasedOrAllUsers('teamMember'));
            } catch (error) {
                console.log('Could not delete user', error);
            }
            setOpenDialog(false);
            setUserToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setOpenDialog(false);
        setUserToDelete(null);
    };

    const handleRoleFilterChange = (event) => {
        setRoleFilter(event.target.value);
    };

    const columns = [
        { field: 'id', headerName: 'Sl No', width: 70 },
        { field: 'firstName', headerName: 'First Name', flex: 1 },
        { field: 'lastName', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email Address', flex: 2 },
        { field: 'role', headerName: 'Role', width: 120, sortable: true },
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

    const allRows = roleBasedOrAllUsers?.data?.map((item, index) => ({
        id: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        role: item.role,
        country: item.country,
        userId: item._id,
        bio: item.bio,
        password:item.password
    }));

    // Apply role filter
    const filteredRows = roleFilter ? allRows.filter(row => row.role === roleFilter) : allRows;


    const handleAddAuthor = () => {
        navigate('/users/add-reader', { state: { authorData: null } });
    };

    return (
        <>
            {/* Role Filter */}
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
                        <InputLabel style={{ marginTop: 6 }}>Filter by Role</InputLabel>
                        <Select
                            value={roleFilter}
                            onChange={handleRoleFilterChange}
                            label="Filter by Role"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="designer">Designer</MenuItem>
                            <MenuItem value="editor">Editor</MenuItem>
                            <MenuItem value="proofReader">Proof Reader</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button
                        onClick={handleAddAuthor}
                        disableElevation
                        size="large"
                        variant="contained"
                        color="primary"
                        sx={{ maxWidth: 'auto', width: 'auto' }}
                    >
                        Add Team Member
                    </Button>
                </Grid>
            </Grid>

            <Paper sx={{ height: '80%', width: '100%' }}>
                {roleBasedOrAllUsers?.status === "loading" ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
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

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this user?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}