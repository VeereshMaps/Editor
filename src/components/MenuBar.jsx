import React from 'react';
import { IconButton, Tooltip, Box, Button, CircularProgress } from '@mui/material';
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
import SaveIcon from '@mui/icons-material/Save';
import MenuBookIcon from '@mui/icons-material/MenuBook'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { CheckCircleOutline, CheckCircleOutlineOutlined, DeleteOutline, UploadFile } from '@mui/icons-material';
import { useNavigate } from 'react-router';

export const MenuBar = ({ editor, handleImageUpload, handleImportClick, handleImportFilePick, importRef, aiLoading, loadAiSuggestions }) => {
    const navigate = useNavigate();
    if (!editor) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor: '#f9f9f9',
                borderBottom: '1px solid #ddd',
                px: 1,
                py: 0.5,
                borderRadius: '8px 8px 0 0',
            }}
        >

            {/* Upload DOCX */}
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
                <span>
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
                </span>
            </Tooltip>



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
            </Tooltip>

            <Tooltip title="Save">
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
            </Tooltip>
            {/* View as Book */}
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

        </Box>
    );
};
