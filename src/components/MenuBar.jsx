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
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { CheckCircleOutline, CheckCircleOutlineOutlined, DeleteOutline, UploadFile } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { border } from '@mui/system';

export const MenuBar = ({ editor, createThread, handleImageUpload, handleImportClick, handleImportFilePick, importRef, editionsById, handleApprovalClick, actionType, sideBarMenu, suggestionLength, fontSize, fontFamilyFunc, decreaseFont, increaseFont }) => {
    const navigate = useNavigate();
    const loginDetails = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mode, setMode] = useState('');
    const [fontFamily, setFontFamily] = useState("Arial");
    const label = { inputProps: { 'aria-label': 'Menu' } };
    const [toggleAction, setToggleAction] = useState(false);
    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    // const isEditor = ((roleName === "author" || roleName === "editor"));
    const [isEditor, setIsEditor] = useState(false);
    const baseModeOptions = [
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

const modeOptions = roleName === "author"
  ? baseModeOptions.filter(option => option.label !== "Editing")
  : baseModeOptions;
    // console.log("EEEEEEEEsuggestionLength "+suggestionLength);


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

    const handleFontChange = (e) => {
        const newFont = e.target.value;
        setFontFamily(newFont);
        fontFamilyFunc(editor, newFont);

        // apply to current selection
        editor.chain().focus().setFontFamily(newFont).run()
    };


    // useEffect(() => {
    //     console.log("fnfnfn_",editionsById?.editions);

    //     if ((roleName === "author" || roleName === "editor")) {
    //         alert("fnfjn")
    //         setIsEditor(false)
    //         setMode("Editing");
    //     } else if (roleName === "editor" && editionsById?.editions?.isEditorApproved == false) {
    //         setMode("View");
    //         setIsEditor(true)
    //     }
    //     else if (editionsById?.editions?.isAuthorApproved==true) {
    //         setMode("View");
    //         setIsEditor(true)
    //     }
    //     else {
    //         setMode("View");
    //         setIsEditor(true)
    //     }
    // }, [isEditor]);
    useEffect(() => {
        console.log("fnfnfn_", editionsById?.editions);

        if (roleName === "author" && editionsById?.editions?.isAuthorApproved === false) {
            setIsEditor(true);
            setMode("Suggesting");
        } else if (roleName === "editor") {
            // If editor and NOT approved yet, view mode + editor enabled
            if (editionsById?.editions?.isEditorApproved === true) {
                setMode("View");
                setIsEditor(false);
            } else {
                // Editor and approved (or any other case)
                setMode("Suggesting");
                setIsEditor(true);
            }
        } else if (editionsById?.editions?.isAuthorApproved === true) {
            setMode("View");
            setIsEditor(false);
        } else {
            setMode("View");
            setIsEditor(false);
        }
    }, [roleName, editionsById]);


    if (!editor) return null;


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
            {(mode === 'Editing' || mode === 'Suggesting') && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: "0 !important" }}>
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
                                            px: 1, // optional: adjust horizontal padding if too narrow or wide
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

                    {/* Font Family */}
                    <Tooltip title="Font Family">
                        <select
                            value={fontFamily}
                            onChange={handleFontChange}
                            style={{ padding: '4px', borderRadius: '4px' }}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </Tooltip>

                    {/* Increase Font Size */}
                    <div className="flex items-center gap-2">
                        <IconButton onClick={decreaseFont}>-</IconButton>
                        <span style={{ border: "1px solid #b0b0b0ff", borderRadius: "5px", padding: "3px" }}>{fontSize}</span>
                        <IconButton onClick={increaseFont}>+</IconButton>
                    </div>




                    {/* Text Color */}
                    <Tooltip title="Text Color">
                        <input
                            type="color"
                            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                            style={{ width: 30, height: 30, border: 'none', marginLeft: 8 }}
                        />
                    </Tooltip>

                    {/* Highlight */}
                    <Tooltip title="Background Color">
                        <input
                            type="color"
                            onChange={(e) =>
                                editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
                            }
                            style={{ width: 30, height: 30, border: 'none', marginLeft: 8 }}
                        />
                    </Tooltip>

                    {/* Superscript */}
                    <Tooltip title="Superscript">
                        <IconButton onClick={() => editor.chain().focus().toggleSuperscript().run()}>
                            <span style={{ fontSize: "16px" }}>
                                x<sup style={{ fontSize: "0.7em" }}>2</sup>
                            </span>
                        </IconButton>
                    </Tooltip>

                    {/* Subscript */}
                    <Tooltip title="Subscript">
                        <IconButton onClick={() => editor.chain().focus().toggleSubscript().run()}>
                            <span style={{ fontSize: "16px" }}>
                                x<sub style={{ fontSize: "0.7em" }}>2</sub>
                            </span>
                        </IconButton>
                    </Tooltip>

                    {/* Indent */}
                    {/* <Tooltip title="Indent">
                        <IconButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
                            ➡️
                        </IconButton>
                    </Tooltip> */}

                    {/* Outdent */}
                    {/* <Tooltip title="Outdent">
                        <IconButton onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
                            ⬅️
                        </IconButton>
                    </Tooltip> */}

                    <button
                        className="insert-table-btn"
                        onClick={() =>
                            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                        }
                    >
                        ➕ Insert Table
                    </button>



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
                    {loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase() === "author" ? (
                        editionsById?.editions?.isEditorApproved && suggestionLength === 0 ? (
                            <Tooltip title="Approve as Author">
                                <div>
                                    <IconButton
                                        onClick={handleApprovalClick}
                                        color={editionsById?.editions?.isAuthorApproved ? "success" : "default"}
                                        sx={
                                            editionsById?.editions?.isAuthorApproved
                                                ? { pointerEvents: "none" }
                                                : {}
                                        }
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        ) : null
                    ) : suggestionLength === 0 ? (
                        <Tooltip title="Approve as Editor">
                            <div>
                                <IconButton
                                    onClick={handleApprovalClick}
                                    color={editionsById?.editions?.isEditorApproved ? "success" : "default"}
                                    sx={
                                        editionsById?.editions?.isEditorApproved
                                            ? { pointerEvents: "none" }
                                            : {}
                                    }
                                >
                                    <CheckCircleIcon />
                                </IconButton>
                            </div>
                        </Tooltip>
                    ) : null}

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
