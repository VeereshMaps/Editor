import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    IconButton,
    Tooltip,
    Divider,
    Typography,
    ButtonGroup
} from '@mui/material';
import {
    TableRows,
    TableView,
    Delete,
    AddBox,
    IndeterminateCheckBox,
    ViewColumn,
    SwapVert,
    MergeType,
    CallSplit,
    BorderAll,
    BorderOuter,
    BorderInner
} from '@mui/icons-material';

const TableControls = ({ editor, isTableActive }) => {
    // console.log("isTableActive:", isTableActive);
    // console.log("editor:", editor);
    const [tooltipPosition, setTooltipPosition] = useState(null);
    useEffect(() => {
        if (!editor || editor.state.selection.empty) {
            setTooltipPosition(null);
            return;
        }

        const { from } = editor.state.selection;
        const start = editor.view.coordsAtPos(from); // get DOM coords

        const editorEl = editor.view.dom.getBoundingClientRect();

        setTooltipPosition({
            top: start.top - editorEl.top + 25, // offset below selection
            left: start.left - editorEl.left,
        });
    }, [editor?.state.selection, isTableActive]);

    if (!editor || !isTableActive) return null;
    const buttonStyle = {
        backgroundColor: 'rgba(103, 126, 234, 0.1)',
        color: '#667eea',
        border: '1px solid rgba(103, 126, 234, 0.3)',
        '&:hover': {
            backgroundColor: 'rgba(103, 126, 234, 0.2)',
            borderColor: 'rgba(103, 126, 234, 0.5)'
        },
        '&:disabled': {
            color: 'rgba(0,0,0,0.3)',
            borderColor: 'rgba(0,0,0,0.1)'
        }
    };

    return (
        <Paper
            elevation={3}
            style={{ top: tooltipPosition?.top + "px" }}
            // className='capsule-comment'
            sx={{
                position: 'absolute',
                // top: '70px',
                right: '20px',
                zIndex: 1300,
                p: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                border: '1px solid rgba(103, 126, 234, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(103, 126, 234, 0.15)',
                backdropFilter: 'blur(10px)',
                minWidth: '200px'
            }}
        >
            <Typography
                variant="subtitle2"
                sx={{
                    color: '#667eea',
                    fontWeight: 'bold',
                    mb: 1,
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}
            >
                Table Controls
            </Typography>

            {/* Row Controls */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    Rows
                </Typography>
                <ButtonGroup size="small" sx={{ width: '100%' }}>
                    <Tooltip title="Add Row Above">
                        <IconButton
                            onClick={() => editor.chain().focus().addRowBefore().run()}
                            sx={buttonStyle}
                        >
                            <AddBox />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Row Below">
                        <IconButton
                            onClick={() => editor.chain().focus().addRowAfter().run()}
                            sx={buttonStyle}
                        >
                            <TableRows />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Row">
                        <IconButton
                            onClick={() => editor.chain().focus().deleteRow().run()}
                            sx={{
                                ...buttonStyle,
                                color: '#d32f2f',
                                borderColor: 'rgba(211, 47, 47, 0.3)',
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: 'rgba(211, 47, 47, 0.5)'
                                }
                            }}
                        >
                            <IndeterminateCheckBox />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Column Controls */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    Columns
                </Typography>
                <ButtonGroup size="small" sx={{ width: '100%' }}>
                    <Tooltip title="Add Column Before">
                        <IconButton
                            onClick={() => editor.chain().focus().addColumnBefore().run()}
                            sx={buttonStyle}
                        >
                            <AddBox />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Column After">
                        <IconButton
                            onClick={() => editor.chain().focus().addColumnAfter().run()}
                            sx={buttonStyle}
                        >
                            <ViewColumn />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Column">
                        <IconButton
                            onClick={() => editor.chain().focus().deleteColumn().run()}
                            sx={{
                                ...buttonStyle,
                                color: '#d32f2f',
                                borderColor: 'rgba(211, 47, 47, 0.3)',
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: 'rgba(211, 47, 47, 0.5)'
                                }
                            }}
                        >
                            <IndeterminateCheckBox />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Cell Controls */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    Cells
                </Typography>
                <ButtonGroup size="small" sx={{ width: '100%', mb: 1 }}>
                    <Tooltip title="Merge Cells">
                        <IconButton
                            onClick={() => editor.chain().focus().mergeCells().run()}
                            sx={buttonStyle}
                        >
                            <MergeType />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Split Cell">
                        <IconButton
                            onClick={() => editor.chain().focus().splitCell().run()}
                            sx={buttonStyle}
                        >
                            <CallSplit />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Merge or Split">
                        <IconButton
                            onClick={() => editor.chain().focus().mergeOrSplit().run()}
                            sx={buttonStyle}
                        >
                            <SwapVert />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Header Controls */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    Headers
                </Typography>
                <ButtonGroup size="small" sx={{ width: '100%', mb: 1 }}>
                    <Tooltip title="Toggle Header Row">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                            sx={buttonStyle}
                        >
                            <BorderOuter />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Header Column">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                            sx={buttonStyle}
                        >
                            <BorderInner />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Header Cell">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
                            sx={buttonStyle}
                        >
                            <BorderAll />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Navigation Controls */}
            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
                    Navigate
                </Typography>
                <ButtonGroup size="small" sx={{ width: '100%', mb: 1 }}>
                    <Tooltip title="Previous Cell">
                        <IconButton
                            onClick={() => editor.chain().focus().goToPreviousCell().run()}
                            sx={buttonStyle}
                        >
                            ←
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Next Cell">
                        <IconButton
                            onClick={() => editor.chain().focus().goToNextCell().run()}
                            sx={buttonStyle}
                        >
                            →
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Fix Tables">
                        <IconButton
                            onClick={() => editor.chain().focus().fixTables().run()}
                            sx={buttonStyle}
                        >
                            🔧
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Delete Table */}
            <Box>
                <Tooltip title="Delete Entire Table">
                    <IconButton
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        sx={{
                            width: '100%',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            color: '#d32f2f',
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.2)',
                                borderColor: 'rgba(211, 47, 47, 0.5)'
                            }
                        }}
                    >
                        <Delete sx={{ mr: 1 }} />
                        Delete Table
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default TableControls;