import { Box, Button, Chip, CircularProgress, Grid, IconButton, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DeleteColumnOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Add, AddCircleOutline, DeleteOutline, DeleteOutlineSharp } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getEditions } from '../../redux/Slices/editionSlice';
import moment from 'moment-timezone';
import { getGoldProjects } from 'redux/Slices/goldProjectSlice';

const GoldRepo = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(null);
    const allGoldProjects = useSelector((state) => state.goldProjects);
    const loginDetails = useSelector((state) => state.auth);

    useEffect(() => {
        getEditionFunc();
    }, []);

    const filteredGoldEditions = allGoldProjects.projects.filter(item => {
        const projectValues = Object.values(item.projectID || {});
        const hasMatchingId = projectValues.some(value =>
            value?.toString() === loginDetails.user._id.toString()
        );

        return hasMatchingId;
    });

    const getEditionFunc = async () => {
        try {
            await dispatch(getGoldProjects());
        } catch (error) {
            console.log('getting editions error', error);
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published':
                return 'success'; // Green
            case 'Editing':
                return 'success'; // Yellow
            case 'In Progress':
                return 'success'; // Blue
            case 'Review':
                return 'success'; // Red
            default:
                return 'success';
        }
    };

    const columns = [
        { field: 'id', headerName: 'Sl No.', width: 70 },
        { field: 'title', headerName: 'Project Title', flex: 2 },
        { field: 'versionTitle', headerName: 'Version Title', flex: 2 },
        { field: 'publisher', headerName: 'Publisher', flex: 1 },
        { field: 'subject', headerName: 'Subject', width: 150 },
        { field: 'publicationDate', headerName: 'Edition Publication Date', width: 150 },
        // {
        //   field: 'status',
        //   headerName: 'Status',
        //   width: 130,
        //   renderCell: (params) => (
        //     <Chip size='small' variant='outlined' label={params.value} color={getStatusColor(params.value)} />
        //   ),
        // },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => {
                // const handleEdit = () => {
                //   setSelectedRow(params.row);
                //   navigate('/goldprojects/edit', { state: { bookData: params.row } });
                // };

                // const handleDelete = () => {
                //   alert(`Deleting book project: ${params.row.bookTitle}`);
                // };
                const handleview = () => {
                    setSelectedRow(params.row);
                    navigate('/goldprojects/view', { state: { bookData: params.row } });
                };

                return (
                    <>
                        {/* <IconButton onClick={handleEdit} color="primary">
              <EditOutlined />
            </IconButton> */}
                        <IconButton onClick={handleview} color="warning">
                            <EyeOutlined />
                        </IconButton>
                        {/* <IconButton onClick={handleDelete} color="error">
              <DeleteOutlineSharp/>
            </IconButton> */}

                    </>
                );
            },
        },
    ];

    const handleAddBook = () => {
        navigate('/goldprojects/add', { state: { bookData: null } });
    };

    const isAdminOrPM = loginDetails?.user?.role === "Admin" || loginDetails?.user?.role === "Project Manager";
    const dataSource = isAdminOrPM ? allGoldProjects : filteredGoldEditions;

    const rows = dataSource?.projects?.map((item, index) => {
        return {
        id: index + 1,
        title: item.project.title,
        versionTitle: item.title,
        publisher: item.publisher,
        subject: item.subject,
        publicationDate: moment(item.publicationDate).format("DD-MM-YYYY"),
        versions: item.versions,
        versionId: item._id
        }
    });


    return (
        <Paper sx={{ padding: 2 }}>
            {/* <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <Button endIcon={<AddCircleOutline />} variant="contained" color="primary" onClick={handleAddBook}>
          Add Book/project
        </Button>
      </Grid> */}
            {dataSource?.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress color="primary" />
                </Box>

            ) : (
                <DataGrid rows={rows} columns={columns} autoHeight pageSize={10} />
            )}
        </Paper>
    );
};

export default GoldRepo;
