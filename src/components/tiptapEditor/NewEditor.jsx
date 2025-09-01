import "../../styles/style.scss"
import "../../styles/collab-cursor.css";
import "../../styles/tiptap.css";
import { Editor, EditorContent, EditorContext, useEditor } from '@tiptap/react'
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import CommentsKit, { hoverOffThread, hoverThread, InlineThread } from "@tiptap-pro/extension-comments";
import StarterKit from "@tiptap/starter-kit";
import ImportDocx from "@tiptap-pro/extension-import-docx";


// MUI Imports
import {
    Box,
    Button,
    IconButton,
    Paper,
    Tooltip
} from '@mui/material';

import AlertService from "utils/AlertService";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Collaboration from "@tiptap/extension-collaboration";
import EditorToolbar from "./EditorToolbar";
import TableControls from "../TableControll";
import CommentIcon from '@mui/icons-material/Comment';
import { useUser } from "../hooks/useUser";
import Snapshot from "@tiptap-pro/extension-snapshot";
import { VersioningModal } from "./tiptop_version/VersioningModal"
import { CommenTipTapExtensions } from "./tiptapExtensions";
import { useDispatch, useSelector } from "react-redux";
import { Placeholder } from "@tiptap/extensions";
import { getEditionsById } from 'redux/Slices/editionByIdSlice';
import { updateEdition } from 'redux/Slices/updateEditionSlice';
import { suggestChanges } from "@handlewithcare/prosemirror-suggest-changes";
import { useThreads } from "components/hooks/useThreads";
import { ThreadsList } from "components/ThreadsList";
import { ThreadsProvider, useThreadsState } from "components/Context";
import { ThreadsListItem } from "components/ThreadsListItem";
const APP_ID = "6kpvqylk";



const getInitialUser = () => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = `${storedUser.firstName || 'User'} ${storedUser.lastName || ''}`.trim();
    return {
        name: userName || 'Anonymous',
        id: storedUser._id || null,
        color: storedUser.color,
    };
};

const NewEditorComponent = ({ ydoc, provider, room }) => {
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const [editionId] = useState(room);
    const [fontSize, setFontSize] = useState(16);
    const [headingLevel, setHeadingLevel] = useState('paragraph');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [textAlignment, setTextAlignment] = useState('left');
    const [isLoading, setIsLoading] = useState(false);
    const [isTableActive, setIsTableActive] = useState(false);
    const importRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(getInitialUser());
    const currentUserRef = useRef(currentUser);
    const user = useUser();
    const loginDetails = useSelector((state) => state.auth);
    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    const dispatch = useDispatch();
    const [mode, setMode] = useState("Editing");

    const webIORef = useRef(null);
    const stableUser = useMemo(() => user, [user?._id]);
    const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
    const [saveMode, setSaveMode] = useState(false);
    const [getThreds, setThreads] = useState([]);
    const [editor, setEditor] = useState(null);

    const [isEditor, setIsEditor] = useState(false);
    const editionsById = useSelector((state) => state.editionsById);


    const [isAutoVersioning, setIsAutoVersioning] = React.useState(false);
    const [latestVersion, setLatestVersion] = React.useState(null);
    const [currentVersion, setCurrentVersion] = React.useState(null);
    const [versions, setVersions] = React.useState([]);
    const [versioningModalOpen, setVersioningModalOpen] = React.useState(false)
    const [hasChanges, setHasChanges] = React.useState(false)
    const [tooltipPosition, setTooltipPosition] = useState(null);
    const [showInputBox, setShowInputBox] = useState(false);
    const [commentText, setCommentText] = useState('');
    const threadsRef = useRef([])
    const [selectedThread, setSelectedThread] = useState(null)

    useEffect(() => {
        const newEditor = new Editor({
            shouldRerenderOnTransaction: true,
            extensions: [
                StarterKit.configure({
                    history: true,
                    paragraph: {
                        HTMLAttributes: {
                            class: 'tiptap-paragraph',
                        },
                    }
                }),
                ...CommenTipTapExtensions,
                ImportDocx.configure({
                    appId: APP_ID,
                    token: documentToken,
                    endpoint: "https://api.tiptap.dev/v1/convert",
                    // experimentalDocxImport: true,
                    imageUploadCallbackUrl: 'https://api-demo.tiptap.dev/v2/convert/upload',
                }),
                CommentsKit.configure({
                    provider,
                    useLegacyWrapping: false,
                    deleteUnreferencedThreads: false,
                }),
                CollaborationCaret.configure({ provider }),
                Collaboration.configure({ document: ydoc }),
                Placeholder.configure({
                    placeholder: 'Write something …',
                }),
                Snapshot.configure({
                    provider,
                    onUpdate: data => {
                        console.log('@###Snapshot updated:', data);

                        setVersions(data.versions)
                        setIsAutoVersioning(data.versioningEnabled)
                        setLatestVersion(data.version)
                        setCurrentVersion(data.currentVersion)
                    },
                }),
            ],
            autofocus: true,
            content: ` `,
            onSelectionUpdate: ({ editor }) => {
                updateToolbarState();
                checkTableActive();
            },
            onCreate: ({ editor: currentEditor }) => {
                updateToolbarState();
                checkTableActive();
                provider.on('synced', () => {
                    if (currentEditor.isEmpty) {
                        currentEditor.commands.setContent(``);
                    }
                });

            },
            onUpdate: ({ editor }) => {
                const json = editor.getJSON();
                const updatedContent = json.content;
                // ✅ Safe WebSocket send
                const payload = {
                    content: updatedContent,
                    type: "doc"
                }
                if (saveMode == false) {
                    if (webIORef.current && webIORef.current.readyState === 1) {
                        webIORef.current.send(JSON.stringify({
                            type: "create-document", // or "update-document"
                            userId: user._id,
                            username: user.name,
                            editionId: editionId,
                            content: payload,
                        }));
                    }
                } else {
                    if (webIORef.current && webIORef.current.readyState === 1) {
                        webIORef.current.send(JSON.stringify({
                            type: "update-document",
                            userId: user._id,
                            username: user.name,
                            editionId: editionId,
                            content: payload,
                        }));
                    }
                }
            },
            plugins: [
                // ... your other plugins
                suggestChanges(),
            ],
        });

        setEditor(newEditor);

        return () => newEditor.destroy(); // cleanup on action change
    }, []);
    const checkTableActive = useCallback(() => {
        if (!editor) return;
        const shouldShow = editor.state.selection.empty;
        setShowInputBox(false)
        if (shouldShow) {
            const tableActive = editor.isActive('table');
            setIsTableActive(tableActive);
        } else {
            setIsTableActive(false);
        }
        const { from } = editor.state.selection;
        const start = editor.view.coordsAtPos(from); // get DOM coords

        const editorEl = editor.view.dom.getBoundingClientRect();

        setTooltipPosition({
            top: start.top - editorEl.top, // offset below selection
            left: start.left - editorEl.left,
        });
    }, [editor]);

    useEffect(() => {
        if (
            editor &&
            editor.view &&
            typeof editor.view.dom !== 'undefined' &&
            currentUser
        ) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            editor.chain().focus().updateUser(currentUser).run();
        }
    }, [editor, currentUser]);

    useEffect(() => {
        currentUserRef.current = currentUser;

        if (editor) {
            editor.chain().updateUser(currentUser).run();
        }
    }, [currentUser, editor]);

    // Function to update toolbar state based on current selection
    const updateToolbarState = useCallback(() => {
        if (!editor) return;

        // Update font size from current selection
        const currentFontSize = editor.getAttributes('textStyle').fontSize;
        if (currentFontSize) {
            const size = parseInt(currentFontSize.replace('px', ''));
            if (!isNaN(size) && size !== fontSize) {
                setFontSize(size);
            }
        } else {
            setFontSize(16);
        }

        // Update heading level
        setHeadingLevel(getCurrentHeadingLevel());

        // Update font family
        setFontFamily(getCurrentFontFamily());

        // Update text alignment
        setTextAlignment(getCurrentTextAlignment());
    }, [editor, fontSize]);

    // Add effect to listen to editor updates
    useEffect(() => {
        if (editor) {
            const updateHandler = () => {
                updateToolbarState();
                checkTableActive();
            };

            editor.on('selectionUpdate', updateHandler);
            editor.on('transaction', updateHandler);

            return () => {
                editor.off('selectionUpdate', updateHandler);
                editor.off('transaction', updateHandler);
            };
        }
    }, [editor, updateToolbarState, checkTableActive]);

    const handleFontSizeChange = (newSize) => {
        if (newSize >= 8 && newSize <= 72) {
            setFontSize(newSize);
            if (editor) {
                editor.chain().focus().setFontSize(`${newSize}px`).run();
            }
        }
    };

    const increaseFontSize = () => {
        const newSize = Math.min(fontSize + 2, 72);
        handleFontSizeChange(newSize);
    };

    const decreaseFontSize = () => {
        const newSize = Math.max(fontSize - 2, 8);
        handleFontSizeChange(newSize);
    };

    const handleColorChange = (event) => {
        if (editor) {
            editor.chain().focus().setColor(event.target.value).run();
        }
    };
    const handleBgColorChange = (event) => {
        if (editor) {
            editor.chain().focus().setBackgroundColor(event.target.value).run();
        }
    };

    const handleHeadingChange = (event) => {
        const level = event.target.value;
        setHeadingLevel(level);

        if (!editor) return;

        if (level === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else {
            const headingLevel = parseInt(level.replace('h', ''));
            editor.chain().focus().toggleHeading({ level: headingLevel }).run();
        }
    };

    const getCurrentHeadingLevel = () => {
        if (!editor) return 'paragraph';

        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i })) {
                return `h${i}`;
            }
        }
        return 'paragraph';
    };

    const handleFontFamilyChange = (event) => {
        const family = event.target.value;
        setFontFamily(family);
        if (editor) {
            editor.chain().focus().setFontFamily(family).run();
        }
    };

    const getCurrentFontFamily = () => {
        if (!editor) return 'Inter';
        return editor.getAttributes('textStyle').fontFamily || 'Inter';
    };

    const getCurrentTextAlignment = () => {
        if (!editor) return 'left';

        const alignments = ['left', 'center', 'right', 'justify'];
        for (const alignment of alignments) {
            if (editor.isActive({ textAlign: alignment })) {
                return alignment;
            }
        }
        return 'left';
    };
    const handleLineHeightChange = (event) => {
        const lineHeight = event.target.value;
        if (editor) {
            editor.chain().focus().setLineHeight(lineHeight).run();
        }
    };
    const getCorrentLineHeaght = () => {
        if (!editor) return '1.5';
        return editor.getAttributes('textStyle').lineHeight || '1.5';
    };
    const getCurrentColor = () => {
        if (!editor) return '#000000';
        return editor.getAttributes('textStyle').color || '#000000';
    };
    const getCurrentBgColor = () => {
        if (!editor) return '#000000';
        return editor.getAttributes('textStyle').backgroundColor || '#000000';
    };

    const handleTextAlignmentChange = (event) => {
        const alignment = event.target.value;
        setTextAlignment(alignment);
        if (editor) {
            editor.chain().focus().setTextAlign(alignment).run();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !editor) return;

        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
    };

    const handleImportFilePick = useCallback(async (e) => {
        const file = e.target.files[0];
        if (importRef.current) {
            importRef.current.value = "";
        }
        if (!file || !editor) return;
        setIsLoading(true);

        await new Promise((resolve) => {
            editor.chain().importDocx({
                file,
                onImport: async (context) => {
                    if (context.error) {
                        console.error("Import error:", context.error);
                        setIsLoading(false);
                        return resolve(); // Resolve even on error to stop hanging
                    }

                    editor.commands.setContent(context.content);
                    const updatedContent = context.content;

                    if (saveMode === false) {
                        if (webIORef.current?.readyState === 1) {
                            webIORef.current.send(JSON.stringify({
                                type: "create-document",
                                userId: user._id,
                                username: user.name,
                                editionId,
                                content: updatedContent,
                            }));
                        }
                    } else {
                        if (webIORef.current?.readyState === 1) {
                            webIORef.current.send(JSON.stringify({
                                type: "update-document",
                                userId: user._id,
                                username: user.name,
                                editionId,
                                content: updatedContent,
                            }));
                        }
                    }

                    AlertService.success('Document imported successfully!');

                    // Now wait until this finishes, AFTER content is fully set
                    if (webIORef.current?.readyState === 1) {
                        webIORef.current.send(JSON.stringify({
                            type: 'bulk-delete-suggestion-comments',
                            editionId: editionId,
                        }));
                    }

                    setIsLoading(false);
                    resolve(); // ✅ Import and socket complete
                },
            }).run();
        });

    }, [editor]);

    const handleImportClick = useCallback(() => {
        if (importRef.current) {
            importRef.current.click();
        }
    }, []);
    const handleMenuSelect = (event) => {
        const selectedMode = event.target.value;
        console.log(selectedMode);
        setMode(selectedMode);

        switch (selectedMode) {
            case "Editing":
            case "Suggesting":
                editor?.setEditable(true);
                editor.SnapshotCompare?.clearComparisons();
                setVersioningModalOpen(false);
                break;

            case "History":
                setVersioningModalOpen(true);
                editor?.setEditable(false);
                break;

            case "View":
            default:
                setVersioningModalOpen(false);
                editor?.setEditable(false);
                break;
        }
    };

    useEffect(() => {
        console.log("fnfnfn_", editionsById?.editions);

        if (roleName === "author" && editionsById?.editions?.isAuthorApproved === false) {
            setIsEditor(true);
            editor?.setEditable(false);
            setMode("View");
        } else if (roleName === "editor") {
            if (editionsById?.editions?.isEditorApproved === true) {
                setIsEditor(false);
                editor?.setEditable(false);
                setMode("View");
            } else {
                setIsEditor(true);
                editor?.setEditable(true);
                setMode("Editing");
            }
        } else if (editionsById?.editions?.isAuthorApproved === true) {
            setIsEditor(false);
            editor?.setEditable(false);
            setMode("View");
        } else {
            setIsEditor(false);
            editor?.setEditable(false);
            setMode("View");
        }
    }, [roleName, editionsById])

    useEffect(() => {
        if (!editionId || !stableUser) return;
        const ws = new WebSocket(VITE_SOCKET_URL + editionId);
        ws.onopen = () => {
            console.log("✅ WebSocket connected");
            webIORef.current = ws;
            ws.send(JSON.stringify({ type: "join-room", userId: user._id, username: user.name }));
            ws.send(JSON.stringify({ type: "get-all-documents", editionId }));
            ws.send(JSON.stringify({ type: "all-comments", editionId }));
            ws.send(JSON.stringify({ type: "get-suggestion", editionId }));
        };
        getReRender(ws)
    }, [editionId, stableUser]);

    const getReRender = async (ws) => {
        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case "user-joined":
                    console.log("👤 User joined:", message.username);
                    break;
                case "user-left":
                    console.log("👋 User left:", message.username);
                    break;
                case "current-users":
                    console.log("🧑‍🤝‍🧑 Users in room:", message.users);
                    break;
                case "all-documents":
                    console.log("📄 Got documents:", message.data);
                    if (message.data?.content) {
                        setSaveMode(true);
                        /*  const updatedContent = injectPageBreaksIntoJSON(message.data.content);
                         await waitUntilEditorViewIsReady(editor);
                         requestAnimationFrame(() => {
                             try {
                                 editor?.commands.setContent(updatedContent);
                                 console.log("✅ Content synced");
                             } catch (err) {
                                 console.error("❌ Set content error:", err);
                                 setError("Setting content failed.");
                             } finally {
                                 setIsLoading(false);
                             }
                         }); */
                    } else {
                        setSaveMode(false);
                    }
                    break;
                case "all-comments":
                    console.log("📄 Got comments:", message.data);
                    setThreads(message.data);
                    /* editor
                        .chain()
                        .setThread(message.data)
                        .run() */
                    break;
                case "get-suggestion":
                    console.log("📄 Got Suggisytion:", message.data);
                    break;
            }
        };

        ws.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        ws.onclose = () => {
            console.log("🔌 WebSocket closed");
            webIORef.current = null;
        };

        return () => {
            ws.close();
            webIORef.current = null;
        };
    }
    /* version changes starts */
    const getCorrentVersionStatus = () => {
        if (!editor) return false;
        return isAutoVersioning;
    };

    const handleSwitchChange = () => {
        editor.commands.toggleVersioning();
        setIsAutoVersioning(enabled);
    };


    const handleVersioningClose = useCallback(() => {
        setVersioningModalOpen(false);
    }, [])

    const handleRevert = useCallback((version, versionData) => {
        const versionTitle = versionData ? versionData.name || renderDate(versionData.date) : version
        editor.commands.revertToVersion(version, `Revert to ${versionTitle}`, `Unsaved changes before revert to ${versionTitle}`)
        setAction('Editing');
    }, [editor]);
    useEffect(() => {
        const onUpdate = () => {
            setHasChanges(true)
        }

        const onSynced = () => {
            ydoc.on('update', onUpdate)
        }

        provider.on('synced', onSynced)

        return () => {
            provider.off('synced', onSynced)
            ydoc.off('update', onUpdate)
        }
    }, [ydoc])

    /* version changes ends */

    /* comments logic starts */
    const { threads, createThread } = useThreads(provider, editor, user, webIORef, getThreds || []);
    const filteredThreads = Array.isArray(threads)
        ? threads
        : [];

    threadsRef.current = threads;
    useEffect(() => {

        if (!editor || editor.state.selection.empty) {
            setTooltipPosition(null);
            return;
        }

        const { from } = editor.state.selection;
        const start = editor.view.coordsAtPos(from); // get DOM coords

        const editorEl = editor.view.dom.getBoundingClientRect();

        setTooltipPosition({
            top: start.top - editorEl.top, // offset below selection
            left: start.left - editorEl.left,
        });
    }, [editor?.state?.selection]);
    const handleSubmit = () => {
        if (!commentText || !editor || !user) return;

        editor.commands.setThread({
            content: commentText,
            commentData: {
                userName: user.name,
                userId: user._id,
                color: user.color,
            },
        });

        setTimeout(() => {
            const allThreads = provider.getThreads();
            const latest = allThreads?.[allThreads.length - 1];

            if (latest) {
                const payload = {
                    editionId,
                    content: {
                        content: commentText,
                        data: {
                            userName: user.name,
                            userId: user._id,
                            color: user.color,
                        },
                    },
                    threadId: latest.id,
                };

                if (webIORef.current?.readyState === 1) {
                    webIORef.current.send(
                        JSON.stringify({
                            type: 'create-thread',
                            ...payload,
                        })
                    );
                }
            }
        }, 300);
        setCommentText('');
        setShowInputBox(false);
    };
    const selectThreadInEditor = useCallback(threadId => {
        editor.chain().selectThread({ id: threadId }).run();
    }, [editor]);
    const deleteThread = useCallback(threadId => {
        provider.deleteThread(threadId)
        editor.commands.removeThread({ id: threadId })
    }, [editor]);
    const onHoverThread = useCallback(threadId => {
        hoverThread(editor, [threadId]);
    }, [editor]);
    const onLeaveThread = useCallback(() => {
        hoverOffThread(editor)
    }, [editor]);
    const resolveThread = useCallback(threadId => {
        editor.commands.resolveThread({ id: threadId })
    }, [editor]);

    const unresolveThread = useCallback(threadId => {
        editor.commands.unresolveThread({ id: threadId })
    }, [editor]);
    const updateComment = useCallback((threadId, commentId, content, metaData) => {
        editor.commands.updateComment({
            threadId, id: commentId, content, data: metaData,
        })
    }, [editor]);
    /* comments logic ends */

    const handleApprovalClick = async () => {
        try {
            console.log(editor?.getJSON());

            const updatedData = {};
            if (roleName === "author") {
                updatedData.isAuthorApproved = true;
                updatedData.editorContent = editor?.getJSON(); // ✅ move into updatedData
                updatedData.currentUser = user._id;
            } else if (roleName === "editor") {
                updatedData.isEditorApproved = true;
                updatedData.editorContent = editor?.getJSON(); // ✅ move into updatedData
                updatedData.currentUser = user._id;
            }

            if (Object.keys(updatedData).length > 0) {
                const result = await dispatch(updateEdition({ id: editionId, updatedData }));
                if (updateEdition.fulfilled.match(result)) {
                    console.log("✅ Edition updated successfully");
                    dispatch(getEditionsById(editionId)); // 🔄 Refetch
                    AlertService.success('Edition approved successfully!');
                }
            } else {
                AlertService.error('Failed to approve the edition.');
                console.warn("⚠️ Role is neither author nor editor. Skipping update.");
            }
        } catch (error) {
            AlertService.error('Failed to approve the edition.')
            console.error("❌ Error updating edition:", error);
        }
    };
    const showCommentBox = async (event) => {
        console.log("@#$event ", event);
        setShowInputBox(true);
    }
    useEffect(() => {
        console.log("showInputBox", showInputBox);

    }, [showInputBox])
    const editorWrapperRef = useRef(null);
    const [showUnresolved, setShowUnresolved] = useState(true);
    const [status, setStatus] = useState('connecting');
    const { selectedThreads, CurrentSelectedThread } = useThreadsState();
    return (
        <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f5', position: 'relative' }}>
            <EditorToolbar
                editor={editor}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                headingLevel={headingLevel}
                setHeadingLevel={setHeadingLevel}
                textAlignment={textAlignment}
                setTextAlignment={setTextAlignment}
                isLoading={isLoading}
                handleImportClick={handleImportClick}
                importRef={importRef}
                handleImportFilePick={handleImportFilePick}
                increaseFontSize={increaseFontSize}
                decreaseFontSize={decreaseFontSize}
                handleColorChange={handleColorChange}
                handleBgColorChange={handleBgColorChange}
                handleHeadingChange={handleHeadingChange}
                getCurrentColor={getCurrentColor}
                getCurrentBgColor={getCurrentBgColor}
                handleFontFamilyChange={handleFontFamilyChange}
                handleTextAlignmentChange={handleTextAlignmentChange}
                handleImageUpload={handleImageUpload}
                mode={mode}
                handleMenuSelect={handleMenuSelect}
                getCorrentLineHeaght={getCorrentLineHeaght}
                handleLineHeightChange={handleLineHeightChange}
                getCorrentVersionStatus={getCorrentVersionStatus}
                handleSwitchChange={handleSwitchChange}
                handleApprovalClick={handleApprovalClick}
                suggestionLength={0}
                isEditor={isEditor}
                hasChanges={hasChanges}
                setHasChanges={setHasChanges}
            />

            <Box sx={{
                height: 'calc(100vh - 64px)',
                overflow: 'auto',
                p: 3,
                pt: 2
            }}>
                <Paper
                    elevation={3}
                    sx={{
                        // p: 3,
                        // backgroundColor: '#ffffff',
                        minHeight: 'calc(100vh - 140px)',
                        '& .ProseMirror': {
                            outline: 'none',
                            minHeight: '500px',
                            padding: '20px',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            fontFamily: 'Inter, Arial, sans-serif',
                            '& p': {
                                margin: '0 0 1em 0',
                                '&:last-child': {
                                    marginBottom: 0
                                }
                            },
                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                margin: '1.5em 0 0.5em 0',
                                '&:first-child': {
                                    marginTop: 0
                                }
                            },
                            '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                margin: '1em 0'
                            },
                            '& a': {
                                color: '#667eea',
                                textDecoration: 'underline',
                                '&:hover': {
                                    color: '#764ba2'
                                }
                            },
                            '& table': {
                                borderCollapse: 'collapse',
                                margin: '1.5rem 0',
                                width: '100%',
                                '& td, & th': {
                                    border: '1px solid #ddd',
                                    padding: '8px 12px',
                                    minWidth: '50px',
                                    position: 'relative',
                                },
                                '& th': {
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                },
                                '& tr:nth-of-type(even)': {
                                    backgroundColor: '#fafafa',
                                },
                                '&:hover': {
                                    '& td, & th': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }
                        }
                    }}
                >

                    <EditorContext.Provider value={{ editor }} >
                        {(mode === "Editing" || mode === "View" || mode == "Suggesting") ? (
                            <>
                                <div style={{ height: 0 }}>


                                    {(mode === "Editing" || mode === "Suggesting") &&
                                        (
                                            <TableControls
                                                editor={editor}
                                                isTableActive={isTableActive}
                                            />
                                        )}
                                    {!editor?.state.selection.empty && (
                                        <Tooltip title="Add Comment" className="capsule-comment" style={{ top: tooltipPosition?.top + "px" }}>
                                            <IconButton onClick={() => showCommentBox(true)}>
                                                <CommentIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
                                    <div ref={editorWrapperRef} data-viewmode={showUnresolved ? 'open' : 'resolved'}>
                                        <EditorContent editor={editor} style={{ height: '100%', width: '100%', paddingBottom: '20%', backgroundColor: '#ffffff', }} />
                                        <div className="collab-status-group" sx={{ width: '300px', background: '#f9fbfd', ml: 'auto' }}
                                            data-state={status === 'connected' ? 'online' : 'offline'}>
                                        </div>
                                    </div>
                                    <Box sx={{ width: '300px', background: '#f9fbfd', ml: 'auto' }}>
                                        <ThreadsProvider
                                            onClickThread={selectThreadInEditor}
                                            onDeleteThread={deleteThread}
                                            onHoverThread={onHoverThread}
                                            onLeaveThread={onLeaveThread}
                                            onResolveThread={resolveThread}
                                            onUnresolveThread={unresolveThread}
                                            onUpdateComment={updateComment}
                                            selectedThreads={editor?.storage?.comments?.focusedThreads || []}
                                            selectedThread={selectedThread}
                                            setSelectedThread={setSelectedThread}
                                            threads={threads}
                                        >
                                            <div className="sidebar-options sidebar" style={{ background: '#fdfdfd', width: '300px', padding: '10px' }}>
                                                <div className="option-group">
                                                    <div className="label-large">Comments</div>

                                                </div>
                                                {(!editor?.state.selection.empty && (mode === "Editing" || mode === "Suggesting")) && (
                                                    <div style={{ position: 'relative', top: tooltipPosition?.top + "px", width: '100%' }}>

                                                        {showInputBox && (
                                                            <div className='comment-wrapper'>
                                                                <div className="comment-input-box">
                                                                    <div style={{ fontSize: '0.8rem', marginBottom: 4 }}>
                                                                        {/* <Avatar src={user.avatarUrl} alt={user.name} /> */}
                                                                        {user?.name}</div>
                                                                    <textarea
                                                                        value={commentText}

                                                                        onChange={(e) => setCommentText(e.target.value)}
                                                                        placeholder="Write your comment..."
                                                                        style={{ width: '100%', height: 60, resize: 'none' }}
                                                                    />
                                                                    <div style={{ marginTop: 8, textAlign: 'center', display: 'flex', justifyContent: 'space-around' }}>
                                                                        <Button disabled={!commentText} variant='contained' onClick={handleSubmit} style={{ height: '25px' }}>Submit</Button>
                                                                        <Button onClick={() => setShowInputBox(false)} variant='outlined' style={{ height: '25px' }}>Cancel</Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* <ThreadsList className="tiptap" provider={provider} threads={filteredThreads} WebSocket={webIORef} /> */}
                                                <div
                                                    className="threads-group"
                                                    style={{
                                                        height: '45vh',
                                                        overflowY: 'auto',
                                                        padding: '10px',
                                                    }}
                                                >
                                                    {filteredThreads.map((thread) => (
                                                        <ThreadsListItem
                                                            key={thread.id}
                                                            thread={thread}
                                                            active={
                                                                selectedThreads.includes(thread.id) || selectedThread === thread.id
                                                            }
                                                            open={selectedThread === thread.id}
                                                            provider={provider}
                                                            WebSocket={webIORef}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </ThreadsProvider>
                                    </Box>
                                </div>
                            </>
                        ) : (
                            <VersioningModal
                                versions={versions}
                                isOpen={versioningModalOpen}
                                onClose={handleVersioningClose}
                                onRevert={handleRevert}
                                currentVersion={currentVersion}
                                latestVersion={latestVersion}
                                provider={provider}
                            />
                        )}

                    </EditorContext.Provider>
                </Paper>
            </Box>
        </Box>
    );
};

export default NewEditorComponent;