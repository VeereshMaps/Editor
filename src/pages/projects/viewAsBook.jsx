import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../../styles/ViewAsBook.css';
import { useLocation, useNavigate } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Download from '@mui/icons-material/Download';
import { Editor } from '@tiptap/core';
import { ExportDocx } from '@tiptap-pro/extension-export-docx';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent } from '@tiptap/react';
import AlertService from 'utils/AlertService';
import { CommenTipTapExtensions } from 'components/tiptapEditor/tiptapExtensions';

const ViewAsBook = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { jsonContent } = location.state || {};
    const [isLoading, setIsLoading] = useState(false);

    console.log("@@@JSON ", jsonContent.editorContent);

    if (!jsonContent?.editorContent) return;

    const editor = new Editor({
        content: jsonContent.editorContent,
        editable: false,
        extensions: [
            StarterKit.configure({ history: false }),
            ...CommenTipTapExtensions,
            ExportDocx.configure({
                onCompleteExport: result => {
                    setIsLoading(false)
                    const blob = new Blob([result], {
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')

                    a.href = url
                    a.download = 'export.docx'
                    a.click()
                    URL.revokeObjectURL(url)
                },
            }),
        ],
    });

    const downloadDocument = useCallback(() => {
        if (!editor) {
            AlertService.error("Editor not initialized. Cannot export.");
            return;
        }

        try {
            editor
                .chain()
                .exportDocx()
                .run();

            AlertService.success("Exporting document... Please wait.");
        } catch (err) {
            console.error("❌ Export failed:", err.message);
            AlertService.error("Export failed. Please fix content or try again.");
        }
    }, []);


    const backToEdition = () => {
        navigate(`/goldprojects/viewAsBook/${jsonContent.projectID._id}`);
    };

    return (
        <div className="view-as-book">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button title='Back to Gold Project' onClick={backToEdition} startIcon={<ArrowBack style={{ fontSize: 25 }} />} />
                <Typography variant="h4">{jsonContent.title}</Typography>
                <Button
                    variant="text"
                    title="Download File"
                    disabled={editor?.isEmpty}
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                    onClick={downloadDocument}
                >
                    <Download />
                </Button>
            </Box>
            <div className="book-container">
                {editor && (
                    <EditorContent editor={editor} style={{ height: '100%', paddingBottom: '20%',overflowY:'auto' }} />
                )}
            </div>
        </div>
    );
};

export default ViewAsBook;