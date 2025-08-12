import {
    Box,
    CircularProgress,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getGoldProjectsUser } from 'redux/Slices/goldProjectSliceByUserId';
import moment from 'moment-timezone';

const NoRowsOverlay = () => (
    <Box sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">
            No record found
        </Typography>
    </Box>
);

const GoldRepo = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userRole = useSelector((state) => state.auth.user?.role);
    const { projects, loading } = useSelector((state) => state.goldProjectsUser);

    useEffect(() => {
        if (userRole) {
            dispatch(getGoldProjectsUser(userRole));
        }
    }, [userRole, dispatch]);

    const handleView = (row) => {
        navigate(`/goldprojects/viewAsBook/${row.projectId}`, {
            state: { jsonContent: row.editorContent },
        });
    };

    const columns = [
        { field: 'id', headerName: 'Sl No', width: 70 },
        { field: 'title', headerName: 'Book Title', flex: 2 },
        { field: 'author', headerName: 'Author', flex: 1 },
        { field: 'genre', headerName: 'Genre', width: 150 },
        { field: 'publicationDate', headerName: 'Publication Date', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton onClick={() => handleView(params.row)} color="warning">
                    <EyeOutlined />
                </IconButton>
            ),
        },
    ];

    const rows = (projects || []).map((item, index) => ({
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
    }));

    return (
        <Paper sx={{ padding: 2 }}>
            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                    }}
                >
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    pageSize={10}
                    components={{ NoRowsOverlay }}
                />
            )}
        </Paper>
    );
};

export default GoldRepo;
