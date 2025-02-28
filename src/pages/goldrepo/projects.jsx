import { Button, Chip, Grid, IconButton, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DeleteColumnOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Add, AddCircleOutline, DeleteOutline, DeleteOutlineSharp } from '@mui/icons-material';

const GoldRepo = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();

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
    { field: 'title', headerName: 'Book Title', flex: 2 },
    { field: 'author', headerName: 'Author', flex: 1 },
    { field: 'genre', headerName: 'Genre', width: 150 },
    { field: 'publicationDate', headerName: 'Publication Date', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip size='small' variant='outlined' label={params.value} color={getStatusColor(params.value)} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const handleEdit = () => {
          setSelectedRow(params.row);
          navigate('/goldprojects/edit', { state: { bookData: params.row } });
        };

        const handleDelete = () => {
          alert(`Deleting book project: ${params.row.bookTitle}`);
        };
        const handleview = () => {
          setSelectedRow(params.row);
          navigate('/goldprojects/view', { state: { bookData: params.row } });
        };

        return (
          <>
            <IconButton onClick={handleEdit} color="primary">
              <EditOutlined />
            </IconButton>
            <IconButton onClick={handleview} color="warning">
              <EyeOutlined  />
            </IconButton>
            <IconButton onClick={handleDelete} color="error">
              <DeleteOutlineSharp/>

            </IconButton>
           
          </>
        );
      },
    },
  ];

  const handleAddBook = () => {
    navigate('/goldprojects/add', { state: { bookData: null } });
  };

  const rows = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    title: `Book Title ${index + 1}`,
    author: `Author ${index + 1}`,
    genre: ['Fiction', 'Non-Fiction', 'Technology', 'Publishing', 'Science'][index % 5],
    publicationDate: `202${Math.floor(Math.random() * 5) + 1}-0${Math.floor(Math.random() * 9) + 1}-1${Math.floor(Math.random() * 9) + 1}`,
    status: ['Published'],
  }));

  return (
    <Paper sx={{ padding: 2 }}>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <Button endIcon={<AddCircleOutline />} variant="contained" color="primary" onClick={handleAddBook}>
          Add Book/project
        </Button>
      </Grid>
      <DataGrid rows={rows} columns={columns} autoHeight pageSize={10} />
    </Paper>
  );
};

export default GoldRepo;
