import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Box, Button, CircularProgress, Menu, MenuItem, Typography, Switch } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import HighlightIcon from '@mui/icons-material/Highlight';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CommentIcon from '@mui/icons-material/Comment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CheckCircleOutline, CheckCircleOutlineOutlined, DeleteOutline, UploadFile } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

export const MenuBar = ({ editor, createThread, handleImageUpload, handleImportClick, handleImportFilePick, importRef, aiLoading, loadAiSuggestions, editionsById, handleApprovalClick, actionType, sideBarMenu }) => {
    const navigate = useNavigate();
    const loginDetails = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mode, setMode] = useState('');
    const label = { inputProps: { 'aria-label': 'Menu' } };
    const [toggleAction, setToggleAction] = useState(false);
    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    const isEditor = ((roleName === "author" || roleName === "editor"));
    const modeOptions = [
        {
            label: 'Editing',
            icon: <EditIcon fontSize="small" />,
        },
        {
            label: 'History',
            icon: <HistoryIcon fontSize="small" sx={{ mr: 1 }} />,
        },
        {
            label: 'Suggesting',
            icon: <EditIcon fontSize="small" />,
        },
        {
            label: 'View',
            icon: <VisibilityIcon fontSize="small" />,
        },
    ];

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuSelect = (option) => {
        setMode(option);
        setAnchorEl(null);
        actionType(option); // optionally trigger versioning modal
    };



    if (!editor) return null;
    useEffect(() => {

        console.log("AJDHHDHDH", isEditor, editionsById?.editions?.isAuthorApproved);

        if (isEditor) {
            setMode("Editing")
        } else {
            setMode("View")
        }
    }, [editionsById, roleName, editor]);


    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor: '#f9f9f9',
                justifyContent: 'space-between',
                borderBottom: '1px solid #ddd',
                px: 1,
                py: 0.5,
                borderRadius: '8px 8px 0 0',
                // pointerEvents: editor?.isEditable ? 'auto' : 'none',
                // opacity: editor?.isEditable ? 1 : 0.5,
            }}
        >
            {mode === 'Editing' && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    {/* Upload DOCX */}
                    {(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === "editor") &&
                        (
                            <>
                                <Tooltip title="Upload DOCX">
                                    <Button
                                        variant="outlined"
                                        startIcon={<UploadFile />}
                                        onClick={handleImportClick}
                                        size="small"
                                        sx={{
                                            marginRight: 1,
                                            minWidth: 'auto', // ensure width is only based on content
                                            px: 1.5, // optional: adjust horizontal padding if too narrow or wide
                                        }}
                                    >
                                        Upload Docx
                                    </Button>
                                    <input
                                        type="file"
                                        ref={importRef}
                                        onChange={handleImportFilePick}
                                        style={{ display: "none" }}
                                    />
                                </Tooltip>

                                {/* Proof Read */}
                                <Tooltip title="Proof">
                                    <div>
                                        <Button
                                            variant="outlined"
                                            startIcon={aiLoading ? <CircularProgress size={16} /> : <CheckCircleOutline style={{ color: "green" }} />}
                                            onClick={loadAiSuggestions}
                                            size="small"
                                            disabled={aiLoading}
                                            sx={{
                                                minWidth: 'auto',
                                                px: 1.5,
                                            }}
                                        >
                                            {aiLoading ? 'Loading...' : 'Proof Read with AI'}
                                        </Button>
                                    </div>
                                </Tooltip>
                            </>
                        )
                    }


                    {/* Apply All Suggestions */}
                    {/* <Tooltip title="Apply All Suggestions">
                <IconButton onClick={() => editor.commands.applyAllAiSuggestions()}>
                    Apply All AI Suggestions
                </IconButton>
            </Tooltip> */}
                    {editor &&
                        (
                            <>
                                {/* <Tooltip title="Proof">
                            <Button
                                variant="outlined"
                                startIcon={<CheckCircleOutline />}
                                onClick={() => editor.commands.applyAllAiSuggestions()}
                                size="small"
                                sx={{
                                    marginLeft: 1,
                                    minWidth: 'auto', // ensure width is only based on content
                                    px: 1.5, // optional: adjust horizontal padding if too narrow or wide
                                }}
                            >
                                Apply All AI Suggestions
                            </Button>
                        </Tooltip> */}
                                {/* <Tooltip title="Clear Suggestions">
                            <Button
                                variant="outlined"
                                startIcon={<DeleteOutline />}
                                onClick={() => setShowSuggestions(false)}
                                size="small"
                                sx={{
                                    marginLeft: 1,
                                    minWidth: 'auto', // ensure width is only based on content
                                    px: 1.5, // optional: adjust horizontal padding if too narrow or wide
                                }}
                            >
                                Clear All AI Suggestions
                            </Button>
                        </Tooltip> */}
                            </>
                        )}
                    {/* Bold */}
                    <Tooltip title="Bold">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            color={editor.isActive('bold') ? 'primary' : 'default'}
                        >
                            <FormatBoldIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Italic */}
                    <Tooltip title="Italic">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            color={editor.isActive('italic') ? 'primary' : 'default'}
                        >
                            <FormatItalicIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Heading */}
                    <Tooltip title="Heading 1">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                        >
                            <TitleIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Bullet List */}
                    <Tooltip title="Bullet List">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            color={editor.isActive('bulletList') ? 'primary' : 'default'}
                        >
                            <FormatListBulletedIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Numbered List */}
                    <Tooltip title="Numbered List">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            color={editor.isActive('orderedList') ? 'primary' : 'default'}
                        >
                            <FormatListNumberedIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Clear Formatting */}
                    <Tooltip title="Clear Formatting">
                        <IconButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
                            <ClearAllIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Undo */}
                    <Tooltip title="Undo">
                        <IconButton onClick={() => editor.commands.undo()}>
                            <UndoIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Redo */}
                    <Tooltip title="Redo">
                        <IconButton onClick={() => editor.commands.redo()}>
                            <RedoIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Underline */}
                    <Tooltip title="Underline">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            color={editor.isActive('underline') ? 'primary' : 'default'}
                        >
                            <FormatUnderlinedIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Strike-through */}
                    <Tooltip title="Strike-through">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            color={editor.isActive('strike') ? 'primary' : 'default'}
                        >
                            <StrikethroughSIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Highlight */}
                    <Tooltip title="Highlight">
                        <IconButton
                            onClick={() => editor.chain().focus().toggleHighlight().run()}
                            color={editor.isActive('highlight') ? 'primary' : 'default'}
                        >
                            <HighlightIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Align Left */}
                    <Tooltip title="Align Left">
                        <IconButton
                            onClick={() => editor.chain().focus().setTextAlign("left").run()}
                            color={editor.isActive({ textAlign: "left" }) ? 'primary' : 'default'}
                        >
                            <FormatAlignLeftIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Align Center */}
                    <Tooltip title="Align Center">
                        <IconButton
                            onClick={() => editor.chain().focus().setTextAlign("center").run()}
                            color={editor.isActive({ textAlign: "center" }) ? 'primary' : 'default'}
                        >
                            <FormatAlignCenterIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Align Right */}
                    <Tooltip title="Align Right">
                        <IconButton
                            onClick={() => editor.chain().focus().setTextAlign("right").run()}
                            color={editor.isActive({ textAlign: "right" }) ? 'primary' : 'default'}
                        >
                            <FormatAlignRightIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Insert Link */}
                    <Tooltip title="Insert Link">
                        <IconButton
                            onClick={() => {
                                const url = window.prompt("Enter the URL");
                                if (url) editor.chain().focus().setLink({ href: url }).run();
                            }}
                            color={editor.isActive('link') ? 'primary' : 'default'}
                        >
                            <InsertLinkIcon />
                        </IconButton>
                    </Tooltip>
                    {/* Insert Image */}
                    <Tooltip title="Insert Image">
                        <span>
                            <IconButton onClick={() => document.getElementById("image-upload-input").click()}>
                                <ImageIcon />
                            </IconButton>
                            <input
                                type="file"
                                id="image-upload-input"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />
                        </span>
                    </Tooltip>


                    {/* <Tooltip title="Save">
                <IconButton
                    onClick={() => {
                        // replace with your save logic
                        console.log("Saving content...");
                        const content = editor.getJSON(); // or editor.getHTML()
                        console.log("Saved content:", content);
                    }}
                    color="primary"
                >
                    <SaveIcon />
                </IconButton>
            </Tooltip> */}

                    {/* 📝 New Add Comment Button */}
                    <Tooltip title="Add Comment">
                        <div>
                            <IconButton
                                onClick={createThread}
                                disabled={editor.state.selection.empty}
                            >
                                <CommentIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                    {loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === "author" ? (
                        editionsById?.editions?.isEditorApproved && (
                            <Tooltip title="Approve as Author">
                                <div>
                                    <IconButton
                                        onClick={handleApprovalClick}
                                        color={editionsById?.editions?.isAuthorApproved ? "success" : "default"}
                                        sx={editionsById?.editions?.isAuthorApproved ? { pointerEvents: "none" } : {}}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        )
                    ) : (
                        <Tooltip title="Approve as Editor">
                            <div>
                                <IconButton
                                    onClick={handleApprovalClick}
                                    color={editionsById?.editions?.isEditorApproved ? "success" : "default"}
                                    sx={editionsById?.editions?.isEditorApproved ? { pointerEvents: "none" } : {}}
                                >
                                    <CheckCircleIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    )}


                    {/* View as Book */}
                    {/* {(loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === "editor") &&
                <Tooltip title="View as Book">
                    <IconButton
                        onClick={() => {
                            // replace with your view as book logic

                            const content = editor.getJSON(); // or editor.getHTML()
                            const currentHash = window.location.hash;
                            console.log("Viewing as book...", content);
                            if (!currentHash.endsWith('/viewAsBook')) {
                                // window.location.hash = currentHash + '/viewAsBook';
                                navigate('/projects/viewAsBook', { state: { jsonContent: content } });
                            }
                        }}
                    // color="primary"
                    >
                        <MenuBookIcon />
                    </IconButton>
                </Tooltip>
            } */}

                    <Tooltip style={{ marginLeft: "auto" }} title={toggleAction ? "Sidebar: On" : "Sidebar: Off"}>
                        <Switch
                            {...label}
                            onChange={(e) => {
                                sideBarMenu(e.target.checked);
                                setToggleAction(e.target.checked);
                            }}
                        />
                    </Tooltip>


                </Box>
            )}
            <Box sx={{ ml: 'auto' }}>
                <Button
                    disabled={!isEditor}
                    onClick={handleMenuClick}
                    variant="outlined"
                    endIcon={<ArrowDropDownIcon />}
                    size="small"
                    sx={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        textTransform: 'none',
                        fontWeight: 500,
                        minWidth: 120,
                        '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)',
                        },
                    }}

                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {modeOptions[mode]}
                        {mode}
                    </Box>
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    MenuListProps={{ sx: { padding: 0, width: 160 } }}
                    PaperProps={{
                        elevation: 2,
                        sx: { mt: 1 },
                    }}
                >
                    {modeOptions.map((option) => (
                        <MenuItem
                            key={option.label}
                            selected={mode === option.label}
                            onClick={() => handleMenuSelect(option.label)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 1,
                                fontWeight: 500,
                                color: '#333',
                                backgroundColor: mode === option.label ? '#f0f0f0' : 'transparent',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                },
                            }}
                        >
                            {option.icon}
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

        </Box>
    );
};
