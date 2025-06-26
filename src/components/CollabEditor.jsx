import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import { proofreadText } from "../redux/Slices/proofreadSlice";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import History from '@tiptap/extension-history'
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { CommentsKit, hoverOffThread, hoverThread } from '@tiptap-pro/extension-comments'


import { Import } from '@tiptap-pro/extension-import'

import "../styles/editor-toolbar.css";
import "../styles/collab-cursor.css";
import "../styles/tiptap.css";

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

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { ThreadsList } from './ThreadsList'
import { ThreadsProvider } from './context'
import { useThreads } from './hooks/useThreads'
import { useUser } from './hooks/useUser'
import { TiptapCollabProvider } from '@hocuspocus/provider'


import PageBreak from './extensions/PageBreak';
import Placeholder from "@tiptap/extension-placeholder";
import { useParams } from "react-router";
import { createDocument, createDocumentFile, getCommentsByEditionId, getDocumentByEditionId } from "redux/Slices/tiptapSlice";

const ydoc = new Y.Doc();
const webIO = new WebsocketProvider("ws://localhost:5000", "my-room", ydoc);
const doc = new Y.Doc()
const isDev = import.meta.env.MODE === 'development' || 'development';
const id = isDev ? 'dev' : uuid()
const provider = new TiptapCollabProvider({
    appId: 'pkry8p7m',
    name: `tiptap-comments-demo/${id}`,
    document: doc,
})
export default function CollabEditor() {
    const dispatch = useDispatch();
    const userDetails = useSelector((state) => state.auth);
    const { token, status } = useSelector((state) => state.tiptapToken);
    const proofreadState = useSelector((state) => state.proofread);
    const importRef = useRef(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUnresolved, setShowUnresolved] = useState(true)
    const [selectedThread, setSelectedThread] = useState(null)
    const threadsRef = useRef([])
    const user = useUser();
    const { editionId, projectId } = useParams();
    console.log("@#$#$editionId " + editionId);
    const [filteredThreads, setFilteredThreads] = useState([]);
    const editor = useEditor(
        token
            ? {
                extensions: [
                    StarterKit.configure({ history: false }),
                    webIO,
                    Collaboration.configure({ document: ydoc }),
                    CollaborationCursor.configure({
                        provider,
                        user: {
                            name: `${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`,
                            color: stringToColor(`${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`),
                        },
                    }),
                    Import.configure({
                        appId: 'pkry8p7m',
                        token,
                        endpoint: 'https://api.tiptap.dev/v1/convert', // ✅ RE-ENABLE THIS
                        experimentalDocxImport: true,
                    }),
                    CommentsKit.configure({
                        provider,
                        useLegacyWrapping: false,
                        onClickThread: (threadId) => {
                            const isResolved = threadsRef.current.find(t => t.id === threadId)?.resolvedAt;

                            if (!threadId || isResolved) {
                                setSelectedThread(null);
                                editor?.chain().unselectThread().run();
                                return;
                            }

                            setSelectedThread(threadId);
                            editor?.chain().selectThread({ id: threadId, updateSelection: false }).run();
                        },
                    }),

                    Placeholder.configure({
                        placeholder: 'Write a text to add comments …',
                    }),

                    PageBreak,
                    Image.configure({
                        inline: true,       // ✅ Required for imported images
                        allowBase64: true,  // ✅ Good for embedded image content
                    }),
                    Table.configure({ resizable: true }),
                    TableRow,
                    TableCell,
                    TableHeader,
                    History,
                    Underline,
                    Strike,
                    Highlight,
                    Link,
                    TextAlign.configure({
                        types: ['heading', 'paragraph'],
                    }),
                ],
            }
            : null
    );
    useEffect(() => {
        const fetchAndSetContent = async () => {
            const payload = { editionId };
            const response = await dispatch(getDocumentByEditionId(payload));
            console.log("@#@$response11", response);

            const updatedContent = injectPageBreaksIntoJSON(response?.payload.content);
            await waitUntilEditorViewIsReady(editor);

            requestAnimationFrame(() => {
                try {
                    editor.commands.setContent(updatedContent);
                    console.log('✅ Synced with Tiptap Cloud (from saved doc)');
                } catch (cloudErr) {
                    console.error('🌩️ Cloud sync error:', cloudErr);
                    setError('Setting content from cloud failed.');
                } finally {
                    setIsLoading(false);
                }
            });
        };
        fetchAndSetContent();
    }, []);
    useEffect(() => {
        const fetchComments = async () => {
            if (!editor || !editionId) return;

            try {
                const payload = { editionId };
                const response = await dispatch(getCommentsByEditionId(payload));

                console.log("📩 Comments Response:", response);
                setFilteredThreads(response?.payload)
                // if (response?.payload) {
                //     editor
                //         .chain()
                //         .focus()
                //         .setThread(response.payload) // assuming payload is in the right format
                //         .run();
                // }
            } catch (error) {
                console.error("❌ Failed to fetch comments", error);
            }
        };

        fetchComments();
    }, [editor, editionId]); // include editor & editionId as dependencies

    useEffect(() => {

        if (!editor) return;

        const handler = async () => {
            const selection = editor.state.selection;
            const $pos = selection.$anchor;

            // ✅ 1. Get all pageBreak positions
            const allPageBreaks = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'pageBreak') {
                    allPageBreaks.push(pos);
                }
            });

            // ✅ 2. Determine current page number
            const currentPage = allPageBreaks.filter(pos => pos < $pos.pos).length + 1;
            console.log('📄 Cursor is on page:', currentPage);

            // ✅ 3. Compute slice positions based on page
            const start =
                currentPage === 1
                    ? 0
                    : allPageBreaks[currentPage - 2] + 1; // one after previous break
            const end =
                allPageBreaks[currentPage - 1] ?? editor.state.doc.content.size;

            // ✅ 4. Extract plain text from current page
            const pageSlice = editor.state.doc.slice(start, end);
            const pageText = pageSlice.content.textBetween(0, pageSlice.content.size, '\n');

            // ✅ 5. Floating suggestion box near cursor
            const { from } = editor.view.state.selection;
            const coords = editor.view.coordsAtPos(from);
            const container = document.querySelector(".tiptap"); // your editor wrapper
            const rect = container.getBoundingClientRect();

            setSuggestionPosition({
                top: coords.top - rect.top + 30,
                left: coords.left - rect.left,
            });

            // ✅ 6. Run proofread only when triggered
            console.log("showSuggestions", showSuggestions);

            if (showSuggestions) {
                console.log("📑 Proofreading content on page", currentPage, ":\n", pageText);
                dispatch(proofreadText(pageText));
                setShowSuggestions(false);
            }
        };



        editor.on("selectionUpdate", handler);
        return () => {
            editor.off("selectionUpdate", handler);
        };

    }, [editor, showSuggestions]);




    if (!editor) return <p>Loading editor...</p>;

    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${(
            (hash >> 16) & 0xff
        ).toString(16).padStart(2, "0")}${((hash >> 8) & 0xff).toString(16).padStart(2, "0")}`;
        return color.slice(0, 7);
    }

    function getCurrentPage(editor) {
        if (!editor) return 1;

        const pos = editor.state.selection.anchor; // Cursor position
        const doc = editor.state.doc;

        let page = 1;

        doc.descendants((node, posStart) => {
            if (node.type.name === 'pageBreak' && posStart < pos) {
                page++;
            }
        });

        return page;
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
    };

    const handleProofread = () => {
        if (!editor) return;

        const selection = editor.state.selection;
        const $pos = selection.$anchor;

        // 🔍 Find all page breaks
        const allPageBreaks = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'pageBreak') {
                allPageBreaks.push(pos);
            }
        });

        const currentPage = allPageBreaks.filter(pos => pos < $pos.pos).length + 1;

        const start =
            currentPage === 1
                ? 0
                : allPageBreaks[currentPage - 2] + 1;

        const end =
            allPageBreaks[currentPage - 1] ?? editor.state.doc.content.size;

        const pageSlice = editor.state.doc.slice(start, end);
        const pageText = pageSlice.content.textBetween(0, pageSlice.content.size, '\n');

        // 📍 Floating position for suggestion box
        const { from } = editor.view.state.selection;
        const coords = editor.view.coordsAtPos(from);
        const container = document.querySelector(".tiptap");
        const rect = container.getBoundingClientRect();

        setSuggestionPosition({
            top: coords.top - rect.top + 30,
            left: coords.left - rect.left,
        });

        // ✅ Trigger proofread and show suggestions
        dispatch(proofreadText(pageText));
        setShowSuggestions(true);
        console.log("📄 Proofreading Page", currentPage, "Text:\n", pageText);
    };

    function injectPageBreaksIntoJSON(content, blocksPerPage = 10) {
        if (!content || !content.content) return content;

        const result = [];
        let count = 0;

        content.content.forEach((node, index) => {
            result.push(node);
            count++;

            if (count >= blocksPerPage) {
                result.push({
                    type: 'pageBreak',
                });
                count = 0;
            }
        });

        return {
            ...content,
            content: result,
        };
    }


    // const handleDocxImport = async (event) => {
    //     const file = event.target.files[0];
    //     if (!file || !editor) return;

    //     const arrayBuffer = await file.arrayBuffer();

    //     const { value: html } = await mammoth.convertToHtml({
    //         arrayBuffer,
    //         convertImage: mammoth.images.inline((element) =>
    //             element.read("base64").then((imageBuffer) => {
    //                 return {
    //                     src: `data:${element.contentType};base64,${imageBuffer}`,
    //                 };
    //             })
    //         ),
    //     });

    //     const paginatedHTML = injectPageBreaksEveryNBlocks(html, 1);
    //     editor.commands.setContent(paginatedHTML, false); // Insert HTML into Tiptap

    // };

    const handleImportClick = useCallback(() => {
        importRef.current.click()
    }, []);

    const handleImportFilePick = useCallback(async (e) => {
        const file = e.target.files[0];
        importRef.current.value = '';

        if (!file || !editor) return;

        setIsLoading(true);
        setError(null);
        //     // 🟢 1. Upload the binary file via FormData
        //     //     const formData = new FormData();
        //     //     formData.append('file', file);
        //     //     formData.append('projectId', projectId);
        //     //     console.log("FormData keys:", [...formData.entries()]);
        //     //    const response= await dispatch(createDocumentFile(formData));
        try {
            const payload = { editionId };
            const response = await dispatch(getDocumentByEditionId(payload));
            console.log("@#@$response", response);

            // if (response?.payload?.content && response.payload.content.length > 0) {
            //     const updatedContent = injectPageBreaksIntoJSON(response.payload);
            //     await waitUntilEditorViewIsReady(editor);

            //     requestAnimationFrame(() => {
            //         try {
            //             editor.commands.setContent(updatedContent);
            //             console.log('✅ Set content from cloud');
            //         } catch (err) {
            //             console.error('❌ Failed to set editor content:', err);
            //             setError('Failed to set editor content.');
            //         } finally {
            //             setIsLoading(false);
            //         }
            //     });
            // }
            // else {
            // ❌ No cloud content, fallback to importing file
            // alert("No cloud document found. Falling back to local import.");

            await editor
                .chain()
                .import({
                    file,
                    onImport: async (context) => {
                        if (context.error) {
                            setError(context.error);
                            setIsLoading(false);
                            return;
                        }
                        console.log("@######context.content " + JSON.stringify(context.content));

                        const updatedContent = injectPageBreaksIntoJSON(context.content);

                        dispatch(createDocument({
                            editionId,
                            content: updatedContent,
                        }));

                        await waitUntilEditorViewIsReady(editor);

                        requestAnimationFrame(() => {
                            try {
                                context.setEditorContent(updatedContent);
                                console.log('✅ Synced with Tiptap Cloud (fresh import)');
                            } catch (cloudErr) {
                                console.error('🌩️ Cloud sync error:', cloudErr);
                                setError('Imported locally, but syncing failed.');
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    },
                })
                .run();
            // }
        } catch (err) {
            console.error('❌ Import or sync failed:', err);
            setError('Import or sync failed');
            setIsLoading(false);
        }
    }, [editor, editionId, dispatch]);

    const waitUntilEditorViewIsReady = async (editor, retries = 10, delay = 100) => {
        for (let i = 0; i < retries; i++) {
            if (editor?.view?.dom?.getBoundingClientRect) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        throw new Error("Editor view not ready after waiting.");
    };

    const { threads = [], createThread } = useThreads(provider, editor, user)

    threadsRef.current = threads

    const selectThreadInEditor = useCallback(threadId => {
        editor.chain().selectThread({ id: threadId }).run()
    }, [editor])

    const deleteThread = useCallback(threadId => {
        console.log("threadId");

        provider.deleteThread(threadId)
        editor.commands.removeThread({ id: threadId })
    }, [editor])

    const resolveThread = useCallback(threadId => {
        editor.commands.resolveThread({ id: threadId })
    }, [editor])

    const unresolveThread = useCallback(threadId => {
        editor.commands.unresolveThread({ id: threadId })
    }, [editor])

    const updateComment = useCallback((threadId, commentId, content, metaData) => {
        editor.commands.updateComment({
            threadId, id: commentId, content, data: metaData,
        })
    }, [editor])

    const onHoverThread = useCallback(threadId => {
        hoverThread(editor, [threadId])
    }, [editor])

    const onLeaveThread = useCallback(() => {
        hoverOffThread(editor)
    }, [editor])

    // const filteredThreads = threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))
    console.log("filteredThreads" + JSON.stringify(filteredThreads));



    return (
        <div style={{ position: "relative", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <div className="editor-toolbar">
                <button
                    className={editor?.isActive("bold") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                >
                    <FormatBoldIcon />
                </button>

                <button
                    className={editor?.isActive("italic") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <FormatItalicIcon />
                </button>

                <button
                    className={editor?.isActive("heading", { level: 1 }) ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    title="Heading 1"
                >
                    <TitleIcon />
                </button>

                <button
                    className={editor?.isActive("bulletList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <FormatListBulletedIcon />
                </button>

                <button
                    className={editor?.isActive("orderedList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Numbered List"
                >
                    <FormatListNumberedIcon />
                </button>

                <button
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Clear Formatting"
                >
                    <ClearAllIcon />
                </button>
                {/* Undo */}
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <UndoIcon />
                </button>

                {/* Redo */}
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <RedoIcon />
                </button>

                {/* Underline */}
                <button
                    className={editor?.isActive("underline") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                >
                    <FormatUnderlinedIcon />
                </button>

                {/* Strike-through */}
                <button
                    className={editor?.isActive("strike") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="Strike-through"
                >
                    <StrikethroughSIcon />
                </button>

                {/* Highlight */}
                <button
                    className={editor?.isActive("highlight") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                >
                    <HighlightIcon />
                </button>

                {/* Align Left */}
                <button
                    className={editor?.isActive({ textAlign: "left" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    title="Align Left"
                >
                    <FormatAlignLeftIcon />
                </button>

                {/* Align Center */}
                <button
                    className={editor?.isActive({ textAlign: "center" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    title="Align Center"
                >
                    <FormatAlignCenterIcon />
                </button>

                {/* Align Right */}
                <button
                    className={editor?.isActive({ textAlign: "right" }) ? "active" : ""}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    title="Align Right"
                >
                    <FormatAlignRightIcon />
                </button>

                {/* Link */}
                <button
                    className={editor?.isActive("link") ? "active" : ""}
                    onClick={() => {
                        const url = window.prompt("Enter the URL");
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                    title="Insert Link"
                >
                    <InsertLinkIcon />
                </button>

                {/* <button onClick={handleProofread} title="Proofread">
                    ✍️ Proofread
                </button> */}

                <button
                    onClick={() => setShowSuggestions(false)}>❌ Clear Suggestion</button>

                {/* Image Upload */}
                <button
                    title="Insert Image"
                    onClick={() => document.getElementById("image-upload-input").click()}
                >
                    <ImageIcon />
                </button>
                <input
                    type="file"
                    id="image-upload-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                />
                <button
                    className="upload-docx-button"
                    title="Upload DOCX"
                    onClick={handleImportClick}
                >
                    <UploadFileIcon style={{ marginRight: "6px" }} />
                    Upload
                </button>
                <input
                    onChange={handleImportFilePick}
                    type="file"
                    ref={importRef}
                    style={{ display: 'none' }}
                />
            </div>
            {/* ✅ Loading Indicator */}
            {isLoading && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px', // or 100vh if full screen
                    flexDirection: 'column',
                }}>
                    <span className="spinner" />
                    <p style={{ marginTop: '1rem', color: '#555' }}>Processing .docx file...</p>
                </div>
            )}
            {!isLoading && editor ? (
                <ThreadsProvider
                    onClickThread={selectThreadInEditor}
                    onDeleteThread={deleteThread}
                    onHoverThread={onHoverThread}
                    onLeaveThread={onLeaveThread}
                    onResolveThread={resolveThread}
                    onUpdateComment={updateComment}
                    onUnresolveThread={unresolveThread}
                    selectedThreads={editor.storage.comments.focusedThreads}
                    selectedThread={selectedThread}
                    setSelectedThread={setSelectedThread}
                    threads={threads}
                >
                    <div style={{ display: 'flex', flexDirection: 'row' }} className="col-group" data-viewmode={showUnresolved ? 'open' : 'resolved'}>
                        <div className="main" style={{ width: '80%' }}>
                            <div className="control-group">
                                <div className="button-group">
                                    <button onClick={createThread} disabled={editor.state.selection.empty}>Add comment</button>
                                    <button onClick={() => editor.chain().focus().setImage({ src: 'https://placehold.co/800x500' }).run()}>Add image</button>
                                </div>
                            </div>

                            <EditorContent editor={editor} />
                            <button
                                onClick={handleProofread}
                                title="Proofread"
                                style={{
                                    position: "fixed", // or "absolute" if scoped to container
                                    bottom: "1.5rem",
                                    right: "1.5rem",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    padding: "0.75rem 1rem",
                                    border: "none",
                                    borderRadius: "50px",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    zIndex: 999,
                                }}
                            >
                                ✍️ Proofread
                            </button>

                        </div>
                        <div className="sidebar" style={{ width: '20%' }}>
                            <div className="sidebar-options">
                                <div className="option-group">
                                    <div className="label-large">Comments</div>
                                    <div className="switch-group">
                                        <label>
                                            <input type="radio" name="thread-state" onChange={() => setShowUnresolved(true)} checked={showUnresolved} />
                                            Open
                                        </label>
                                        <label>
                                            <input type="radio" name="thread-state" onChange={() => setShowUnresolved(false)} checked={!showUnresolved} />
                                            Resolved
                                        </label>
                                    </div>
                                </div>
                                <ThreadsList provider={provider} threads={filteredThreads} />
                            </div>
                        </div>
                    </div>
                </ThreadsProvider>


            ) : (
                <p>Loading collaborative editor...</p>
            )}

            {/* ✅ Feedback display below editor */}
            {proofreadState.status === "loading" && (
                <div className="editor-overlay">
                    <div className="spinner" />
                </div>

            )}


            {proofreadState.error && (
                <p style={{ color: "red" }}>
                    {typeof proofreadState.error === "string"
                        ? proofreadState.error
                        : proofreadState.error.error || "An error occurred."}
                </p>
            )}

            {proofreadState.suggestions && showSuggestions && (
                <div
                    style={{
                        position: "absolute",
                        top: `${suggestionPosition.top}px`,
                        left: `${suggestionPosition.left}px`,
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        padding: "1rem",
                        maxWidth: "300px",
                        zIndex: 1000,
                        overflowY: "auto",
                        maxHeight: "400px",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, color: "#28a745" }}>Suggestions</h4>
                        <button
                            onClick={() => setShowSuggestions(false)}
                            style={{
                                background: "none",
                                border: "none",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                                padding: "0.25rem 0.5rem",
                                cursor: "pointer",
                                color: "#888",
                                lineHeight: "1",
                            }}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                    <pre style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.85rem" }}>
                        {proofreadState.suggestions?.proofread}
                    </pre>
                </div>
            )}




            {/* ✅ Error display */}
            {error && (
                <div style={{ color: 'red', marginTop: '1rem' }}>
                    {error.message || 'Something went wrong during import.'}
                </div>
            )}
        </div>
    );
}
