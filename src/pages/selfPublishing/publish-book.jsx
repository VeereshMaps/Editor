// components/DocxUploader.js
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocxFile } from "../../redux/Slices/docxParserSlice";
import { Button, Grid, Paper, CircularProgress, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, FormControl, Select, MenuItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import { AddCircleOutline } from "@mui/icons-material";

const DocxUploader = () => {
    const dispatch = useDispatch();
    const [dropDownVals, setDropDownVals] = useState({});
    const [selectedKeys, setSelectedKeys] = useState({});
    const fileInputRef = useRef(null);

    const { status, error, parsedData } = useSelector((state) => state.docxParser);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            alert("Only .docx files are allowed.");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            alert("File size should be less than 20MB.");
            return;
        }

        dispatch(uploadDocxFile(file));
    };

    const renderRows = (key, value) => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            return (
                <>
                    <TableRow>
                        {/* <TableCell colSpan={2}>
                            <Typography fontWeight="bold">{key}</Typography>
                        </TableCell> */}
                    </TableRow>
                    {value.map((obj, i) => (
                          <TableRow key={`row-${key}-${i}`}>
                            <TableCell>
                                <FormControl fullWidth>
                                    <Select
                                        value={dropDownVals[i] ?? obj.type}
                                        onChange={(e) => {
                                            setDropDownVals(prev => ({
                                                ...prev,
                                                [i]: e.target.value
                                            }));
                                        }}
                                        size="small"
                                    >
                                        <MenuItem value="text">Text</MenuItem>
                                        <MenuItem value="list">List</MenuItem>
                                        <MenuItem value="table">Table</MenuItem>
                                    </Select>
                                </FormControl>

                            </TableCell>
                            {obj.type === "list" ?
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    {obj.items.map((li, liIdx) => {
                                        return (
                                            <li key={`list-${key}-${i}-${liIdx}`}>
                                                <Typography variant="body2">{li}</Typography>
                                            </li>
                                        )
                                    })}
                                </ul>
                                : obj.type === "table" ?
                                <Table size="small">
                                <TableBody>
                                  {obj.rows.map((row, rIdx) => (
                                    <TableRow key={`tablerow-${key}-${i}-${rIdx}`}>
                                      {row.map((cell, cIdx) => (
                                        <TableCell
                                          key={`cell-${rIdx}-${cIdx}`}
                                          sx={{
                                            border: '1px solid #ccc',
                                            padding: '6px 8px',
                                          }}
                                        >
                                          <Typography variant="body2">{cell}</Typography>
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>                              
                                    : <TableCell>{obj.content}</TableCell>
                            }

                        </TableRow>
                    ))}
                </>
            );
        } else {
            return (
                <TableRow>
                    <TableCell>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedKeys[key] || key}
                                onChange={(e) =>
                                    setSelectedKeys((prev) => ({
                                        ...prev,
                                        [key]: e.target.value,
                                    }))
                                }
                            >
                                {Object.keys(parsedData).map((k) => (
                                    <MenuItem key={k} value={k}>
                                        {k}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </TableCell>
                    <TableCell>{Array.isArray(value) ? JSON.stringify(value) : value}</TableCell>
                </TableRow>
            );
        }
    };

    return (
        <Paper sx={{ padding: 2 }}>
            {/* Upload Button */}
            <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    endIcon={<AddCircleOutline />}
                >
                    Upload DOCX
                    <input
                        type="file"
                        accept=".docx"
                        ref={fileInputRef}
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
            </Grid>

            {/* Status Display */}
            {status === "loading" ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : status === "success" && parsedData ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            {Object.entries(parsedData).map(([key, value]) => renderRows(key, value))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null
            }
        </Paper>
    );
};

export default DocxUploader;
