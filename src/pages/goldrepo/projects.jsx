import { Button, Chip, Grid, IconButton, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DeleteColumnOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Add, AddCircleOutline, DeleteOutline, DeleteOutlineSharp } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getEditions } from '../../redux/Slices/editionSlice';
import moment from 'moment-timezone';

const GoldRepo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(null);
  const allGoldEditions = useSelector((state) => state.editions.projects.filter(project => project.status === "Gold").sort((a, b) => new Date(a.publicationDate) - new Date(b.publicationDate)));

  useEffect(()=>{
    getEditionFunc();
  },[]);

  useEffect(()=>{
    console.log("-----",allGoldEditions);
  },[allGoldEditions])

  const getEditionFunc = async() => {
    try {
        await dispatch(getEditions());
    } catch (error) {
        console.log('getting editions error',error);
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
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Project Title', flex: 2 },
    { field: 'versionTitle', headerName: 'Version Title', flex: 2 },
    { field: 'publisher', headerName: 'Publisher', flex: 1 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'publicationDate', headerName: 'Publication Date', width: 150 },
    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   width: 130,
    //   renderCell: (params) => (
    //     <Chip size='small' variant='outlined' label={params.value} color={getStatusColor(params.value)} />
    //   ),
    // },
    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   width: 150,
    //   sortable: false,
    //   renderCell: (params) => {
    //     const handleEdit = () => {
    //       setSelectedRow(params.row);
    //       navigate('/goldprojects/edit', { state: { bookData: params.row } });
    //     };

    //     const handleDelete = () => {
    //       alert(`Deleting book project: ${params.row.bookTitle}`);
    //     };
    //     const handleview = () => {
    //       setSelectedRow(params.row);
    //       navigate('/goldprojects/view', { state: { bookData: params.row } });
    //     };

    //     return (
    //       <>
    //         <IconButton onClick={handleEdit} color="primary">
    //           <EditOutlined />
    //         </IconButton>
    //         <IconButton onClick={handleview} color="warning">
    //           <EyeOutlined  />
    //         </IconButton>
    //         <IconButton onClick={handleDelete} color="error">
    //           <DeleteOutlineSharp/>

    //         </IconButton>
           
    //       </>
    //     );
    //   },
    // },
  ];

  const handleAddBook = () => {
    navigate('/goldprojects/add', { state: { bookData: null } });
  };

  const rows = allGoldEditions.map((item, index) => ({
    id: index + 1,
    title: item.projectID.title,
    versionTitle: item.title,
    publisher: item.publisher,
    subject: item.subject,
    publicationDate: moment(item.publicationDate).format("DD-MM-YYYY"),
}));

  return (
    <Paper sx={{ padding: 2 }}>
      {/* <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <Button endIcon={<AddCircleOutline />} variant="contained" color="primary" onClick={handleAddBook}>
          Add Book/project
        </Button>
      </Grid> */}
      <DataGrid rows={rows} columns={columns} autoHeight pageSize={10} />
    </Paper>
  );
};

export default GoldRepo;
