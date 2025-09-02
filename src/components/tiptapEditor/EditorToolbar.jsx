import React, { useEffect, useState } from 'react';
import {
    Box,
    Toolbar,
    IconButton,
    Divider,
    Typography,
    Chip,
    FormControl,
    Select,
    MenuItem,
    Button,
    AppBar,
    ButtonGroup,
    Tooltip,
    Menu,
    InputLabel,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    Highlight as HighlightIcon,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Undo,
    Redo,
    Add,
    Remove,
    Palette,
    TextFields,
    RestartAlt,
    Title,
    FontDownload,
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
    Image as ImageIcon,
    InsertLink as InsertLinkIcon,
    ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import { useSelector } from 'react-redux';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TableInsertButton from './TableInsertButton';
import SaveVersionButton from './SaveVersionButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertLinkButtont from './InsertLinkButtont';
const EditorToolbar = ({
    editor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    headingLevel,
    setHeadingLevel,
    textAlignment,
    setTextAlignment,
    isLoading,
    handleImportClick,
    importRef,
    handleImportFilePick,
    increaseFontSize,
    decreaseFontSize,
    handleColorChange,
    handleHeadingChange,
    getCurrentColor,
    getCurrentBgColor,
    handleFontFamilyChange,
    handleTextAlignmentChange,
    handleImageUpload,
    handleMenuSelect,
    mode,
    handleBgColorChange,
    getCorrentLineHeaght,
    handleLineHeightChange
    , getCorrentVersionStatus,
    handleSwitchChange,
    handleApprovalClick,
    suggestionLength,
    isEditor,
    hasChanges,
    setHasChanges
}) => {
    if (!editor) return null;
    // console.log("isEditor", isEditor);
    const loginDetails = useSelector((state) => state.auth);
    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    const editionsById = useSelector((state) => state.editionsById);
    const currentColor = getCurrentColor();
    const currentBgColor = getCurrentBgColor();
    const currentHeading = headingLevel;
    const currentFont = fontFamily;
    const currentAlignment = textAlignment;
    const lineHeight = getCorrentLineHeaght();
    const versioningEnabled = getCorrentVersionStatus();
    // console.log("versioningEnabled", versioningEnabled);
    // Available font families
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

    const fontFamilies = [
        { value: 'Inter', label: 'Inter' },
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Courier New, monospace', label: 'Courier New' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
        { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
        { value: 'Impact, sans-serif', label: 'Impact' },
        { value: 'Palatino, serif', label: 'Palatino' },
        { value: 'Tahoma, sans-serif', label: 'Tahoma' },
        { value: 'Monaco, monospace', label: 'Monaco' },
        { value: 'Lucida Console, monospace', label: 'Lucida Console' }
    ];

    const alignmentOptions = [
        { value: 'left', label: 'Left', icon: <FormatAlignLeft /> },
        { value: 'center', label: 'Center', icon: <FormatAlignCenter /> },
        { value: 'right', label: 'Right', icon: <FormatAlignRight /> },
        { value: 'justify', label: 'Justify', icon: <FormatAlignJustify /> }
    ];



    return (
        <AppBar
            position="sticky"
            sx={{
                top: 0,
                paddingTop:1,
                zIndex: 1200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}

        >
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, gap: 1, height: '40px' }}>
                {(mode === "Editing" || mode === "Suggesting") && isEditor && (
                    <>
                        <Tooltip title="Upload DOCX">
                            <IconButton variant="outlined"
                                onClick={handleImportClick}
                                disabled={isLoading}
                                size="small"
                                sx={{
                                    minWidth: 'auto',
                                    px: 2,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderColor: 'rgba(255,255,255,0.5)'
                                    },
                                    '&:disabled': {
                                        color: 'rgba(255,255,255,0.5)',
                                        borderColor: 'rgba(255,255,255,0.2)'
                                    }
                                }}>
                                <CloudUploadIcon />
                            </IconButton>
                        </Tooltip>
                        <input
                            type="file"
                            ref={importRef}
                            onChange={handleImportFilePick}
                            accept=".docx,.doc"
                            style={{ display: "none" }}
                        />
                        <Tooltip title="Insert Image">
                            <IconButton
                                onClick={() => document.getElementById("image-upload-input").click()}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <ImageIcon />
                            </IconButton>
                        </Tooltip>
                        <input
                            type="file"
                            id="image-upload-input"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                        />
                        <InsertLinkButtont editor={editor}/>
                    </>
                )}



                {/* Font Family Dropdown */}
                {(mode === "Editing" || mode === "Suggesting") && isEditor && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <Select
                                    value={currentFont}
                                    onChange={handleFontFamilyChange}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.7)',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#424242',
                                                maxHeight: 300,
                                                '& .MuiMenuItem-root': {
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(103, 126, 234, 0.3)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(103, 126, 234, 0.4)',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {fontFamilies.map((font) => (
                                        <MenuItem key={font.value} value={font.value}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: font.value,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {font.label}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}

                        {/* Heading Dropdown */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            {/* <Title sx={{ color: 'white' }} /> */}
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={currentHeading}
                                    onChange={handleHeadingChange}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.7)',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#424242',
                                                '& .MuiMenuItem-root': {
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(103, 126, 234, 0.3)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(103, 126, 234, 0.4)',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="paragraph">
                                        <Typography variant="body2">Normal Text</Typography>
                                    </MenuItem>
                                    <MenuItem value="h1">
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                            Heading 1
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem value="h2">
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Heading 2
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem value="h3">
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                            Heading 3
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem value="h4">
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                            Heading 4
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem value="h5">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            Heading 5
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem value="h6">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                            Heading 6
                                        </Typography>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}
                        {/* Text Alignment Dropdown */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 40 }}>
                                <Select
                                    value={currentAlignment}
                                    onChange={handleTextAlignmentChange}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.7)',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#424242',
                                                '& .MuiMenuItem-root': {
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'rgba(103, 126, 234, 0.3)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(103, 126, 234, 0.4)',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                >
                                    {alignmentOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Tooltip title={option.label} placement="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {option.icon}
                                                </Box>
                                            </Tooltip>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}
                        <Tooltip title="Line height">
                            <FormControl size="small" sx={{ minWidth: 40 }}>
                                <InputLabel id="line-height-select-label">
                                    <FormatLineSpacingIcon fontSize="small" />
                                </InputLabel>
                                <Select
                                    labelId="line-height-select-label"
                                    value={lineHeight}
                                    onChange={handleLineHeightChange}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.5)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.7)',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <MenuItem value="1.5">1.5</MenuItem>
                                    <MenuItem value="2.0">2.0</MenuItem>
                                    <MenuItem value="4.0">4.0</MenuItem>
                                    <MenuItem value="unset">Unset</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>
                        {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}
                        {/* Bullet List */}
                        <Tooltip title="Bullet List">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                // color={editor.isActive('bulletList') ? 'primary' : '#fff'}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                                    '&:disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                <FormatListBulletedIcon />
                            </IconButton>
                        </Tooltip>

                        {/* Numbered List */}
                        <Tooltip title="Numbered List">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                // color={editor.isActive('orderedList') ? 'primary' : '#fff'}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                                    '&:disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                <FormatListNumberedIcon />
                            </IconButton>
                        </Tooltip>
                        {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}
                        <Tooltip title={versioningEnabled ? 'Disable Auto Version' : 'Enable Auto Version'}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={versioningEnabled}
                                        onChange={handleSwitchChange}
                                        size="medium"
                                        color="primary"
                                    />
                                }
                                label="Enable"
                            />
                        </Tooltip>

                    </>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                    {(() => {
                        const role = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
                        const isAuthor = role === "author";
                        const isEditor = !isAuthor;

                        // ✅ Add mode condition here
                        if (!(role === "author" || ((mode === "Editing" || mode === "Suggesting") && isEditor))) {
                            return null;
                        }

                        const canApprove =
                            suggestionLength === 0 &&
                            (isAuthor
                                ? editionsById?.editions?.isEditorApproved
                                : true);

                        const isApproved = isAuthor
                            ? editionsById?.editions?.isAuthorApproved
                            : editionsById?.editions?.isEditorApproved;

                        const tooltipTitle = isAuthor ? "Approve as Author" : "Approve as Editor";
                        const buttonColor = isApproved ? "success" : "default";

                        return (
                            <>
                                {canApprove && (
                                    <Tooltip title={tooltipTitle}>
                                        <span>
                                            <IconButton
                                                onClick={handleApprovalClick}
                                                color={buttonColor}
                                                sx={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.2)'
                                                    },
                                                    ...(isApproved && {
                                                        pointerEvents: 'none'
                                                    })
                                                }}
                                            >
                                                <CheckCircleIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                )}
                                {isEditor && (
                                    <SaveVersionButton
                                        editor={editor}
                                        setHasChanges={setHasChanges}
                                        hasChanges={hasChanges}
                                    />
                                )}

                            </>
                        );
                    })()}

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={mode}
                            onChange={handleMenuSelect}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', height: '35px' }}
                            disabled={!isEditor}

                        >
                            {modeOptions.map((option) => (
                                <MenuItem
                                    key={option.label}
                                    value={option.label}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 1,
                                        fontWeight: 500,
                                        // color: '#fff',
                                        backgroundColor:
                                            mode === option.label ? '#f0f0f0' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    {option.icon}
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            {(mode === "Editing" || mode === "Suggesting") && isEditor && (
                <Toolbar
                    sx={{
                        minHeight: '64px !important',
                        // height: '64px',
                        color: 'white',
                        flexWrap: 'wrap',
                        gap: 1,
                        py: 1,
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {
                            height: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                        },
                    }}
                >

                    {/* Font Size Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                        {/* <TextFields sx={{ color: 'white' }} /> */}
                        <ButtonGroup variant="contained" size="small">
                            <Tooltip title="Decrease Font Size">
                                <IconButton
                                    onClick={decreaseFontSize}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <Remove />
                                </IconButton>
                            </Tooltip>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                minWidth: '60px',
                                justifyContent: 'center'
                            }}>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {fontSize}px
                                </Typography>
                            </Box>
                            <Tooltip title="Increase Font Size">
                                <IconButton
                                    onClick={increaseFontSize}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <Add />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>

                        <Tooltip title="Reset Font Size">
                            <IconButton
                                onClick={() => {
                                    editor.chain().focus().unsetFontSize().run();
                                    setFontSize(16);
                                }}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <RestartAlt />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />

                    {/* Text Formatting */}
                    <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
                        <Tooltip title="Bold">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                sx={{
                                    backgroundColor: editor.isActive('bold') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <FormatBold />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Italic">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                sx={{
                                    backgroundColor: editor.isActive('italic') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <FormatItalic />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Underline">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                sx={{
                                    backgroundColor: editor.isActive('underline') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <FormatUnderlined />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Strike-through">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                sx={{
                                    backgroundColor: editor.isActive('strike') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <StrikethroughSIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Highlight">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                sx={{
                                    backgroundColor: editor.isActive('highlight') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <HighlightIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}
                    {/* Table Controls */}
                    <TableInsertButton editor={editor} />
                    {/* Script Controls */}
                    <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
                        <Tooltip title="Subscript">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleSubscript().run()}
                                sx={{
                                    backgroundColor: editor.isActive('subscript') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <SubscriptIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Superscript">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                                sx={{
                                    backgroundColor: editor.isActive('superscript') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <SuperscriptIcon />
                            </IconButton>
                        </Tooltip>
                        {/* Utility Controls */}
                        <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
                            <Tooltip title="Clear Formatting">
                                <IconButton
                                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    <ClearAllIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Tooltip title="Insert Horizontal Rule">
                            <IconButton
                                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                // color="white"
                                style={{ color: 'white' }}
                                size="large"
                            >
                                <HorizontalRuleIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />


                    {/* Color Picker */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 1 }}>
                        <Tooltip title="Text Color">
                            <IconButton sx={{ color: 'white' }}>
                                <Palette />
                            </IconButton>
                        </Tooltip>
                        <input
                            type="color"
                            onChange={handleColorChange}
                            value={currentColor}
                            style={{
                                width: '40px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </Box>

                    {/* Background color */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 1 }}>
                        <Tooltip title="Backgroun Color">
                            <IconButton sx={{ color: 'white' }}>
                                <Palette />
                            </IconButton>
                        </Tooltip>
                        <input
                            type="color"
                            onChange={handleBgColorChange}
                            value={currentBgColor}
                            style={{
                                width: '40px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />



                    {/* <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.3)' }} /> */}

                    {/* History Controls */}
                    <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
                        <Tooltip title="Undo">
                            <IconButton
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                                    '&:disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                <Undo />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Redo">
                            <IconButton
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                                    '&:disabled': { color: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                <Redo />
                            </IconButton>
                        </Tooltip>
                    </Box>

                </Toolbar>

            )}
        </AppBar>
    );
};

export default EditorToolbar;