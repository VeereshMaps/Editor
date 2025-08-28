import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { MenuBar } from "./MenuBar";
import { RulesModal } from "./RulesModal";
import { SuggestionTooltip } from "./SuggestionTooltip";
import { initialRules } from "../constants/initial-rules";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import StarterKit from "@tiptap/starter-kit";
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from "@tiptap/extension-image";
import { CommentsKit, hoverOffThread, hoverThread } from '@tiptap-pro/extension-comments'
import { FontSize, TextStyle, FontFamily, Color } from '@tiptap/extension-text-style'
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";


import AiSuggestion from "@tiptap-pro/extension-ai-suggestion";
import { ImportDocx } from '@tiptap-pro/extension-import-docx'

import { ThreadsList } from './ThreadsList'
import { ThreadsProvider } from './context'
import { useThreads } from './hooks/useThreads'
import { useUser } from './hooks/useUser'

import Collaboration from "@tiptap/extension-collaboration";

import { Pagination } from 'tiptap-pagination-breaks';
import { Markdown } from 'tiptap-markdown';
import Comments from '@tiptap-pro/extension-comments';
import PageBreak from './extensions/PageBreak';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import "../styles/collab-cursor.css";
import "../styles/tiptap.css";
// import "../styles/comment.css";
import "../styles/style.scss";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { CustomHighlight } from "./CustomHighlight";
import { AISuggestionsSidebar } from "./EditorSidebar";
import { useDispatch, useSelector } from 'react-redux';

import Paragraph from '@tiptap/extension-paragraph';
// import CollaborationHistory from '@tiptap-pro/extension-collaboration-history'
import { VersioningModal } from './tiptop_version/VersioningModal';
import { renderDate } from './tiptop_version/utils';
import { InlineThread } from '@tiptap-pro/extension-comments'
import { getEditionsById } from 'redux/Slices/editionByIdSlice';
import { updateEdition } from 'redux/Slices/updateEditionSlice';
import { TextField, Button, Box } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Avatar from '@mui/material/Avatar';


//API's for suggestions
import { createSuggestion, deleteSuggestion, fetchSuggestions, updateSuggestion } from '../redux/Slices/suggestionSlice'

//track-changes or suggestion imports
import { Extension, Editor, Mark } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Fragment } from 'prosemirror-model';
import moment from 'moment-timezone';
import AlertService from 'utils/AlertService';




import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { BulletList, OrderedList, ListItem, ListKeymap, TaskList, TaskItem } from '@tiptap/extension-list'
import { useEditor, EditorContent } from '@tiptap/react'
import Text from '@tiptap/extension-text'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Focus, Placeholder, UndoRedo, Dropcursor, Gapcursor, CharacterCount } from '@tiptap/extensions'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Snapshot from '@tiptap-pro/extension-snapshot'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'

const defaultContent = `
    <p>Hi Welcome To Document Editor</p>
    <p>Start your document editing</p>
  `;

const CustomParagraph = Paragraph.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            role: {
                default: null,
                parseHTML: element => element.getAttribute('data-role'),
                renderHTML: attributes => {
                    if (!attributes.role) {
                        return {};
                    }
                    return {
                        'data-role': attributes.role,
                    };
                },
            },
        };
    },
});


const getInitialUser = () => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = `${storedUser.firstName || 'User'} ${storedUser.lastName || ''}`.trim();
    return {
        name: userName || 'Anonymous',
        id: storedUser._id || null,
        color: storedUser.color,
    };
};

const EditorComponent = ({ ydoc, provider, room }) => {
    const dispatch = useDispatch();
    const editionsById = useSelector((state) => state.editionsById);
    const loginDetails = useSelector((state) => state.auth);
    const [trackChangeDetails, setTrackChangeDetails] = useState([]);
    // const trackChangeDetails = useSelector((state) => state.suggestion);
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const [status, setStatus] = useState('connecting');
    const [currentUser, setCurrentUser] = useState(getInitialUser());
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sideBarMenu, setSideBarMenu] = useState(false);
    const [rules, setRules] = useState(initialRules);
    const [tooltipElement, setTooltipElement] = useState(null);
    const [editor, setEditor] = useState(null);
    const importRef = useRef(null);
    // const APP_ID = "8mzjy21k";
    const APP_ID = "6kpvqylk";
    const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    const user = useUser();
    const [action, setAction] = useState(() => {
        if (roleName === "author" && editionsById?.editions?.isAuthorApproved === false) {
            return 'Suggesting';
            // return 'Editing';
        }
        if (roleName === "editor") {
            if (editionsById?.editions?.isEditorApproved === true) {
                return 'View';
            }
            return 'Suggesting';
        }
        if (editionsById?.editions?.isAuthorApproved === true) {
            return 'View';
        }
        return 'View';
    });

    const [editionId] = useState(room);
    const webIORef = useRef(null);
    const [getThreds, setThreads] = useState([]);
    const [mode, setMode] = useState(false);
    const threadsRef = useRef([])
    const [selectedThread, setSelectedThread] = useState(null)
    const [latestVersion, setLatestVersion] = React.useState(null)
    const [currentVersion, setCurrentVersion] = React.useState(null)
    const [versions, setVersions] = React.useState([])
    const [isAutoVersioning, setIsAutoVersioning] = React.useState(false)
    const [versioningModalOpen, setVersioningModalOpen] = React.useState(false)
    const [hasChanges, setHasChanges] = React.useState(false)
    const [showInputBox, setShowInputBox] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [fontSize, setFontSize] = useState('14px');
    const [tooltipPosition, setTooltipPosition] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const [showUnresolved, setShowUnresolved] = useState(true)
    const [activeTab, setActiveTab] = useState(roleName === "editor" ? 'ai' : 'comments'); // 'ai' or 'comments'
    const [commitDescription, setCommitDescription] = useState('');
    const editorModeRef = useRef(action);
    const currentUserRef = useRef(currentUser);
    const [activeSuggestion, setActiveSuggestion] = useState(null);
    const [activeSuggestionId, setActiveSuggestionId] = useState(null);
    const [suggestionPopupVisible, setSuggestionPopupVisible] = useState(false);
    const [highlightedSuggestionId, setHighlightedSuggestionId] = useState(null);
    const popupRef = useRef(null);
    const [popupCoords, setPopupCoords] = useState({ top: 0, left: 0 });
    let tempSuggestion = null;
    let lastCursorPos = null;
    let currentSuggestionId = null;
    const prevLineTopRef = useRef(null);
    const editorWrapperRef = useRef(null);

    const SuggestionDeletionMark = Mark.create({
        name: 'suggestion-deletion',

        addAttributes() {
            const user = currentUserRef.current;
            return {
                username: { default: user.name },
                userId: { default: user.id },
                color: { default: user.color },
                createdAt: { default: () => new Date().toISOString() },
                suggestionId: { default: null },
            };
        },

        parseHTML() {
            return [{ tag: 'del[data-suggestion-deletion]' }];
        },

        renderHTML({ HTMLAttributes }) {
            const viewerUserId = this.options.viewerUserId ?? null;
            const isOwnDeletion = HTMLAttributes.userId === viewerUserId;
            const color = !isOwnDeletion ? HTMLAttributes.color : '#008000';
            const borderStyle = isOwnDeletion ? 'solid' : 'dashed';

            return [
                'del',
                {
                    ...HTMLAttributes,
                    'data-suggestion-deletion': 'true',
                    'data-user': HTMLAttributes.username,
                    'data-timestamp': HTMLAttributes.createdAt,
                    'data-suggestion-id': HTMLAttributes.suggestionId,
                    class: `suggestion-deletion user-${HTMLAttributes.userId}`,
                    style: `
                  text-decoration: line-through;
           border-top: 1px ${borderStyle} ${color};
  border-bottom: 1px ${borderStyle} ${color};
  border-radius: 2px;
        `,
                },
                0,
            ];
        },
    });

    const SuggestionMark = Mark.create({
        name: 'suggestion',

        addOptions() {
            return {
                viewerUserId: null,
            };
        },

        addAttributes() {
            return {
                username: { default: 'User' },
                userId: { default: null },
                color: { default: '#0000ff' },
                suggestionId: { default: null },
                createdAt: { default: () => new Date().toISOString() },
            };
        },

        parseHTML() {
            return [{ tag: 'span[data-suggestion]' }];
        },

        renderHTML({ HTMLAttributes, options = {} }) {
            const isOwn = HTMLAttributes.userId === options.viewerUserId;
            const userClass = isOwn ? 'suggestion-own' : 'suggestion-other';
            const userIdClass = `user-${HTMLAttributes.userId}`;
            const userColor = HTMLAttributes.color || '#444475ff';

            return [
                'span',
                {
                    ...HTMLAttributes,
                    'data-suggestion': 'true',
                    'data-user': HTMLAttributes.username,
                    'data-timestamp': HTMLAttributes.createdAt,
                    'data-suggestion-id': HTMLAttributes.suggestionId,
                    class: `suggestion ${userClass} ${userIdClass}`,
                    style: `color: ${userColor};`,
                    // style: `border: 1px solid ${userColor}; border-radius: 2px;`,
                },
                0,
            ];
        },
    });

    const SuggestionExtension = Extension.create({
        name: 'suggestion-extension',

        addOptions() {
            return {
                getMode: () => 'View',
                getUser: () => ({ id: null, name: 'Anonymous' }),
            }
        },

        addProseMirrorPlugins() {
            return [
                SuggestionPlugin({
                    getMode: this.options.getMode,
                    getUser: this.options.getUser,
                }),
            ]
        },
    });

    // const FontFamily = Extension.create({
    //     name: "fontFamily",

    //     addGlobalAttributes() {
    //         return [
    //             {
    //                 types: ["textStyle"],
    //                 attributes: {
    //                     fontFamily: {
    //                         default: null,
    //                         parseHTML: (element) => element.style.fontFamily || null,
    //                         renderHTML: (attributes) => {
    //                             if (!attributes.fontFamily) return {};
    //                             return { style: `font-family: ${attributes.fontFamily}` };
    //                         },
    //                     },
    //                 },
    //             },
    //         ];
    //     },
    // });

    const setFontFamily = (editor, fontFamily) => {
        const { state, view } = editor;
        const { tr } = state;

        const markType = state.schema.marks.textStyle;

        if (state.selection.empty) {
            alert
            // apply to stored marks so new typed text inherits it
            if (fontFamily) {
                tr.addStoredMark(markType.create({ fontFamily }));
            } else {
                tr.removeStoredMark(markType); // reset if null
            }
            view.dispatch(tr);
        } else {
            // apply to existing selection
            editor.chain().focus().setMark("textStyle", { fontFamily }).run();
        }
    };








    const showVersioningModal = useCallback(() => {
        setVersioningModalOpen(true)
    }, []);

    //Main Editor Initialization
    useEffect(() => {
        if (!action) return;

        const newEditor = new Editor({
            extensions: [
                StarterKit.configure({ history: false, paragraph: false }),
                CustomParagraph,
                ImportDocx.configure({
                    appId: APP_ID,
                    token: documentToken,
                    endpoint: "https://api.tiptap.dev/v1/convert",
                    experimentalDocxImport: true,
                }),
                CollaborationCaret.configure({ provider }),
                CommentsKit.configure({
                    provider,
                    useLegacyWrapping: false,
                    deleteUnreferencedThreads: false,
                }),
                CustomHighlight,
                Image.configure({ inline: true, allowBase64: true }),
                Table.configure({ resizable: true }),
                InlineThread,
                TextStyle.extend({
                    addAttributes() {
                        return {
                            fontFamily: {
                                default: null,
                                parseHTML: el => el.style.fontFamily?.replace(/['"]/g, ''),
                                renderHTML: attrs => attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
                            },
                        }
                    },
                }),
                // FontSize.configure({
                //     defaultSize: '14px',
                //     step: 2,
                // }),
                FontSize.configure({
                    types: ['textStyle'],
                }),
                FontFamily,
                TextStyleKit,
                Underline,
                Color,
                Highlight.configure({ multicolor: true }),
                Superscript,
                Subscript,
                Strike,
                Link,
                TableRow,
                TableCell,
                TableHeader,
                TextAlign.configure({ types: ['heading', 'paragraph', 'orderedList'] }),
                /* TaskList,
                   TaskItem,
                    Markdown.configure({
                       html: true,                  // Allow HTML input/output
                       tightLists: true,            // No <p> inside <li> in markdown output
                       tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight
                       bulletListMarker: '-',       // <li> prefix in markdown output
                       linkify: false,              // Create links from "https://..." text
                       breaks: false,               // New lines (\n) in markdown input are converted to <br>
                       transformPastedText: false,  // Allow to paste markdown text in the editor
                       transformCopiedText: false,  // Copied text is transformed to markdown
                   }),
                   CharacterCount.extend().configure({ limit: 10000 }), */
                Collaboration.configure({ document: ydoc }),
                // CollabHistory.configure({
                //     provider,
                // }),
                Snapshot.configure({
                    provider,
                    onUpdate: data => {
                        setVersions(data.versions)
                        setIsAutoVersioning(data.versioningEnabled)
                        setLatestVersion(data.version)
                        setCurrentVersion(data.currentVersion)
                    },
                }),
                // SuggestionMark.configure({
                //     viewerUserId: currentUserRef.current?.id || 'anonymous',
                // }),
                // SuggestionDeletionMark.configure({
                //     viewerUserId: currentUserRef.current?.id || 'anonymous',
                // }),
                // SuggestionExtension.configure({
                //     getMode: () => editorModeRef.current,
                //     getUser: () => currentUserRef.current,
                // }),
                // SuggestionFinalizer,
            ],
            selector: ctx => {
                return {
                    Arial: ctx.editor.isActive('textStyle', { fontFamily: 'Arial' }),
                    TimesNewRoman: editor.isActive('textStyle', { fontFamily: '"Times New Roman"' }),
                }
            },
            onCreate: ({ editor: currentEditor }) => {
                provider.on('synced', () => {
                    if (currentEditor.isEmpty) {
                        currentEditor.commands.setContent(defaultContent);
                    }
                });

            },
            onUpdate: ({ editor }) => {
                const json = editor.getJSON();
                // const updatedContent = injectPageBreaksIntoJSON(json.content);
                const updatedContent = json.content;
                // ✅ Safe WebSocket send
                const payload = {
                    content: updatedContent,
                    type: "doc"
                }
                if (mode == false) {
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
                updateSuggestions(editor);
            },
            onSelectionUpdate({ editor }) {
                const { from } = editor.state.selection;

                const view = editor.view;
                const domAt = view.domAtPos(from);
                const domNode = domAt.node?.nodeType === 3 ? domAt.node.parentElement : domAt.node;
                const paragraphNode = domNode?.closest('p') || domNode?.closest('[data-node-view-wrapper]');
                const currentLineTop = paragraphNode?.offsetTop;

                prevLineTopRef.current = currentLineTop;

                const { empty, from: selFrom, to: selTo } = editor.state.selection;
                if (!empty && selFrom !== selTo) {
                    const selectedText = editor.state.doc.textBetween(selFrom, selTo, ' ');
                    console.log('📝 Selected text:', selectedText);
                } else {
                    setShowInputBox(false);
                }
            },
        });
        setEditor(newEditor);


        return () => newEditor.destroy(); // cleanup on action change
    }, []);

    const stableUser = useMemo(() => user, [user?._id]);
    const { threads, createThread } = useThreads(provider, editor, user, webIORef, getThreds || []);
    const filteredThreads = Array.isArray(threads)
        ? threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))
        : [];

    threadsRef.current = threads;

    useEffect(() => {
        dispatch(getEditionsById(editionId));
        // dispatch(fetchSuggestions(editionId));
    }, []);

    useEffect(() => {
        editorModeRef.current = action;
    }, [action]);

    useEffect(() => {
        currentUserRef.current = currentUser;

        if (editor) {
            editor.chain().updateUser(currentUser).run();
        }
    }, [currentUser, editor]);

    useEffect(() => {
        if (roleName === "author" && editionsById?.editions?.isAuthorApproved === false) {
            editor && editor.setEditable(true);
            setMode("Editing");
        } else if (roleName === "editor") {
            // If editor and NOT approved yet, view mode + editor enabled
            if (editionsById?.editions?.isEditorApproved === true) {
                setMode("View");
                editor && editor.setEditable(false);
            } else {
                // Editor and approved (or any other case)
                setMode("Editing");
                editor && editor.setEditable(true);
            }
        } else if (editionsById?.editions?.isAuthorApproved === true) {
            setMode("View");
            editor && editor.setEditable(false);
        } else {
            setMode("View");
            editor && editor.setEditable(false);
        }
    }, [editionsById, roleName, editor]);

    useEffect(() => {
        if (!editionId || !stableUser) return;
        const ws = new WebSocket(VITE_SOCKET_URL + editionId);
        // const ws = new WebSocket("ws://localhost:5000/ws/" + editionId);
        ws.onopen = () => {
            console.log("✅ WebSocket connected");
            // alert("WebSocket URL: " + ws.url);
            // alert("Enter")
            // alert("Ready state: " + ws.readyState);
            webIORef.current = ws;
            // 0: CONNECTING
            // 1: OPEN
            // 2: CLOSING
            // 3: CLOSED
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
                        setMode(true);
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
                        setMode(false);
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
                    setTrackChangeDetails(message.data)
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

    useEffect(() => {
        const statusHandler = event => setStatus(event.status);
        provider.on('status', statusHandler);
        return () => provider.off('status', statusHandler);
    }, [provider]);

    useEffect(() => {
        if (editor && currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            editor.chain().focus().updateUser(currentUser).run();
        }
    }, [editor, currentUser]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run();
        };
        reader.readAsDataURL(file);
    };

    const handleImportClick = useCallback(() => {
        importRef.current.click();
    }, []);

    // const handleImportFilePick = useCallback(async (e) => {
    //     const file = e.target.files[0];
    //     importRef.current.value = "";
    //     if (!file) return;

    //     setIsLoading(true);

    //     await editor.chain().import({
    //         file,
    //         onImport: async (context) => {
    //             if (context.error) {
    //                 console.error("Import error:", context.error);
    //             } else {
    //                 setIsLoading(false);
    //                 editor.commands.setContent(context.content);
    //                 // editor.commands.setTextSelection(editor.state.doc.content.size);
    //                 // editor.commands.focus();
    //                 // await waitUntilEditorViewIsReady(editor);
    //                 const updatedContent = context.content;
    //                 if (mode == false) {
    //                     if (webIORef.current && webIORef.current.readyState === 1) {
    //                         webIORef.current.send(JSON.stringify({
    //                             type: "create-document", // or "update-document"
    //                             userId: user._id,
    //                             username: user.name,
    //                             editionId,
    //                             content: updatedContent,
    //                         }));
    //                     }
    //                 } else {
    //                     if (webIORef.current && webIORef.current.readyState === 1) {
    //                         webIORef.current.send(JSON.stringify({
    //                             type: "update-document", // or "update-document"
    //                             userId: user._id,
    //                             username: user.name,
    //                             editionId,
    //                             content: updatedContent,
    //                         }));
    //                     }
    //                 }
    //             }
    //         },
    //     }).run();
    // }, [editor]);


    const handleImportFilePick = useCallback(async (e) => {
        const file = e.target.files[0];
        importRef.current.value = "";
        if (!file) return;

        setIsLoading(true);

        // Create a promise that resolves when the import is complete
        await new Promise((resolve) => {
            editor.chain().import({
                file,
                onImport: async (context) => {
                    if (context.error) {
                        console.error("Import error:", context.error);
                        setIsLoading(false);
                        return resolve(); // Resolve even on error to stop hanging
                    }

                    editor.commands.setContent(context.content);
                    const updatedContent = context.content;

                    if (mode === false) {
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
    const updateComment = useCallback((threadId, commentId, content, metaData) => {
        editor.commands.updateComment({
            threadId, id: commentId, content, data: metaData,
        })
    }, [editor]);


    const resolveThread = useCallback(threadId => {
        editor.commands.resolveThread({ id: threadId })
    }, [editor]);

    const unresolveThread = useCallback(threadId => {
        editor.commands.unresolveThread({ id: threadId })
    }, [editor]);

    const onHoverThread = useCallback(threadId => {
        hoverThread(editor, [threadId]);
    }, [editor]);

    const onLeaveThread = useCallback(() => {
        hoverOffThread(editor)
    }, [editor]);

    const deleteThread = useCallback(threadId => {
        provider.deleteThread(threadId)
        editor.commands.removeThread({ id: threadId })
    }, [editor]);

    const selectThreadInEditor = useCallback(threadId => {
        editor.chain().selectThread({ id: threadId }).run();
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
    }, [ydoc]);


    const handleCommitDescriptionChange = event => {
        setCommitDescription(event.target.value)
    }

    const handleNewVersion = useCallback(e => {
        e.preventDefault()
        if (!commitDescription) {
            return
        }
        editor.commands.saveVersion(commitDescription)
        setCommitDescription('')
        // alert(`Version ${commitDescription} created! Open the version history to see all versions.`)
        AlertService.success(`Version "${commitDescription}" created! Open the version history to see all versions.`)
        setHasChanges(false)
    }, [editor, commitDescription])

    const handleVersioningClose = useCallback(() => {
        setVersioningModalOpen(false);
    }, [])

    const handleRevert = useCallback((version, versionData) => {
        const versionTitle = versionData ? versionData.name || renderDate(versionData.date) : version
        editor.commands.revertToVersion(version, `Revert to ${versionTitle}`, `Unsaved changes before revert to ${versionTitle}`)
        setAction('Editing');
    }, [editor]);

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

    const setActionType = (data) => {
        setAction(data);
        setTooltipElement(null);

        switch (data.trim()) {
            case "History":
                setVersioningModalOpen(true);
                editor && editor.setEditable(false);
                break;
            case "Editing":
            case "Suggesting":
                setVersioningModalOpen(false);
                editor && editor.setEditable(true);
                break;
            case "View":
                editor && editor.setEditable(false);
                setVersioningModalOpen(false);
                break;
            default:
                setVersioningModalOpen(false);
                editor && editor.setEditable(false);
        }
        console.log("DATA", data, " Action ", action);
    };


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
    }, [editor?.state.selection]);

    //s
    useEffect(() => {
        console.log("activeSuggestion", activeSuggestion, suggestionPopupVisible);

        if (!suggestionPopupVisible && activeSuggestion) {
            saveCurrentSuggestion(activeSuggestion);
        }
    }, [suggestionPopupVisible])
    useEffect(() => {
        console.log("activeSuggestion", activeSuggestion);
    }, [activeSuggestion]);

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

    /* suggestion/track change code begins */
    const findChildrenMarks = (doc, markType) => {
        const results = [];

        doc.descendants((node, pos) => {
            if (!node.isText) return;

            node.marks.forEach((mark) => {
                if (mark.type === markType) {
                    results.push({ node, mark, pos });
                }
            });
        });

        return results;
    }
    function getMarkAtPos(state, pos, markType) {
        const $pos = state.doc.resolve(pos);
        for (let i = 0; i < $pos.marks().length; i++) {
            const mark = $pos.marks()[i];
            if (mark.type.name === markType) return mark;
        }
        return null;
    }
    // function findSuggestionRange(state, suggestionId) {
    //     let start = -1;
    //     let end = -1;
    //     const { doc, schema } = state;
    //     const suggestionMarkName = 'suggestion';

    //     doc.descendants((node, pos) => {
    //         if (!node.isText) return true; // continue
    //         const hasMark = node.marks.some(
    //             (m) => m.type.name === suggestionMarkName && m.attrs.suggestionId === suggestionId
    //         );
    //         if (hasMark) {
    //             if (start === -1) {
    //                 start = pos;
    //             }
    //             end = pos + node.nodeSize; // nodeSize for text includes its length
    //         }
    //         return true; // continue traversal
    //     });

    //     if (start === -1 || end === -1) {
    //         return null; // not found
    //     }

    //     // For textBetween we need the actual character positions; ProseMirror textBetween expects "from" inclusive, "to" exclusive in document positions.
    //     return { from: start, to: end };
    // }
    // Fix the range finding logic
    function findSuggestionRange(state, suggestionId) {
        let start = -1;
        let end = -1;
        const { doc } = state;
        const suggestionMarkName = 'suggestion';

        doc.descendants((node, pos) => {
            if (!node.isText) return true;

            const hasMark = node.marks.some(
                (m) => m.type.name === suggestionMarkName && m.attrs.suggestionId === suggestionId
            );

            if (hasMark) {
                if (start === -1) {
                    start = pos;
                }
                end = pos + node.textContent.length; // Use textContent.length instead of nodeSize
            }
            return true;
        });

        return (start === -1 || end === -1) ? null : { from: start, to: end };
    }

    function findPosForSuggestionId(doc, suggestionId) {
        let foundPos = null;
        doc.descendants((node, pos) => {
            if (!node.isText) return true;
            const mark = node.marks.find(m => m.type.name === 'suggestion' && m.attrs.suggestionId === suggestionId);
            if (mark) {
                foundPos = pos;
                return false; // stop traversal
            }
            return true;
        });
        return foundPos;
    }

    function isSuggestionDeleted(mark) {
        // Check if the mark is a deletion suggestion
        console.log("Mark", mark && mark.attrs && mark.attrs.type === 'deletion');
        return mark && mark.attrs && mark.attrs.type === 'deletion';
    }


    // 2. Suggestion Plugin: Intercepts insertions
    const SuggestionPlugin = ({ getMode, getUser }) => {
        return new Plugin({
            key: new PluginKey('suggestionPlugin'),

            props: {
                // handleTextInput(view, from, to, text) {
                //     const { state, dispatch } = view;
                //     const { schema } = state;
                //     if (getMode() !== 'Suggesting') {
                //         const node = schema.text(text); // plain text without marks
                //         dispatch(state.tr.replaceWith(from, to, node));
                //         return true;
                //     }

                //     const currentUser = getUser();
                //     const createdAt = new Date().toISOString();

                //     // ✅ 1. Extend existing suggestion if already typing
                //     if (currentSuggestionId && tempSuggestion && tempSuggestion.view === view) {
                //         // tempSuggestion.text += text;
                //         // tempSuggestion.to += text.length;

                //         // const mark = tempSuggestion.mark;
                //         // const node = schema.text(text, [mark]);
                //         // const tr = state.tr.replaceWith(from, to, node);
                //         // dispatch(tr);

                //         // setActiveSuggestion({ ...tempSuggestion });
                //         // return true;
                //         const mark = tempSuggestion.mark;

                //         // Replace the slice with the new input (handles insertion / replacement)
                //         const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                //         dispatch(tr);

                //         // After dispatch, get the updated state from view
                //         const updatedState = view.state;
                //         const range = findSuggestionRange(updatedState, currentSuggestionId);
                //         if (range) {
                //             const actualText = updatedState.doc.textBetween(range.from, range.to);
                //             tempSuggestion.from = range.from;
                //             tempSuggestion.to = range.to;
                //             tempSuggestion.text = actualText;
                //             tempSuggestion.mark = mark; // mark can remain; you might want to re-resolve it if needed
                //             console.log("--", tempSuggestion)
                //             setActiveSuggestion({ ...tempSuggestion });
                //         } else {
                //             // Fallback: reset or clear if something went wrong
                //             console.warn('Could not locate suggestion range after edit', currentSuggestionId);
                //         }

                //         return true;

                //     }

                //     // ✅ 2. Proceed with suggestion creation if no existing suggestion
                //     const markAtPos = getMarkAtPos(state, from, 'suggestion');

                //     //popup top and left calculation
                //     const coords = view.coordsAtPos(from);
                //     const editorRect = view.dom.parentElement?.getBoundingClientRect?.() || { top: 0, left: 0 };
                //     const top = coords.top - editorRect.top + 8;
                //     const left = coords.left - editorRect.left;
                //     // Same user's suggestion exists, rehydrate
                //     if (markAtPos && markAtPos.attrs.userId === currentUser.id && !currentSuggestionId) {
                //         currentSuggestionId = markAtPos.attrs.suggestionId;

                //         tempSuggestion = {
                //             from,
                //             to: from + text.length,
                //             text,
                //             suggestionId: currentSuggestionId,
                //             user: {
                //                 id: markAtPos.attrs.userId,
                //                 name: markAtPos.attrs.username,
                //                 color: markAtPos.attrs.color,
                //             },
                //             createdAt: markAtPos.attrs.createdAt,
                //             mark: markAtPos,
                //             view,
                //             type: 'insertion'
                //         };

                //         setActiveSuggestionId(currentSuggestionId);
                //         setActiveSuggestion({ ...tempSuggestion });
                //         setPopupCoords({ top, left });

                //         console.log("✍️ Rehydrated current user's suggestion:", currentSuggestionId);

                //     } else if (markAtPos && markAtPos.attrs.userId !== currentUser.id) {
                //         // Different user's suggestion – start a new one
                //         const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                //         currentSuggestionId = suggestionId;

                //         const mark = schema.marks.suggestion.create({
                //             suggestionId,
                //             username: currentUser.name,
                //             userId: currentUser.id,
                //             color: currentUser.color,
                //             createdAt,
                //         });

                //         const node = schema.text(text, [mark]);
                //         const tr = state.tr.replaceWith(from, to, node);
                //         dispatch(tr);

                //         tempSuggestion = {
                //             from,
                //             to: from + text.length,
                //             text,
                //             suggestionId,
                //             user: currentUser,
                //             createdAt,
                //             mark,
                //             view,
                //             type: 'insertion'
                //         };

                //         setActiveSuggestionId(suggestionId);
                //         setActiveSuggestion({ ...tempSuggestion });
                //         setPopupCoords({ top, left });
                //         setSuggestionPopupVisible(true);

                //         console.log("👤 Started new suggestion due to other user's mark:", suggestionId);
                //         return true;

                //     } else if (!markAtPos && !currentSuggestionId) {
                //         // Plain area — start new suggestion
                //         const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                //         currentSuggestionId = suggestionId;

                //         const mark = schema.marks.suggestion.create({
                //             suggestionId,
                //             username: currentUser.name,
                //             userId: currentUser.id,
                //             color: currentUser.color,
                //             createdAt,
                //         });

                //         const node = schema.text(text, [mark]);
                //         const tr = state.tr.replaceWith(from, to, node);
                //         dispatch(tr);

                //         tempSuggestion = {
                //             from,
                //             to: from + text.length,
                //             text,
                //             suggestionId,
                //             user: currentUser,
                //             createdAt,
                //             mark,
                //             view,
                //             type: 'insertion'
                //         };

                //         setActiveSuggestionId(suggestionId);
                //         setActiveSuggestion({ ...tempSuggestion });
                //         setPopupCoords({ top, left });
                //         setSuggestionPopupVisible(true);
                //         console.log("🆕 New suggestion started in plain text:", suggestionId);
                //         return true;
                //     } else {
                //         console.log("⚠️ Cursor moved mid-suggestion or inconsistent state:", {
                //             currentSuggestionId,
                //             markAtPos,
                //             tempSuggestion,
                //         });

                //         // Optional: auto-rehydrate suggestion under cursor if it's user's
                //         if (markAtPos && markAtPos.attrs.userId === currentUser.id) {
                //             currentSuggestionId = markAtPos.attrs.suggestionId;
                //             tempSuggestion = {
                //                 from,
                //                 to: from + text.length,
                //                 text,
                //                 suggestionId: currentSuggestionId,
                //                 user: {
                //                     id: markAtPos.attrs.userId,
                //                     name: markAtPos.attrs.username,
                //                     color: markAtPos.attrs.color,
                //                 },
                //                 createdAt: markAtPos.attrs.createdAt,
                //                 mark: markAtPos,
                //                 view,
                //                 type: 'insertion'
                //             };

                //             setActiveSuggestionId(currentSuggestionId);
                //             setActiveSuggestion({ ...tempSuggestion });
                //             setPopupCoords({ top, left });

                //             console.log("♻️ Rehydrated in fallback");
                //         }
                //     }
                // },
                //currently using 14-08-2025 on 08:22
                handleTextInput(view, from, to, text) {
                    const { state, dispatch } = view;
                    const { schema } = state;

                    if (getMode() !== 'Suggesting') {
                        const node = schema.text(text); // plain text without marks
                        dispatch(state.tr.replaceWith(from, to, node));
                        console.log("assdadsas");
                        return true;
                    }

                    const currentUser = getUser();
                    const createdAt = new Date().toISOString();
                    // popup coords calculation
                    const coords = view.coordsAtPos(from);
                    const editorRect = view.dom.parentElement?.getBoundingClientRect?.() || { top: 0, left: 0 };
                    const top = coords.top - editorRect.top + 8;
                    const left = coords.left - editorRect.left;
                    // ✅ 2. No active-in-progress extension — determine context
                    const markAtPos = getMarkAtPos(state, from, 'suggestion');
                    const isInsideSameSuggestion =
                        markAtPos &&
                        markAtPos.attrs.suggestionId === currentSuggestionId &&
                        markAtPos.attrs.userId === currentUser.id;
                    // ✅ 1. Extend existing suggestion if already typing in the same view
                    if (isInsideSameSuggestion && tempSuggestion && tempSuggestion.view === view && !isSuggestionDeleted(markAtPos)) {
                        console.log('1st if')
                        const mark = tempSuggestion.mark;

                        // Replace the slice with the new input (handles insertion/replacement)
                        const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                        dispatch(tr);

                        // After dispatch, the view.state reflects the updated document
                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, currentSuggestionId);
                        console.log("1st if", range)
                        if (range) {
                            const actualText = updatedState.doc.textBetween(range.from, range.to);
                            tempSuggestion.from = range.from;
                            tempSuggestion.to = range.to;
                            tempSuggestion.text = actualText;
                            // Optionally re-resolve the mark at the updated position if necessary:
                            // const resolvedMark = getMarkAtPos(updatedState, range.from, 'suggestion');
                            // tempSuggestion.mark = resolvedMark || mark;
                            tempSuggestion.mark = mark;
                            setActiveSuggestion({ ...tempSuggestion });
                            updateSuggestionTextWithId(currentSuggestionId);
                        } else {
                            console.warn('Could not locate suggestion range after edit', currentSuggestionId);
                            currentSuggestionId = null;
                            tempSuggestion = null;
                            return false;

                        }

                        return true;
                    }

                    // 2a. Rehydrate same user's existing suggestion (cursor entered it, but nothing is active yet)
                    if (markAtPos && markAtPos.attrs.userId === currentUser.id && !currentSuggestionId && !isSuggestionDeleted(markAtPos)) {
                        console.log('2a')
                        currentSuggestionId = markAtPos.attrs.suggestionId;

                        // After inserting the current character, we want to reflect actual doc state.
                        // Create initial insertion for this keystroke:
                        const mark = markAtPos;
                        const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                        dispatch(tr);

                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, currentSuggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text; // fallback to raw input

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId: currentSuggestionId,
                            user: {
                                id: markAtPos.attrs.userId,
                                name: markAtPos.attrs.username,
                                color: markAtPos.attrs.color,
                            },
                            createdAt: markAtPos.attrs.createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };

                        setActiveSuggestionId(currentSuggestionId);
                        setActiveSuggestion({ ...tempSuggestion });
                        setPopupCoords({ top, left });

                        console.log('✍️ Rehydrated current user\'s suggestion:', currentSuggestionId);
                        return true;
                    }

                    // 2b. Typing inside someone else's suggestion — start a new one
                    if (markAtPos && markAtPos.attrs.userId !== currentUser.id) {
                        console.log('2b')
                        const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        currentSuggestionId = suggestionId;

                        const mark = schema.marks.suggestion.create({
                            suggestionId,
                            username: currentUser.name,
                            userId: currentUser.id,
                            color: currentUser.color,
                            createdAt,
                        });

                        const node = schema.text(text, [mark]);
                        let tr = state.tr;

                        if (from === to) {
                            console.log('adsda')
                            const $pos = state.doc.resolve(from);
                            const nextCharMark = $pos.nodeAfter?.marks?.find(m => m.type === markAtPos.type);

                            if (nextCharMark) {
                                // Split at caret by removing from this point onwards
                                tr = tr.removeMark(from, from + 1, markAtPos.type);
                            }

                            tr = tr.insert(from, schema.text(text, [mark]));
                        } else {
                            // Selection — replace as before
                            tr = tr.replaceWith(from, to, schema.text(text, [mark]));
                        }
                        dispatch(tr);

                        // After insertion, compute actual range/text
                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, suggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId,
                            user: currentUser,
                            createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };

                        setActiveSuggestionId(suggestionId);
                        setActiveSuggestion({ ...tempSuggestion });
                        setPopupCoords({ top, left });

                        console.log('👤 Started new suggestion due to other user\'s mark:', suggestionId);
                        return true;
                    }

                    // 2c. Plain area — start a fresh suggestion
                    if (!markAtPos && !currentSuggestionId) {
                        console.log('2c')
                        const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        currentSuggestionId = suggestionId;

                        const mark = schema.marks.suggestion.create({
                            suggestionId,
                            username: currentUser.name,
                            userId: currentUser.id,
                            color: currentUser.color,
                            createdAt,
                        });

                        const node = schema.text(text, [mark]);
                        const tr = state.tr.replaceWith(from, to, node);
                        dispatch(tr);

                        // After insertion, compute actual range/text
                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, suggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId,
                            user: currentUser,
                            createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };

                        setActiveSuggestionId(suggestionId);
                        setActiveSuggestion({ ...tempSuggestion });
                        setPopupCoords({ top, left });
                        console.log('🆕 New suggestion started in plain text:', suggestionId);
                        return true;
                    }

                    // Case: tempSuggestion got lost, but we are inside same suggestion — rehydrate
                    if (
                        isInsideSameSuggestion &&
                        !tempSuggestion
                    ) {
                        console.log('Case')
                        currentSuggestionId = markAtPos.attrs.suggestionId;

                        const mark = markAtPos;
                        const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                        dispatch(tr);

                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, currentSuggestionId);
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId: currentSuggestionId,
                            user: {
                                id: markAtPos.attrs.userId,
                                name: markAtPos.attrs.username,
                                color: markAtPos.attrs.color,
                            },
                            createdAt: markAtPos.attrs.createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };

                        setActiveSuggestion({ ...tempSuggestion });
                        setPopupCoords({ top, left });
                        saveCurrentSuggestion(tempSuggestion);
                        console.log('♻️ Rehydrated due to missing tempSuggestion');
                        return true;
                    }

                    // Fallback: inconsistent state (e.g., cursor moved inside your suggestion but currentSuggestionId mismatched)
                    if (!markAtPos || markAtPos.attrs.id !== currentSuggestionId) {
                        console.log('⚠️ Cursor moved mid-suggestion or inconsistent state:', {
                            currentSuggestionId,
                            markAtPos,
                            tempSuggestion,
                        });

                        // 🔹 Clear stale state
                        currentSuggestionId = null;
                        tempSuggestion = null;
                        suggestionStartPos = null; // if you're tracking starting position
                        popupOpen = false; // if popup is showing

                        return false; // Let normal typing proceed
                    }

                    if (markAtPos && markAtPos.attrs.userId === currentUser.id && markAtPos.attrs.suggestionId !== currentSuggestionId) {
                        alert('Fallback')
                        // Try rehydrating fallback
                        currentSuggestionId = markAtPos.attrs.suggestionId;

                        // Insert current text under that mark
                        const mark = markAtPos;
                        const tr = state.tr.replaceWith(from, to, schema.text(text, [mark]));
                        dispatch(tr);

                        const updatedState = view.state;
                        const range = findSuggestionRange(updatedState, currentSuggestionId);
                        console.log("fallback", range)
                        const actualText = range
                            ? updatedState.doc.textBetween(range.from, range.to)
                            : text;

                        tempSuggestion = {
                            from: range?.from ?? from,
                            to: range?.to ?? from + text.length,
                            text: actualText,
                            suggestionId: currentSuggestionId,
                            user: {
                                id: markAtPos.attrs.userId,
                                name: markAtPos.attrs.username,
                                color: markAtPos.attrs.color,
                            },
                            createdAt: markAtPos.attrs.createdAt,
                            mark,
                            view,
                            type: 'insertion',
                        };

                        setActiveSuggestionId(currentSuggestionId);
                        setActiveSuggestion({ ...tempSuggestion });
                        setPopupCoords({ top, left });

                        console.log('♻️ Rehydrated in fallback');
                        return true;
                    }

                    // If everything else fails, do nothing (or optionally clear)
                    return false;
                },
                handleKeyDown(view, event) {
                    const { state, dispatch } = view;
                    const { selection, schema } = state;
                    const currentUser = getUser();

                    if (getMode() !== 'Suggesting') {
                        const { from, $from } = selection;
                        const markAtPos = $from.marks().find(m => m.type.name === 'suggestion');
                        console.log("markAtPos", markAtPos, currentSuggestionId);

                        if (!markAtPos && currentSuggestionId) {
                            console.log('🧹 Clearing suggestion state: cursor moved outside');
                            currentSuggestionId = null;
                            tempSuggestion = null;
                        }
                        return false;
                    }

                    const { from, to, empty } = selection;
                    const isDeleteKey = event.key === 'Backspace' || event.key === 'Delete';
                    if (!isDeleteKey) return false;

                    // Prevent deleting outside document
                    if (empty && event.key === 'Delete' && from === state.doc.content.size) return false;
                    if (empty && event.key === 'Backspace' && from === 0) return false;

                    // Determine base deletion range
                    let deleteFrom = empty
                        ? event.key === 'Backspace'
                            ? from - 1
                            : from
                        : from;
                    let deleteTo = empty
                        ? event.key === 'Backspace'
                            ? from
                            : from + 1
                        : to;

                    let deletingOwnInsertion = false;
                    state.doc.nodesBetween(deleteFrom, deleteTo, (node) => {
                        if (node.isText && node.marks?.length) {
                            const insMark = node.marks.find(
                                m => m.type.name === 'suggestion' && m.attrs.userId === currentUser.id
                            );
                            if (insMark) {
                                deletingOwnInsertion = true;
                            }
                        }
                    });
                    console.log("Own insertion deletion:", deletingOwnInsertion);

                    if (deletingOwnInsertion) {
                        // Just delete without adding a deletion suggestion
                        dispatch(state.tr.delete(deleteFrom, deleteTo));
                        return true;
                    }


                    // Expand deletion range if adjacent marks already part of same deletion suggestion
                    const $from = state.doc.resolve(deleteFrom);
                    const $to = state.doc.resolve(deleteTo);

                    // Check backward
                    let startPos = deleteFrom;
                    while (startPos > 0) {
                        const prevChar = state.doc.textBetween(startPos - 1, startPos);
                        const marks = state.doc.nodeAt(startPos - 1)?.marks || [];
                        const sameDel = marks.some(
                            m => m.type.name === 'suggestion-deletion' && m.attrs.userId === currentUser.id
                        );
                        if (sameDel) {
                            startPos -= 1;
                        } else {
                            break;
                        }
                    }

                    // Check forward
                    let endPos = deleteTo;
                    while (endPos < state.doc.content.size) {
                        const nextChar = state.doc.textBetween(endPos, endPos + 1);
                        const marks = state.doc.nodeAt(endPos)?.marks || [];
                        const sameDel = marks.some(
                            m => m.type.name === 'suggestion-deletion' && m.attrs.userId === currentUser.id
                        );
                        if (sameDel) {
                            endPos += 1;
                        } else {
                            break;
                        }
                    }

                    deleteFrom = startPos;
                    deleteTo = endPos;

                    // Get the deleted text
                    const deletedText = state.doc.textBetween(deleteFrom, deleteTo, '\n', '\n');
                    if (!deletedText) return false;

                    // Wrap in a single deletion mark
                    const suggestionId = `sugg-${Date.now()}`;
                    const mark = schema.marks['suggestion-deletion'].create({
                        suggestionId,
                        userId: currentUser.id,
                        username: currentUser.name,
                        color: currentUser.color,
                        timestamp: new Date().toISOString(),
                    });

                    const node = schema.text(deletedText, [mark]);
                    let tr = state.tr.replaceWith(deleteFrom, deleteTo, node);
                    tr = tr.setSelection(TextSelection.create(tr.doc, deleteFrom));

                    dispatch(tr);
                    return true;
                },

                decorations(state) {
                    try {
                        const decorations = [];
                        const { selection } = state;
                        const cursorPos = selection.from;

                        const markRanges = findChildrenMarks(state.doc, (mark) => mark.type.name === 'suggestion');

                        markRanges.forEach(({ node, from: start, to }) => {
                            const mark = node.marks.find(m => m.type.name === 'suggestion');
                            const isOwn = mark?.attrs?.userId === getUser().id;
                            const isFocused = cursorPos >= start && cursorPos <= to;

                            if (isOwn && isFocused) {
                                decorations.push(Decoration.inline(start, to, {
                                    class: 'suggestion-focused'
                                }));
                            }
                        });

                        return DecorationSet.create(state.doc, decorations);
                    } catch (err) {
                        console.warn("Failed to generate decorations:", err);
                        return DecorationSet.empty;
                    }
                },
                // view(view) {
                //     return {
                //         update(view, prevState) {
                //             const { state } = view;
                //             const { from } = state.selection;

                //             // Only if mode is Suggesting
                //             if (getMode() !== 'Suggesting') return;

                //             // If active suggestion exists AND cursor moved away
                //             if (
                //                 tempSuggestion &&
                //                 lastCursorPos !== null &&
                //                 from !== lastCursorPos
                //             ) {
                //                 finalizeActiveSuggestion(view);
                //             }

                //             lastCursorPos = from;
                //         },
                //         destroy() {
                //             lastCursorPos = null;
                //         }
                //     };
                // },
                view(view) {
                    return {
                        update(view, prevState) {
                            const { state } = view;
                            const { from } = state.selection;

                            if (getMode() !== 'Suggesting') return;

                            // Only finalize if cursor moved OUTSIDE current suggestion
                            if (tempSuggestion && currentSuggestionId) {
                                const range = findSuggestionRange(state, currentSuggestionId);
                                const isOutsideSuggestion = !range || from < range.from || from > range.to;

                                if (isOutsideSuggestion && lastCursorPos !== null) {
                                    finalizeActiveSuggestion(view);
                                }
                            }

                            lastCursorPos = from;
                        },
                    };
                },
            },
        });
    };
    const finalizeActiveSuggestion = async (view) => {
        if (tempSuggestion && currentSuggestionId) {
            console.log("🔚 Finalizing active suggestion:", currentSuggestionId);

            // Wait for save to complete
            await saveCurrentSuggestion(tempSuggestion);

            // Then clear state
            tempSuggestion = null;
            currentSuggestionId = null;
            setActiveSuggestion(null);
            setSuggestionPopupVisible(false);
        }
    };
    // Add this cleanup function
    const cleanupSuggestionState = () => {
        tempSuggestion = null;
        currentSuggestionId = null;
        lastCursorPos = null;
        setActiveSuggestion(null);
        setSuggestionPopupVisible(false);
        setActiveSuggestionId(null);
    };

    const SuggestionFinalizer = Extension.create({
        name: 'suggestion-finalizer',

        addProseMirrorPlugins() {
            return [
                new Plugin({
                    key: new PluginKey('suggestionFinalizer'),
                    props: {
                        handleDOMEvents: {
                            click: async (view, event) => {
                                //still need to figure out specific touch and enable it properly
                                console.log("action", action, editorModeRef.current);

                                if (action !== "Suggesting") return true;   // Only handle clicks in Suggesting mode

                                const el = event.target.closest('[data-suggestion-id]') || event.target.querySelector('[data-suggestion-id]');
                                const clickedSuggestionId = el?.getAttribute('data-suggestion-id');
                                try {
                                    dispatch(fetchSuggestions(editionId));
                                } catch (error) {

                                }
                                if (clickedSuggestionId) {
                                    currentSuggestionId = clickedSuggestionId;

                                    // get mark info from editor state
                                    const { state } = view;
                                    const pos = findPosForSuggestionId(state.doc, clickedSuggestionId); // <-- You need to implement this
                                    if (pos != null) {
                                        const mark = getMarkAtPos(state, pos, 'suggestion');
                                        const range = findSuggestionRange(state, clickedSuggestionId);
                                        if (range && mark) {
                                            const actualText = state.doc.textBetween(range.from, range.to);

                                            tempSuggestion = {
                                                from: range.from,
                                                to: range.to,
                                                text: actualText,
                                                suggestionId: clickedSuggestionId,
                                                user: {
                                                    id: mark.attrs.userId,
                                                    name: mark.attrs.username,
                                                    color: mark.attrs.color,
                                                },
                                                createdAt: mark.attrs.createdAt,
                                                mark,
                                                view,
                                                type: 'insertion',
                                            };
                                            setActiveSuggestion({ ...tempSuggestion });
                                        }
                                    }

                                    const sidebarCard = document.querySelector(`.${clickedSuggestionId.trim()}`);
                                    document.querySelectorAll('.sidebar-card.highlighted').forEach(card => {
                                        setHighlightedSuggestionId('');
                                    });
                                    await updateSuggestionTextWithId(clickedSuggestionId);
                                    console.log("sidebarCard", sidebarCard);

                                    if (sidebarCard) {
                                        setHighlightedSuggestionId(clickedSuggestionId);
                                    }
                                } else {
                                    // Clear all highlights
                                    document.querySelectorAll('.sidebar-card.highlighted').forEach(el => {
                                        setHighlightedSuggestionId('');
                                    });

                                    currentSuggestionId = null;
                                    tempSuggestion = null;
                                    console.log('Finalized and cleared suggestion');
                                }
                                setSuggestionPopupVisible(false);
                                return false;
                            }
                        },
                    },
                }),
            ]
        },
    });

    // Call this when mode changes
    useEffect(() => {
        if (action !== "Suggesting") {
            cleanupSuggestionState();
        }
    }, [action]);

    useEffect(() => {
        setTimeout(() => {
            const card = document.querySelector('.sidebar-card.highlighted');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest', });
            }
        }, 100);
    }, [highlightedSuggestionId]);
    // 2. SuggestionFinalizer Plugin: for saving suggestion
    // const SuggestionFinalizer = Extension.create({
    //     name: 'suggestion-finalizer',

    //     addProseMirrorPlugins() {
    //         return [
    //             new Plugin({
    //                 key: new PluginKey('suggestionFinalizer'),
    //                 props: {
    //                     handleDOMEvents: {
    //                         click: async (view, event) => {
    //                             //still need to figure out specific touch and enable it properly
    //                             const el = event.target.closest('[data-suggestion-id]') || event.target.querySelector('[data-suggestion-id]');
    //                             const clickedSuggestionId = el?.getAttribute('data-suggestion-id');
    //                             try {
    //                                 // dispatch(fetchSuggestions(editionId));
    //                             } catch (error) {

    //                             }
    //                             if (clickedSuggestionId) {
    //                                 currentSuggestionId = clickedSuggestionId;

    //                                 // get mark info from editor state
    //                                 const { state } = view;
    //                                 const pos = findPosForSuggestionId(state.doc, clickedSuggestionId); // <-- You need to implement this
    //                                 if (pos != null) {
    //                                     const mark = getMarkAtPos(state, pos, 'suggestion');
    //                                     const range = findSuggestionRange(state, clickedSuggestionId);
    //                                     if (range && mark) {
    //                                         const actualText = state.doc.textBetween(range.from, range.to);

    //                                         tempSuggestion = {
    //                                             from: range.from,
    //                                             to: range.to,
    //                                             text: actualText,
    //                                             suggestionId: clickedSuggestionId,
    //                                             user: {
    //                                                 id: mark.attrs.userId,
    //                                                 name: mark.attrs.username,
    //                                                 color: mark.attrs.color,
    //                                             },
    //                                             createdAt: mark.attrs.createdAt,
    //                                             mark,
    //                                             view,
    //                                             type: 'insertion',
    //                                         };
    //                                         setActiveSuggestion({ ...tempSuggestion });
    //                                     }
    //                                 }

    //                                 const sidebarCard = document.querySelector(`.${clickedSuggestionId.trim()}`);
    //                                 document.querySelectorAll('.sidebar-card.highlighted').forEach(card => {
    //                                     setHighlightedSuggestionId('');
    //                                 });
    //                                 await updateSuggestionTextWithId(clickedSuggestionId);
    //                                 if (sidebarCard) {
    //                                     setHighlightedSuggestionId(clickedSuggestionId);
    //                                 }
    //                             } else {
    //                                 // Clear all highlights
    //                                 document.querySelectorAll('.sidebar-card.highlighted').forEach(el => {
    //                                     setHighlightedSuggestionId('');
    //                                 });

    //                                 currentSuggestionId = null;
    //                                 tempSuggestion = null;
    //                                 console.log('Finalized and cleared suggestion');
    //                             }
    //                             setSuggestionPopupVisible(false);
    //                             return false;
    //                         }
    //                     },
    //                 },
    //             }),
    //         ]
    //     },
    // });

    const updateSuggestionTextWithId = (suggestionId) => {
        const existingSuggestionIndex = trackChangeDetails.findIndex(
            (sugg) => sugg.suggestionId === suggestionId
        );
        const el = document.querySelector(`[data-suggestion-id="${suggestionId}"]`);
        const text = el?.textContent || "";
        console.log("Suggestion Text:", text);

        // if (existingSuggestionIndex !== -1) {
        //     dispatch(updateSuggestion({ suggestionId: suggestionId, data: { text: text } }));
        //     // dispatch(fetchSuggestions(editionId));
        // }
        const payload = {
            text: text
        }
        if (existingSuggestionIndex !== -1) {
            if (webIORef.current && webIORef.current.readyState === 1) {
                webIORef.current.send(JSON.stringify({
                    type: "update-suggestion",
                    userId: user._id,
                    username: user.name,
                    content: payload,
                    suggestionId: suggestionId
                }));
            }
            // await dispatch(updateSuggestion({ suggestionId: suggestionId, data: { text: text } }));
        }
    }

    const saveCurrentSuggestion = async (tempSuggestion) => {
        console.log("inside save function tempSuggestion", tempSuggestion);
        if (!tempSuggestion || !tempSuggestion?.text?.trim()) return;

        const { suggestionId, from, to, text, user, type } = tempSuggestion;
        const existingSuggestionIndex = trackChangeDetails.findIndex(
            (sugg) => sugg.suggestionId === suggestionId
        );
        const payload = {
            editionId: editionId,
            suggestionId: suggestionId,
            userId: user.id,
            text,
            fromPos: from,
            toPos: to,
            type,
            createdAt: new Date().toISOString(),
        };
        try {
            if (existingSuggestionIndex !== -1) {
                if (webIORef.current && webIORef.current.readyState === 1) {
                    webIORef.current.send(JSON.stringify({
                        type: "update-suggestion",
                        userId: user._id,
                        username: user.name,
                        content: payload,
                        suggestionId: suggestionId
                    }));
                }
                // await dispatch(updateSuggestion({ suggestionId: suggestionId, data: { text: text } }));
            } else {
                // await dispatch(createSuggestion(payload)); // Wait for creation
                if (webIORef.current && webIORef.current.readyState === 1) {
                    webIORef.current.send(JSON.stringify({
                        type: "create-suggestion",
                        userId: user._id,
                        username: user.name,
                        content: payload,
                    }));
                }
            }

            // await dispatch(fetchSuggestions(editionId)); // Fetch updated list
            // Optional cleanup
            tempSuggestion = null; // Clear only after save
            setActiveSuggestion(null); // Reset React state
        } catch (error) {
            console.log("Create suggestion", error);
        }
    }

    const SuggestionCard = ({
        avatarUrl,
        username,
        timestamp,
        suggestionText,
        suggestionId,
        isActive,
        type,
        onApprove,
        onReject,
    }) => {
        let text = "";
        const el = document.querySelector('[data-suggestion-id="' + suggestionId + '"]');
        if (el) {
            text = el.textContent;
        }
        return (
            <div
                className={`${suggestionId} sidebar-card ${highlightedSuggestionId === suggestionId ? 'highlighted' : ''}`}
            >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                    {/* Avatar + Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Avatar src={avatarUrl} alt={username} sx={{ width: 32, height: 32 }} />
                            <div className="flex flex-col justify-center">
                                <div className="font-medium text-sm">{username}</div>
                                <div className="text-xs text-gray-500">{moment(timestamp).format("hh:mm A MMM DD")}</div>
                            </div>
                        </div>
                        {/* Approve / Reject Buttons */}
                        <div>
                            <IconButton
                                onClick={onApprove}
                                size="small"
                                sx={{ color: '#2e7d32' }}
                                title="Accept suggestion"
                            >
                                <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={onReject}
                                size="small"
                                sx={{ color: '#c62828' }}
                                title="Reject suggestion"
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                </div>

                {/* Suggestion Text Row */}
                <div className="mt-2 text-sm text-gray-800">
                    <strong>{type === "suggestion" ? 'Add:' : 'Delete:'}</strong>{' '}
                    <span
                        className="italic text-gray-600"
                        title={suggestionText || text} // Full text shown on hover
                    >
                        {truncateText(suggestionText || text, 30)}
                    </span>
                </div>
            </div>
        );
    };
    function truncateText(str, maxLength) {
        if (!str) return '';
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }

    function approveSuggestionById(editor, suggestionId) {
        const { state, view } = editor;
        const { doc, tr } = state;
        const suggestionMarkType = state.schema.marks.suggestion;

        let hasChanged = false;

        doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
                if (
                    mark.type === suggestionMarkType &&
                    mark.attrs.suggestionId === suggestionId
                ) {
                    // Remove the suggestion mark
                    tr.removeMark(pos, pos + node.nodeSize, suggestionMarkType);

                    // If it's a deletion suggestion, remove the node
                    if (mark.attrs.type === 'deletion') {
                        tr.delete(pos, pos + node.nodeSize);
                    }

                    hasChanged = true;
                }
            });
        });
        if (hasChanged) {
            view.dispatch(tr);
        }
    }

    function deleteSuggestionById(editor, suggestionId) {
        const { state, view } = editor;
        const { doc, tr } = state;
        const suggestionMarkType = state.schema.marks.suggestion;

        let hasChanged = false;

        doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
                if (
                    mark.type === suggestionMarkType &&
                    mark.attrs.suggestionId === suggestionId
                ) {
                    // Remove the content wrapped with the suggestion
                    tr.delete(pos, pos + node.nodeSize);
                    hasChanged = true;
                }
            });
        });

        if (hasChanged) {
            view.dispatch(tr);
        }
    }

    const onCardApprove = (event) => {
        // TODO: call your API to approve suggestion
        const parentCardElement = event.target.closest('.sidebar-card');
        const suggestionId = parentCardElement.classList[0];
        approveSuggestionById(editor, suggestionId);


        // You can remove the suggestion from the editor here if needed
    };

    const onCardReject = (event) => {
        // TODO: call your API to reject suggestion
        const parentCardElement = event.target.closest('.sidebar-card');
        const suggestionId = parentCardElement.classList[0];
        deleteSuggestionById(editor, suggestionId);

    };

    // Approve a delete suggestion → actually delete the marked text
    const onCardDeleteApprove = (event, sugg) => {
        event?.stopPropagation();
        const { id } = sugg;

        editor.chain().focus().command(({ tr, state }) => {
            state.doc.descendants((node, pos) => {
                if (node.isText && node.marks.length) {
                    const deletionMark = node.marks.find(
                        (m) => m.type.name === "suggestion-deletion" && m.attrs.suggestionId === id
                    );
                    if (deletionMark) {
                        // Delete the exact text range
                        tr.delete(pos, pos + node.text.length);
                    }
                }
            });
            return true;
        }).run();
    };


    // Reject a delete suggestion → keep text but remove the deletion mark
    const onCardDeleteReject = (event, sugg) => {
        event?.stopPropagation();

        const targetId =
            (sugg && (sugg.id || sugg.suggestionId || sugg.suggestionid || sugg.suggestion_id)) || null;

        if (!targetId) {
            console.warn('onCardDeleteReject: no suggestion id on card', sugg);
            return;
        }

        editor.chain().focus().command(({ tr, state }) => {
            const marks = state.schema.marks;
            // try common mark names (adjust if your schema used a different name)
            const deletionMarkType =
                marks.deletion || marks['suggestion-deletion'] || marks['suggestion_deletion'];

            if (!deletionMarkType) {
                console.warn('onCardDeleteReject: deletion mark type not found in schema');
                return false;
            }

            const ranges = [];

            // collect contiguous ranges of text nodes that have the matching deletion mark
            state.doc.descendants((node, pos) => {
                if (!node.isText || !node.marks?.length) return;

                // find a mark on this node that matches the deletion type and the id
                const found = node.marks.find(m => {
                    if (m.type !== deletionMarkType) return false;
                    const a = m.attrs || {};
                    return (
                        a.id === targetId ||
                        a.suggestionId === targetId ||
                        a.suggestionid === targetId ||
                        a.suggestion_id === targetId
                    );
                });

                if (!found) return;

                const nodeFrom = pos;
                const nodeTo = pos + node.text.length;

                const last = ranges[ranges.length - 1];
                if (last && last.to === nodeFrom) {
                    // extend previous contiguous range
                    last.to = nodeTo;
                } else {
                    ranges.push({ from: nodeFrom, to: nodeTo });
                }
            });

            if (!ranges.length) {
                console.warn('onCardDeleteReject: no matching ranges for suggestion id', targetId);
                return false;
            }

            console.log('onCardDeleteReject: removing mark over ranges', ranges);

            // remove the mark over collected ranges (do this after collecting them)
            ranges.forEach(r => {
                tr.removeMark(r.from, r.to, deletionMarkType);
            });

            return true;
        }).run();
    };





    function getSuggestionsFromDoc(doc) {
        const suggestions = [];
        doc.descendants((node, pos) => {
            node.marks.forEach(mark => {
                if (['suggestion', 'suggestion-deletion'].includes(mark.type.name)) {
                    suggestions.push({
                        id: mark.attrs.suggestionId,
                        userId: mark.attrs.userId,
                        username: mark.attrs.username,
                        timestamp: mark.attrs.timestamp,
                        type: mark.type.name,
                        text: node.text || '',
                    });
                }
            });
        });
        return suggestions;
    }

    const updateSuggestions = (editor) => {
        const list = getSuggestionsFromDoc(editor.state.doc)
        setSuggestions(list)
    }

    const increaseFont = () => {
        const number = parseInt(fontSize, 10);
        const newSize = Math.min(number + 2, 72);
        // editor.commands.increaseFontSize();
        setFontSize(`${newSize}px`);

    }

    const decreaseFont = () => {
        const number = parseInt(fontSize, 10);
        const newSize = Math.max(number - 2, 8);
        // editor.commands.decreaseFontSize();
        setFontSize(`${newSize}px`);

    }

    useEffect(() => {
        editor?.commands?.setFontSize(fontSize);
    }, [editor, fontSize])
    /* suggestion/track change code ends */

    return (
        <>
            <RulesModal
                rules={rules}
                isOpen={isModalOpen}
                onSave={(newRules) => {
                    setRules(newRules);
                    editor.chain().setAiSuggestionRules(newRules).loadAiSuggestions().run();
                    setIsModalOpen(false);
                }}
                onClose={() => setIsModalOpen(false)}
            />
            <div style={{ width: "100%" }}>
                <MenuBar
                    editor={editor}
                    createThread={createThread}
                    handleImportClick={handleImportClick}
                    importRef={importRef}
                    handleImportFilePick={handleImportFilePick}
                    handleImageUpload={handleImageUpload}
                    user={user}
                    editionsById={editionsById}
                    handleApprovalClick={handleApprovalClick}
                    actionType={setActionType}
                    sideBarMenu={setSideBarMenu}
                    fontSize={fontSize}
                    fontFamilyFunc={setFontFamily}
                    decreaseFont={decreaseFont}
                    increaseFont={increaseFont}
                    suggestionLength={suggestions.length}
                />
                {action === "History" ? (
                    <VersioningModal
                        versions={versions}
                        isOpen={versioningModalOpen}
                        onClose={handleVersioningClose}
                        onRevert={handleRevert}
                        currentVersion={currentVersion}
                        latestVersion={latestVersion}
                        provider={provider}
                    />
                ) : ((action === "Editing" || action === "View" || action === "Suggesting") ? <>
                    {!isLoading ? (
                        <>
                            <ThreadsProvider
                                onClickThread={selectThreadInEditor}
                                onDeleteThread={deleteThread}
                                onHoverThread={onHoverThread}
                                onLeaveThread={onLeaveThread}
                                onResolveThread={resolveThread}
                                onUpdateComment={updateComment}
                                onUnresolveThread={unresolveThread}
                                selectedThreads={editor?.storage?.comments?.focusedThreads || []}
                                selectedThread={selectedThread}
                                setSelectedThread={setSelectedThread}
                                threads={threads}
                            >
                                <div className="col-group">
                                    <div className="main" style={{ width: sideBarMenu ? "70%" : "100%" }}>
                                        <div className="editor-container" style={{ position: 'relative' }}>
                                            <div className="editor-page" ref={editorWrapperRef} data-viewmode={showUnresolved ? 'open' : 'resolved'}>
                                                <EditorContent editor={editor} className={action + ' mode'} />
                                                <div className="collab-status-group"
                                                    data-state={status === 'connected' ? 'online' : 'offline'}>
                                                </div>
                                            </div>

                                            {(!editor?.state.selection.empty && action === "Editing") && (
                                                <div className="capsule-comment" style={{ top: tooltipPosition?.top + "px" }}>
                                                    <Tooltip title="Add Comment">
                                                        <IconButton onClick={() => setShowInputBox(true)}>
                                                            <CommentIcon />
                                                        </IconButton>
                                                    </Tooltip>

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
                                        </div>
                                    </div>

                                    {sideBarMenu &&
                                        <div style={{ width: '30%' }}>
                                            {/* Tab Buttons */}
                                            <div className="tab-header" style={{ width: '100%', overflowX: 'auto' }}>
                                                <button
                                                    className={activeTab === 'comments' ? 'active' : ''}
                                                    onClick={() => setActiveTab('comments')}
                                                >
                                                    Comments
                                                </button>
                                                <button
                                                    className={activeTab === "version" ? "active" : ""}
                                                    onClick={() => setActiveTab("version")}
                                                >
                                                    Version History
                                                </button>
                                                <button
                                                    className={activeTab === "Suggesting" ? "active" : ""}
                                                    onClick={() => setActiveTab("Suggesting")}
                                                >
                                                    Suggestions
                                                </button>
                                            </div>

                                            {/* Tab Content */}
                                            <div className="tab-content">
                                                {activeTab === 'comments' && (
                                                    <div className="sidebar-options sidebar" style={{ background: '#fdfdfd', width: '100%', padding: '10px' }}>
                                                        <div className="option-group">
                                                            <div className="label-large">Comments</div>
                                                            <div className="switch-group">
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="thread-state"
                                                                        onChange={() => setShowUnresolved(true)}
                                                                        checked={showUnresolved}
                                                                    />
                                                                    Open
                                                                </label>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="thread-state"
                                                                        onChange={() => setShowUnresolved(false)}
                                                                        checked={!showUnresolved}
                                                                    />
                                                                    Resolved
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <ThreadsList className="tiptap" provider={provider} threads={filteredThreads} WebSocket={webIORef} />
                                                    </div>
                                                )}
                                                {activeTab === "version" && (
                                                    <div className="sidebar-options" style={{ alignItems: 'center' }}>
                                                        <div className="option-group">
                                                            <div className="label-large">Auto versioning</div>
                                                            <div className="switch-group">
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="auto-versioning"
                                                                        onChange={() =>
                                                                            !isAutoVersioning && editor.commands.toggleVersioning()
                                                                        }
                                                                        checked={isAutoVersioning}
                                                                    />
                                                                    Enable
                                                                </label>
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name="auto-versioning"
                                                                        onChange={() =>
                                                                            isAutoVersioning && editor.commands.toggleVersioning()
                                                                        }
                                                                        checked={!isAutoVersioning}
                                                                    />
                                                                    Disable
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="option-group" >
                                                            <div className="label-large">Manual versioning</div>
                                                            <div className="label-small">
                                                                Make adjustments to the document to manually save a new version.
                                                            </div>
                                                            <form className="commit-panel" onSubmit={handleNewVersion}>
                                                                <Box display="flex" flexDirection="column" gap={1}>
                                                                    <TextField
                                                                        disabled={!hasChanges}
                                                                        placeholder="Version name"
                                                                        value={commitDescription}
                                                                        onChange={handleCommitDescriptionChange}
                                                                        variant="outlined"
                                                                        size="small"
                                                                        fullWidth
                                                                    />
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        type="submit"
                                                                        disabled={!hasChanges || commitDescription.length === 0}
                                                                    >
                                                                        Create
                                                                    </Button>
                                                                </Box>
                                                            </form>
                                                        </div>

                                                        {/* <hr /> */}
                                                        {/* <Box display="flex" justifyContent="center">
                                                            <Button
                                                                style={{ cursor: 'pointer' }}
                                                                variant="outlined"
                                                                color="primary"
                                                                type="submit"
                                                                onClick={showVersioningModal}
                                                            >
                                                                Show history
                                                            </Button>
                                                        </Box> */}

                                                    </div>
                                                )}
                                                {activeTab === "Suggesting" && (
                                                    <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
                                                        {suggestions.length > 0 && suggestions.map((sugg, index) => (
                                                            <SuggestionCard
                                                                key={index}
                                                                avatarUrl="https://example.com/avatar.jpg"
                                                                username={sugg?.username}
                                                                timestamp={sugg?.createdAt}
                                                                suggestionText={sugg.text}
                                                                suggestionId={sugg?.id}
                                                                isActive={activeSuggestion?.suggestionId === sugg?.suggestionId}
                                                                type={sugg?.type}
                                                                onApprove={(e) => sugg?.type === "suggestion" ? onCardApprove(e) : onCardDeleteApprove(e, sugg)}
                                                                onReject={(e) => sugg?.type === "suggestion" ? onCardReject(e) : onCardDeleteReject(e, sugg)}
                                                            />
                                                        ))}
                                                        {trackChangeDetails.length === 0 &&
                                                            <div className="no-suggestions-message">
                                                                No suggestions found.
                                                            </div>

                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>}
                                </div>
                            </ThreadsProvider>
                        </>) : (
                        (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '400px', // or 100vh if full screen
                                flexDirection: 'column',
                            }}>
                                <CircularProgress />
                                <p style={{ marginTop: '1rem', color: '#555' }}>Processing .docx file...</p>
                            </div>
                        )
                    )}


                </> : (<></>))}
                {action === "Editing" && editor && (
                    <SuggestionTooltip element={tooltipElement} editor={editor} />
                )}
            </div >
        </>
    );

};

export default EditorComponent;