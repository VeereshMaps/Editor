import React, { useState, useLayoutEffect, useRef } from 'react';
import '../../styles/ViewAsBook.css';
import { useLocation, useNavigate } from 'react-router';
import { flushSync } from 'react-dom';
import * as ReactDOM from 'react-dom/client';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Download from '@mui/icons-material/Download';
import { Editor } from '@tiptap/core';
import { ExportDocx } from '@tiptap-pro/extension-export-docx'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import {TextStyle} from '@tiptap/extension-text-style';
import { Heading } from '@tiptap/extension-heading'
import { HardBreak } from '@tiptap/extension-hard-break'
import { CustomHighlight } from 'components/CustomHighlight';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import { InlineThread } from '@tiptap-pro/extension-comments';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import AlertService from 'utils/AlertService';
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import OrderedList from '@tiptap/extension-ordered-list'
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';

const ViewAsBook = () => {
    const location = useLocation();
    const { jsonContent } = location.state || {};

    const [pages, setPages] = useState([]);
    const hiddenContainerRef = useRef(null);

    // ✅ Converts mm to px at 96 dpi
    const mmToPx = (mm) => (mm * 96) / 25.4;

    // ✅ Renders a text node with marks
    const processMarks = (textNode, key) => {
        let text = textNode.text || '';

        if (textNode.marks && textNode.marks.length > 0) {
            return textNode.marks.reduce((acc, mark) => {
                if (mark.type === 'bold') {
                    return <strong key={key}>{acc}</strong>;
                } else if (mark.type === 'italic') {
                    return <em key={key}>{acc}</em>;
                }
                return acc;
            }, text);
        }

        return text;
    };

    const isEmptyParagraph = (node) =>
        node?.type === 'paragraph' &&
        (!node.content || node.content.every(c => c.text?.trim() === ''));


    // ✅ Renders each node as JSX
    const renderNode = (node, index) => {
        if (node.type === 'heading') {
            const level = node.attrs?.level || 1;
            const textAlign = node.attrs?.textAlign || 'left';
            const HeadingTag = `h${level}`;

            const text = node.content?.map((c, i) => processMarks(c, i));

            return (
                <HeadingTag key={index} style={{ textAlign }}>
                    {text}
                </HeadingTag>
            );
        } else if (node.type === 'paragraph') {
            const textAlign = node.attrs?.textAlign || 'left';

            const text = node.content?.map((c, i) => {
                if (c.type === 'text') {
                    return <React.Fragment key={i}>{processMarks(c, i)}</React.Fragment>;
                } else if (c.type === 'hardBreak') {
                    return <br key={i} />;
                }
                return null;
            });

            return (
                <p key={index} style={{ textAlign }}>
                    {text}
                </p>
            );
        } else if (node.type === 'table') {
            return <table key={index}>{/* render rows and cells */}</table>;
        }

        return null;
    };

    // ✅ Converts a React element to DOM element for measurement
    const renderToElement = (element) => {
        const container = document.createElement('div');
        container.style.visibility = 'hidden';
        document.body.appendChild(container);

        flushSync(() => {
            ReactDOM.createRoot(container).render(element);
        });

        return container;
    };


    // ✅ Height-based pagination logic
    useLayoutEffect(() => {
        if (!jsonContent?.editorContent?.content) return;

        const totalPageHeightPx = 1122; // fixed page height in px (A4)
        const verticalPaddingPx = mmToPx(50); // 25mm top + 25mm bottom
        const pageContentHeightPx = totalPageHeightPx - verticalPaddingPx;

        const meaningfulNodes = jsonContent.editorContent.content.filter(node => !isEmptyParagraph(node));
        const nodeElements = meaningfulNodes.map((node, i) => renderNode(node, i));

        // ✅ STEP 1: Extract heading + author as first page
        const firstPage = [];
        let remainingNodes = [...nodeElements];

        if (jsonContent.editorContent.content.length >= 2 &&
            jsonContent.editorContent.content[0].type === 'heading' &&
            jsonContent.editorContent.content[1].type === 'paragraph') {
            firstPage.push(nodeElements[0], nodeElements[1]);
            remainingNodes = remainingNodes.slice(2);
        } else {
            remainingNodes = nodeElements; // no split
        }

        // ✅ STEP 2: Continue normal pagination with remaining nodes
        const hiddenContainer = hiddenContainerRef.current;
        hiddenContainer.innerHTML = ''; // clear previous

        const tempPages = [];
        let currentPage = [];
        let currentHeight = 0;

        remainingNodes.forEach((element, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.width = '210mm';
            wrapper.style.boxSizing = 'border-box';
            wrapper.style.padding = '25mm 20mm';
            wrapper.appendChild(renderToElement(element));

            hiddenContainer.appendChild(wrapper);
            const elHeight = wrapper.offsetHeight;
            hiddenContainer.removeChild(wrapper);

            if (currentHeight + elHeight > pageContentHeightPx) {
                tempPages.push([...currentPage]);
                currentPage = [];
                currentHeight = 0;
            }

            currentPage.push(element);
            currentHeight += elHeight;
        });

        if (currentPage.length > 0) {
            tempPages.push(currentPage);
        }

        // ✅ STEP 3: Combine first page with paginated pages
        const finalPages = [];
        if (firstPage.length > 0) finalPages.push(firstPage);
        finalPages.push(...tempPages);

        setPages(finalPages);
    }, [jsonContent?.editorContent]);
    const backToEdition = () => {
        const navigate = useNavigate();
        return () => {
            navigate('/goldprojects/viewAsBook/' + jsonContent.projectID._id);
        };
    };
    const downloadDocument = () => {
        // console.log("@##$jsonContent.editorContent", jsonContent.editorContent);
    
        let editor;
    
        try {
            editor = new Editor({
                content: jsonContent.editorContent,
                editable:false,
                extensions: [
                    Document,
                    Paragraph,
                    Text,
                    Heading,
                    TextStyle,
                    HardBreak,
                    Image.configure({ inline: true, allowBase64: true }),
                    Table.configure({ resizable: true }),
                    InlineThread,
                    Underline,
                    Highlight,
                    Strike,
                    Link,
                    TableRow,
                    TableCell,
                    TableHeader,
                    BulletList,
                    ListItem,
                    OrderedList,
                    CodeBlock,
                    Bold,
                    Italic,
                    Blockquote,
                    TextAlign.configure({ types: ['heading', 'paragraph', 'orderedList'] }),
                    ExportDocx.configure({
                        onCompleteExport: (result) => {
                            const blob = result instanceof Blob ? result : new Blob([result]);
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${jsonContent.title || 'document'}.docx`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
    
                            editor.destroy();
                        },
                        exportType: 'blob',
                    }),
                ],
            });
        } catch (err) {
            console.error("❌ TipTap Editor initialization failed:", err.message);
            AlertService.error("The content contains unsupported nodes or marks. Fix it before exporting.");
            return;
        }
    
        // Run export in next tick
        try {
            setTimeout(() => {
                editor.chain().exportDocx().run();
            }, 100);
            AlertService.success("Exporting document... Please wait.");
        } catch (err) {
            console.error("❌ Export failed:", err.message);
            AlertService.error("Export failed. Please fix content or try again.");
        }
    };
    
    return (
        <div className="view-as-book">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button title='back to Gold Project' onClick={backToEdition()} startIcon={<ArrowBack style={{ fontSize: 25 }} />}>
                </Button>
                <Typography variant="h4">{jsonContent.title}</Typography>
                <Button
                    variant="text"
                    title="Download File"
                    style={{ marginLeft: 'auto', marginRight: 20 }}
                    onClick={downloadDocument}
                >
                    <Download />
                </Button>
            </Box>
            <div className="book-container">

                {pages.map((pageContent, pageIndex) => (
                    <div
                        className={`a4-page ${pageIndex === 0 ? 'first-page' : ''}`}
                        key={pageIndex}
                    >
                        {pageContent}
                    </div>
                ))}

                {/* Hidden container for measurement */}
                <div ref={hiddenContainerRef} style={{ visibility: 'hidden', position: 'absolute', top: '-9999px' }}></div>
            </div>
        </div>
    );
};

export default ViewAsBook;

