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
import { Decoration } from "@tiptap/pm/view";

import StarterKit from "@tiptap/starter-kit";
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

import AiSuggestion from "@tiptap-pro/extension-ai-suggestion";
import { Import } from '@tiptap-pro/extension-import'
import { ThreadsList } from './ThreadsList'
import { ThreadsProvider } from './context'
import { useThreads } from './hooks/useThreads'
import { useUser } from './hooks/useUser'

import TextStyle from '@tiptap/extension-text-style';

import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import { Pagination } from 'tiptap-pagination-breaks';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
import Comments from '@tiptap-pro/extension-comments';
import PageBreak from './extensions/PageBreak';
import Placeholder from "@tiptap/extension-placeholder";
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
import { EditorContent, useEditor } from '@tiptap/react';

import Paragraph from '@tiptap/extension-paragraph';
import CollaborationHistory from '@tiptap-pro/extension-collaboration-history'
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
import { createSuggestion, deleteSuggestion, fetchSuggestions } from '../redux/Slices/suggestionSlice'

//track-changes or suggestion imports
import { Extension, Editor, Mark } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { Fragment } from 'prosemirror-model';
import moment from 'moment-timezone';

const colors = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
    '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
    '#EEC759', '#9BB8CD', '#FF90BC', '#FFC0D9', '#DC8686',
    '#7ED7C1', '#F3EEEA', '#89B9AD', '#D0BFFF', '#FFF8C9',
    '#CBFFA9', '#9BABB8', '#E3F4F4',
];

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

const getRandomElement = list => list[Math.floor(Math.random() * list.length)];
const getRandomColor = () => getRandomElement(colors);


const getInitialUser = () => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = `${storedUser.firstName || 'User'} ${storedUser.lastName || ''}`.trim();
    return {
        name: userName || 'Anonymous',
        id: storedUser._id || null,
        color: getRandomColor(),
    };
};

const EditorComponent = ({ ydoc, provider, room }) => {
    const dispatch = useDispatch();
    const editionsById = useSelector((state) => state.editionsById);
    const loginDetails = useSelector((state) => state.auth);
    const trackChangeDetails = useSelector((state) => state.suggestion);
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const [status, setStatus] = useState('connecting');
    const [currentUser, setCurrentUser] = useState(getInitialUser());
    const [isLoading, setIsLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sideBarMenu, setSideBarMenu] = useState(false);
    const [rules, setRules] = useState(initialRules);
    const [tooltipElement, setTooltipElement] = useState(null);
    const [editor, setEditor] = useState(null);
    const importRef = useRef(null);
    const APP_ID = "pkry8p7m";
    const roleName = loginDetails?.user?.role?.replace(/\s+/g, "").toLowerCase();
    const user = useUser();
    // const isAuthorOrEditor = ['author', 'editor'].includes(roleName?.trim().toLowerCase());
    // const isApproved = editionsById?.editions?.isAuthorApproved === false;
    // const [action, setAction] = useState(
    //     isAuthorOrEditor && isApproved ? 'Editing' : 'View'
    // );
    const normalizedRole = roleName?.trim().toLowerCase();

    const isEditorApproved = editionsById?.editions?.isEditorApproved;
    const isAuthorApproved = editionsById?.editions?.isAuthorApproved;

    const isAuthor = normalizedRole === 'author';
    const isEditor = normalizedRole === 'editor';

    const [action, setAction] = useState(() => {
        if (isAuthor) {
            return 'Editing';
        }
        if (isEditor) {
            if (isEditorApproved === true) {
                return 'View';
            }
            return 'Editing';
        }
        if (isAuthorApproved === true) {
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
    const [tooltipPosition, setTooltipPosition] = useState(null);

    const [showUnresolved, setShowUnresolved] = useState(true)
    const [activeTab, setActiveTab] = useState(roleName === "editor" ? 'ai' : 'comments'); // 'ai' or 'comments'
    const [commitDescription, setCommitDescription] = useState('');
    const editorModeRef = useRef(action);
    const currentUserRef = useRef(currentUser);
    const [activeSuggestion, setActiveSuggestion] = useState(null);
    const [activeDeleteSelection, setActiveDeleteSelection] = useState(null);
    let deletionBuffer = {
        from: null,
        to: null,
        text: '',
    };
    let tempSuggestion = null;
    let tempDeletion = null;
    let currentSuggestionId = null;
    const prevLineTopRef = useRef(null);
    const editorWrapperRef = useRef(null);


    const showVersioningModal = useCallback(() => {
        setVersioningModalOpen(true)
    }, []);

    const SuggestionDeletionMark = Mark.create({
        name: 'suggestion-deletion',

        addAttributes() {
            const user = currentUserRef.current;
            return {
                username: { default: user.name },
                userId: { default: user.id },
                color: { default: user.color },
                createdAt: { default: () => new Date().toISOString() },
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


    //Main Editor Initialization
    useEffect(() => {
        if (!action) return;

        const newEditor = new Editor({
            extensions: [
                StarterKit.configure({ history: false, paragraph: false }),
                CustomParagraph,
                Import.configure({
                    appId: APP_ID,
                    token: documentToken,
                    endpoint: "https://api.tiptap.dev/v1/convert",
                    experimentalDocxImport: true,
                }),
                CollaborationCursor.configure({ provider }),
                ...(action === "Editing" ? [
                    AiSuggestion.configure({
                        rules,
                        appId: APP_ID,
                        token: contentAIToken,
                        getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
                            const decorations = getDefaultDecorations();
                            if (isSelected && !suggestion.isRejected) {
                                decorations.push(
                                    Decoration.widget(suggestion.deleteRange.to, () => {
                                        const element = document.createElement('span');
                                        setTooltipElement(element);
                                        return element;
                                    }),
                                );
                            }
                            return decorations;
                        },
                    })
                ] : []),
                CommentsKit.configure({
                    provider,
                    useLegacyWrapping: false,
                    deleteUnreferencedThreads: false,
                }),
                CustomHighlight,
                Image.configure({ inline: true, allowBase64: true }),
                Table.configure({ resizable: true }),
                History,
                InlineThread,
                TextStyle,
                Underline,
                Highlight,
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
                CollaborationHistory.configure({
                    provider,
                    onUpdate: data => {
                        setVersions(data.versions)
                        setIsAutoVersioning(data.versioningEnabled)
                        setLatestVersion(data.version)
                        setCurrentVersion(data.currentVersion)
                    },
                }),
                SuggestionMark.configure({
                    viewerUserId: currentUserRef.current?.id || 'anonymous',
                }),
                SuggestionDeletionMark.configure({
                    viewerUserId: currentUserRef.current?.id || 'anonymous',
                }),
                SuggestionExtension.configure({
                    getMode: () => editorModeRef.current,
                    getUser: () => currentUserRef.current,
                }),

            ],
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
                if (webIORef.current && webIORef.current.readyState === 1) {
                    webIORef.current.send(JSON.stringify({
                        type: "update-document",
                        userId: user._id,
                        username: user.name,
                        editionId: editionId,
                        content: payload,
                    }));
                }
                updateFocusedSuggestion(editor);
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
                updateFocusedSuggestion(editor);
            },
            onBlur() {
                console.log("-------------")
                if (tempSuggestion) {
                    setActiveSuggestion({ ...tempSuggestion }); // Show popup
                }

            },
        });
        setEditor(newEditor);


        return () => newEditor.destroy(); // cleanup on action change
    }, [action]);

    // const editor = useEditor({
    //     extensions: [
    //         StarterKit.configure({ history: false, paragraph: false }),
    //         CustomParagraph,
    //         Import.configure({
    //             appId: APP_ID,
    //             token: documentToken,
    //             endpoint: "https://api.tiptap.dev/v1/convert",
    //             experimentalDocxImport: true,
    //         }),
    //         CollaborationCursor.configure({ provider }),
    //         AiSuggestion.configure({
    //             rules,
    //             appId: APP_ID,
    //             token: contentAIToken,
    //             getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
    //                 const decorations = getDefaultDecorations();
    //                 if (isSelected && !suggestion.isRejected) {
    //                     decorations.push(
    //                         Decoration.widget(suggestion.deleteRange.to, () => {
    //                             const element = document.createElement('span');
    //                             setTooltipElement(element);
    //                             return element;
    //                         }),
    //                     );
    //                 }
    //                 return decorations;
    //             },
    //         }),
    //         CommentsKit.configure({
    //             provider,
    //             useLegacyWrapping: false,
    //             deleteUnreferencedThreads: false,
    //         }),
    //         CustomHighlight,
    //         Image.configure({ inline: true, allowBase64: true }),
    //         Table.configure({ resizable: true }),
    //         History,
    //         InlineThread,
    //         TextStyle,
    //         Underline,
    //         Highlight,
    //         Strike,
    //         Link,
    //         TableRow,
    //         TableCell,
    //         TableHeader,
    //         TextAlign.configure({ types: ['heading', 'paragraph', 'orderedList'] }),
    //         /* TaskList,
    //            TaskItem,
    //             Markdown.configure({
    //                html: true,                  // Allow HTML input/output
    //                tightLists: true,            // No <p> inside <li> in markdown output
    //                tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight
    //                bulletListMarker: '-',       // <li> prefix in markdown output
    //                linkify: false,              // Create links from "https://..." text
    //                breaks: false,               // New lines (\n) in markdown input are converted to <br>
    //                transformPastedText: false,  // Allow to paste markdown text in the editor
    //                transformCopiedText: false,  // Copied text is transformed to markdown
    //            }),
    //            CharacterCount.extend().configure({ limit: 10000 }), */
    //         Collaboration.configure({ document: ydoc }),
    //         CollaborationHistory.configure({
    //             provider,
    //             onUpdate: data => {
    //                 setVersions(data.versions)
    //                 setIsAutoVersioning(data.versioningEnabled)
    //                 setLatestVersion(data.version)
    //                 setCurrentVersion(data.currentVersion)
    //             },
    //         }),
    //     ],
    //     onCreate: ({ editor: currentEditor }) => {
    //         provider.on('synced', () => {
    //             if (currentEditor.isEmpty) {
    //                 currentEditor.commands.setContent(defaultContent);
    //             }
    //         });

    //     },
    //     onUpdate: ({ editor }) => {
    //         const json = editor.getJSON();
    //         // const updatedContent = injectPageBreaksIntoJSON(json.content);
    //         const updatedContent = json.content;
    //         // ✅ Safe WebSocket send
    //         const payload = {
    //             content: updatedContent,
    //             type: "doc"
    //         }
    //         if (webIORef.current && webIORef.current.readyState === 1) {
    //             webIORef.current.send(JSON.stringify({
    //                 type: "update-document",
    //                 userId: user._id,
    //                 username: user.name,
    //                 editionId: editionId,
    //                 content: payload,
    //             }));
    //         }
    //     },
    //     onSelectionUpdate({ editor }) {
    //         const selection = editor.state.selection;
    //         console.log(selection);
    //         const isEmpty = selection.empty;
    //         const from = selection.from;
    //         const to = selection.to;
    //         if (!isEmpty && from !== to) {
    //             const selectedText = editor.state.doc.textBetween(from, to, ' ');
    //             console.log('📝 Selected text:', selectedText);
    //         } else {
    //             setShowInputBox(false)
    //         }
    //     },
    // });

    // Ensure editor is initialized before using it
    const stableUser = useMemo(() => user, [user?._id]);
    const { threads, createThread } = useThreads(provider, editor, user, webIORef, getThreds || []);
    const filteredThreads = Array.isArray(threads)
        ? threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))
        : [];

    threadsRef.current = threads;

    useEffect(() => {
        dispatch(getEditionsById(editionId));
        dispatch(fetchSuggestions(editionId));
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
        const editorPage = document.querySelector('.editor-page');

        const isApproved =
            ((roleName === "author" || roleName === "editor") && editionsById?.editions?.isAuthorApproved);
        console.log(roleName, editionsById?.editions?.isAuthorApproved, editionsById?.editions?.isEditorApproved, isApproved);

        if (((roleName === "author" || roleName === "editor"))) {
            editor && editor.setEditable(true);
        } else {
            editor && editor.setEditable(false);
        }
    }, [editionsById, roleName, editor]);

    useEffect(() => {
        if (!editionId || !stableUser) return;
        const ws = new WebSocket("ws://localhost:5000/ws/" + editionId);
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
        if (!editor && roleName != "editor") return;

        const interval = setInterval(() => {
            const storage = editor.extensionStorage.aiSuggestion;
            setAiLoading(storage?.isLoading || false);
        }, 200);

        return () => clearInterval(interval);
    }, [editor]);

    useEffect(() => {
        if (editor && currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            editor.chain().focus().updateUser(currentUser).run();
        }
    }, [editor, currentUser]);


    const loadSuggestions = async () => {
        if (!editor || action !== "Editing") return;

        try {
            await editor?.commands?.loadAiSuggestions();
            const storage = editor?.extensionStorage?.aiSuggestion
            if (storage.isLoading) {
                setAiLoading(true);
            } else if (storage.error) {
                setAiLoading(false);
            }
        } catch (err) {
            console.error("AI suggestions load error", err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleImportClick = useCallback(() => {
        importRef.current.click();
    }, []);

    const handleImportFilePick = useCallback(async (e) => {
        const file = e.target.files[0];
        importRef.current.value = "";
        if (!file) return;

        setIsLoading(true);

        await editor.chain().import({
            file,
            onImport: async (context) => {
                if (context.error) {
                    console.error("Import error:", context.error);
                } else {
                    setIsLoading(false);
                    editor.commands.setContent(context.content);
                    // editor.commands.setTextSelection(editor.state.doc.content.size);
                    // editor.commands.focus();
                    // await waitUntilEditorViewIsReady(editor);
                    const updatedContent = context.content;
                    if (mode == false) {
                        if (webIORef.current && webIORef.current.readyState === 1) {
                            webIORef.current.send(JSON.stringify({
                                type: "create-document", // or "update-document"
                                userId: user._id,
                                username: user.name,
                                editionId,
                                content: updatedContent,
                            }));
                        }
                    } else {
                        if (webIORef.current && webIORef.current.readyState === 1) {
                            webIORef.current.send(JSON.stringify({
                                type: "update-document", // or "update-document"
                                userId: user._id,
                                username: user.name,
                                editionId,
                                content: updatedContent,
                            }));
                        }
                    }
                }
            },
        }).run();
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

    useEffect(() => {
        console.log("activeSuggestion", activeSuggestion);
        if (!activeSuggestion) return;
        const { user, domNode, text, timestamp, suggestionId, view, from } = activeSuggestion;

        showSuggestionPopup({
            target: domNode,
            username: user.name,
            timestamp,
            text,
            isDeletion: false,
            onApprove: () => approveSuggestionAt(view, suggestionId),
            onReject: () => rejectSuggestionAt(activeSuggestion?.view, from),
        });
    }, [activeSuggestion]);

    useEffect(() => {
        if (!activeDeleteSelection || !activeDeleteSelection.domNode) return;

        showSuggestionPopup({
            target: activeDeleteSelection.domNode,
            username: activeDeleteSelection.user.name,
            timestamp: activeDeleteSelection.timestamp,
            text: `Delete: "${activeDeleteSelection.text}"`,
            isDeletion: true,
            onApprove: () => approveSuggestionAt(editorView, activeDeleteSelection.from),
            onReject: () => rejectSuggestionAt(editorView, activeDeleteSelection.from),
        });
    }, [activeDeleteSelection]);

    //removing suggestion popups 
    useEffect(() => {
        const handleClickOutside = (event) => {
            const proseMirrorDom = document.querySelector('.ProseMirror');

            if (proseMirrorDom && proseMirrorDom.contains(event.target)) {
                saveCurrentSuggestion(); // your backend call here
                document.querySelectorAll('.suggestion-popup').forEach(el => el.remove());
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



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
        alert(`Version ${commitDescription} created! Open the version history to see all versions.`)
        setHasChanges(false)
    }, [editor, commitDescription])

    const handleVersioningClose = useCallback(() => {
        setVersioningModalOpen(false);
    }, [])

    const handleRevert = useCallback((version, versionData) => {
        const versionTitle = versionData ? versionData.name || renderDate(versionData.date) : version
        editor.commands.revertToVersion(version, `Revert to ${versionTitle}`, `Unsaved changes before revert to ${versionTitle}`)
    }, [editor]);

    const handleApprovalClick = async () => {
        try {
            const updatedData = {};
            if (roleName === "author") {
                updatedData.isAuthorApproved = true;
                updatedData.editorContent = editor?.getJSON(); // ✅ move into updatedData
            } else if (roleName === "editor") {
                updatedData.isEditorApproved = true;
            }

            if (Object.keys(updatedData).length > 0) {
                const result = await dispatch(updateEdition({ id: editionId, updatedData }));

                if (updateEdition.fulfilled.match(result)) {
                    console.log("✅ Edition updated successfully");
                    dispatch(getEditionsById(editionId)); // 🔄 Refetch
                }
            } else {
                console.warn("⚠️ Role is neither author nor editor. Skipping update.");
            }
        } catch (error) {
            console.error("❌ Error updating edition:", error);
        }
    };

    const setActionType = (data) => {
        if (data !== "Suggesting") {
            saveCurrentSuggestion(); // <- Flush current suggestion before mode change
        }
        setAction(data);
        setTooltipElement(null);
        console.log("DATA", data);
        switch (data) {
            case "History":
                setVersioningModalOpen(true);
                editor.setEditable(false);
                break;
            case "Editing":
            case "Suggesting":
                setVersioningModalOpen(false);
                editor.setEditable(true);
                break;
            default:
                setVersioningModalOpen(false);
                editor.setEditable(false);
        }
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

    const updateFocusedSuggestion = (editor) => {
        const { from } = editor.state.selection;
        const domAt = editor.view.domAtPos(from);
        let domNode =
            domAt.node?.nodeType === 3
                ? domAt.node.parentElement
                : domAt.node instanceof HTMLElement
                    ? domAt.node
                    : null;

        // Traverse upward or inward to find suggestion element
        let suggestionEl = domNode?.closest?.('.suggestion') || domNode?.querySelector?.('.suggestion');
        
        if (!suggestionEl) {
            // ❗ No suggestion element — clear focused and tempSuggestion
            editor.view.dom.querySelectorAll('.suggestion.focused').forEach(el =>
                el.classList.remove('focused')
            );

            tempSuggestion = null; // ✅ Clear suggestion mode
            return;
        }

        const suggestionId = suggestionEl.getAttribute('data-suggestion-id');
        if (!suggestionId) return;

        // ✅ If cursor moved to a different suggestion, clear tempSuggestion
        if (tempSuggestion?.suggestionId !== suggestionId) {
            tempSuggestion = null;
        }

        // Update focus styles
        editor.view.dom.querySelectorAll('.suggestion.focused').forEach(el =>
            el.classList.remove('focused')
        );

        editor.view.dom.querySelectorAll(`[data-suggestion-id="${suggestionId}"]`)
            .forEach(el => el.classList.add('focused'));
    };

    const approveSuggestionAt = (view, suggestionId) => {
        if (!view || !suggestionId) return;

        const { state, dispatch } = view;
        const { doc, schema } = state;
        const suggestionMark = schema.marks.suggestion;

        let tr = state.tr;
        let hasChange = false;

        doc.descendants((node, pos) => {
            if (!node.isText) return;

            node.marks.forEach(mark => {
                if (mark.type === suggestionMark && mark.attrs.suggestionId === suggestionId) {
                    tr = tr.removeMark(pos, pos + node.nodeSize, suggestionMark);
                    hasChange = true;
                }
            });
        });

        if (hasChange) {
            dispatch(tr);
        }
    };

    const onCardApprove = (event) => {
        console.log("event", event);
    }
    const onCardReject = (event) => {
        const mainParent = event.target.closest('.sidebar-card');
        const classNames = mainParent.classList; // returns the full class string
        const suggestionId = classNames[0];
        const matchingElement = document.querySelector(`[data-suggestion-id="${suggestionId}"]`);
        console.log("matchingElement", matchingElement);

        if (matchingElement) {
            matchingElement.remove(); // This will delete it from the DOM

            try {
                dispatch(deleteSuggestion(suggestionId));
                dispatch(fetchSuggestions(editionId));
            } catch (error) {
                console.log("error in deleting suggestion");

            }
        }
    }





    const rejectSuggestionAt = (view, from) => {
        if (!view) return;
        const { state, dispatch } = view;
        const { tr, doc, schema } = state;

        let found = false;

        doc.nodesBetween(from, from + 1, (node, pos) => {
            if (node.isText) {
                const suggestionMark = node.marks.find(mark => mark.type.name === 'suggestion');
                const deletionMark = node.marks.find(mark => mark.type.name === 'suggestion-deletion');

                if (suggestionMark) {
                    // Reject insertion (remove content)
                    tr.delete(pos, pos + node.nodeSize);
                    found = true;
                    return false;
                }

                if (deletionMark) {
                    // Reject deletion (keep content, remove deletion mark)
                    const newMarks = node.marks.filter(m => m.type.name !== 'suggestion-deletion');
                    const cleanNode = schema.text(node.text, newMarks);
                    tr.replaceWith(pos, pos + node.nodeSize, cleanNode);
                    found = true;
                    return false;
                }
            }
        });

        if (found) {
            dispatch(tr.setSelection(TextSelection.create(tr.doc, tr.selection.from)));
        }
    };



    function showSuggestionPopup({ target, username, timestamp, text = '', isDeletion, onApprove, onReject }) {
        document.querySelectorAll('.suggestion-popup').forEach(popup => popup.remove());
        const container = document.createElement('div');
        container.className = 'suggestion-popup';
        container.style.position = 'absolute';
        container.style.zIndex = 9999;
        container.style.width = '280px';
        container.style.backgroundColor = 'rgb(248, 249, 250)';
        container.style.border = '1px solid rgb(237, 242, 250)';
        container.style.borderRadius = '8px';
        container.style.padding = '10px';
        container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
        container.style.transition = '0.3s';
        container.style.cursor = 'pointer';
        container.style.fontSize = '14px';

        container.innerHTML = `
        <div class="thread">
            <div>
                <div class="comment" style="margin-top: 10px; padding: 5px;">
                    <div class="label-group" style="display: flex; justify-content: space-between; align-items: center;">
                        <label><strong>${username}</strong></label>
                        <label style="color: rgb(102, 102, 102); font-size: 0.85em;">${new Date(timestamp).toLocaleTimeString()}</label>
                    </div>
                    <div class="comment-content" style="margin-top: 6px;">
                        <p style="margin: 0;">${text || 'No content'}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="suggestion-approve" style="padding: 4px 8px; font-size: 13px;">Approve</button>
                    <button class="suggestion-reject" style="padding: 4px 8px; font-size: 13px;">Reject</button>
                </div>
                <div style="margin-top: 6px; font-size: 0.85em; color: rgb(136, 136, 136);">0 replies</div>
            </div>
        </div>
    `;

        document.body.appendChild(container);

        // Position popup near target element
        const rect = target.getBoundingClientRect();
        container.style.top = `${rect.bottom + window.scrollY + 5}px`;
        container.style.left = `${rect.left + window.scrollX}px`;

        container.querySelector('.suggestion-approve')?.addEventListener('click', () => {
            onApprove?.();
            container.remove();
        });

        container.querySelector('.suggestion-reject')?.addEventListener('click', () => {
            onReject?.();
            container.remove();
        });
    }


    // 2. Suggestion Plugin: Intercepts insertions
    const SuggestionPlugin = ({ getMode, getUser }) => {
        return new Plugin({
            key: new PluginKey('suggestionPlugin'),

            props: {
                handleTextInput(view, from, to, text) {
                    if (getMode() !== 'Suggesting') return false;

                    const { state, dispatch } = view;
                    const { schema } = state;
                    const user = getUser();

                    const $from = state.doc.resolve(from);
                    const existingSuggestionMark = $from.marks().find(mark => mark.type.name === 'suggestion');

                    // CASE 1: Typing inside an existing suggestion not owned by user
                    if (existingSuggestionMark && (!tempSuggestion || tempSuggestion.suggestionId !== existingSuggestionMark.attrs.suggestionId)) {
                        const tr = state.tr.insertText(text, from, to);
                        dispatch(tr);
                        console.log("not own user");

                        return true;
                    }

                    // CASE 2: New Suggestion Begins
                    if (!tempSuggestion) {
                        const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                        const createdAt = new Date().toISOString();

                        const mark = schema.marks.suggestion.create({
                            suggestionId,
                            username: user.name,
                            userId: user.id,
                            color: user.color,
                            createdAt,
                        });

                        const node = schema.text(text, [mark]);
                        const tr = state.tr.replaceWith(from, to, node);
                        dispatch(tr);

                        const domAt = view.domAtPos(from);
                        const domNode = domAt.node.nodeType === 3 ? domAt.node.parentElement : domAt.node;

                        tempSuggestion = {
                            from,
                            to: from + text.length,
                            text,
                            mark,
                            suggestionId,
                            user,
                            timestamp: createdAt,
                            domNode,
                            view
                        };
                        console.log("asjhHJAS");

                        currentSuggestionId = suggestionId; // 🟢 Track the suggestion id
                        setActiveSuggestion({ ...tempSuggestion }); // 🟢 Show popup once

                        return true;
                    }

                    // CASE 3: Continue current suggestion
                    const newText = tempSuggestion.text + text;
                    const node = schema.text(newText, [tempSuggestion.mark]);

                    const tr = state.tr.replaceWith(tempSuggestion.from, tempSuggestion.to, node);
                    dispatch(tr);

                    tempSuggestion.to = tempSuggestion.from + newText.length;
                    tempSuggestion.text = newText;
                    console.log("continous");

                    setActiveSuggestion({ ...tempSuggestion });
                    return true;
                },

                // handleTextInput(view, from, to, text) {
                //     if (getMode() !== 'Suggesting') return false;

                //     const { state, dispatch } = view;
                //     const { schema } = state;
                //     const user = getUser();

                //     const $from = state.doc.resolve(from);
                //     const existingSuggestionMark = $from.marks().find(mark => mark.type.name === 'suggestion');

                //     // Case 1: Typing inside existing suggestion (not our active one)
                //     if (existingSuggestionMark && (!tempSuggestion || tempSuggestion.suggestionId !== existingSuggestionMark.attrs.suggestionId)) {
                //         const tr = state.tr.insertText(text, from, to);
                //         dispatch(tr);
                //         return true;
                //     }

                //     // Case 2: New suggestion begins
                //     if (!tempSuggestion) {
                //         const suggestionId = `sugg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                //         const createdAt = new Date().toISOString();

                //         const mark = schema.marks.suggestion.create({
                //             suggestionId,
                //             username: user.name,
                //             userId: user.id,
                //             color: user.color,
                //             createdAt,
                //         });

                //         const node = schema.text(text, [mark]);
                //         const tr = state.tr.replaceWith(from, to, node);
                //         dispatch(tr);

                //         const domAt = view.domAtPos(from);
                //         const domNode = domAt.node.nodeType === 3 ? domAt.node.parentElement : domAt.node;

                //         // Store in temporary variable
                //         tempSuggestion = {
                //             from,
                //             to: from + text.length,
                //             text,
                //             mark,
                //             suggestionId,
                //             user,
                //             timestamp: createdAt,
                //             domNode,
                //             view
                //         };

                //         // Set React state for popup rendering
                //         // setActiveSuggestion({ ...tempSuggestion });

                //         return true;
                //     }

                //     // Case 3: Continue the suggestion
                //     const newText = tempSuggestion.text + text;
                //     const node = schema.text(newText, [tempSuggestion.mark]);

                //     const tr = state.tr.replaceWith(tempSuggestion.from, tempSuggestion.to, node);
                //     dispatch(tr);

                //     tempSuggestion.to = tempSuggestion.from + newText.length;
                //     tempSuggestion.text = newText;

                //     // Update React state (e.g., for popup display)
                //     // setActiveSuggestion({ ...tempSuggestion });

                //     return true;
                // },
                handleKeyDown(view, event) {
                    if (getMode() !== 'Suggesting') return false;

                    const { state, dispatch } = view;
                    const { schema, selection } = state;
                    const { from, to, empty } = selection;
                    const user = getUser();
                    const viewerId = user.id;

                    // 🧠 CASE 1: Text is selected and user hits Delete or Backspace
                    if ((event.key === 'Backspace' || event.key === 'Delete') && !empty) {
                        const deletionMark = schema.marks['suggestion-deletion'].create({
                            username: user.name,
                            userId: user.id,
                            createdAt: new Date().toISOString(),
                        });

                        const slice = state.doc.slice(from, to);
                        const markedNodes = [];
                        let deletedText = '';

                        slice.content.forEach(node => {
                            if (node.isText && node.text?.trim()) {
                                const isOwnSuggestion = node.marks.some(mark =>
                                    mark.type.name === 'suggestion' && mark.attrs.userId === viewerId
                                );
                                if (isOwnSuggestion) return;

                                deletedText += node.text;

                                const cleanedMarks = node.marks.filter(m => m.type.name !== 'suggestion');
                                markedNodes.push(node.mark([...cleanedMarks, deletionMark]));
                            } else {
                                markedNodes.push(node);
                            }
                        });

                        if (markedNodes.length > 0 && deletedText.trim()) {
                            const tr = state.tr.delete(from, to).insert(from, Fragment.fromArray(markedNodes));
                            dispatch(tr);

                            const domAt = view.domAtPos(from);
                            const domNode = domAt.node.nodeType === 3 ? domAt.node.parentElement : domAt.node;

                            tempDeletion = {
                                from,
                                to,
                                text: deletedText,
                                mark: deletionMark,
                                user,
                                timestamp: deletionMark.attrs.createdAt,
                                domNode,
                                view
                            };

                            setActiveDeleteSelection({ ...tempDeletion });
                            return true;
                        }
                    }

                    // 🧠 CASE 2: No selection — single character backspace/delete
                    if ((event.key === 'Backspace' || event.key === 'Delete') && empty) {
                        const deleteFrom = event.key === 'Backspace' ? from - 1 : from;
                        const deleteTo = event.key === 'Backspace' ? from : from + 1;

                        if (deleteFrom < 0 || deleteTo > state.doc.content.size) return false;

                        const slice = state.doc.slice(deleteFrom, deleteTo);
                        const node = slice.content.firstChild;

                        if (!node?.isText || !node.text) return false;

                        const isOwnSuggestion = node.marks.some(mark =>
                            mark.type.name === 'suggestion' && mark.attrs.userId === viewerId
                        );
                        if (isOwnSuggestion) return false;

                        const deletionMark = schema.marks['suggestion-deletion'].create({
                            username: user.name,
                            userId: user.id,
                            createdAt: new Date().toISOString(),
                        });

                        const markedTextNode = schema.text(node.text, [deletionMark]);
                        let tr = state.tr.delete(deleteFrom, deleteTo).insert(deleteFrom, markedTextNode);
                        tr = tr.setSelection(TextSelection.create(tr.doc, deleteFrom));
                        dispatch(tr);

                        // Merge with temp deletion if ongoing
                        if (tempDeletion) {
                            tempDeletion.from = Math.min(tempDeletion.from, deleteFrom);
                            tempDeletion.to = Math.max(tempDeletion.to, deleteTo);
                            tempDeletion.text = event.key === 'Backspace'
                                ? node.text + tempDeletion.text
                                : tempDeletion.text + node.text;
                        } else {
                            const domAt = view.domAtPos(deleteFrom);
                            const domNode = domAt.node.nodeType === 3 ? domAt.node.parentElement : domAt.node;

                            tempDeletion = {
                                from: deleteFrom,
                                to: deleteTo,
                                text: node.text,
                                mark: deletionMark,
                                user,
                                timestamp: deletionMark.attrs.createdAt,
                                domNode,
                            };
                        }

                        setActiveDeleteSelection({ ...tempDeletion });
                        return true;
                    }

                    return false;
                },
            },
        });
    };

    function saveCurrentSuggestion() {
        console.log("activeSuggestion", activeSuggestion);
        if (!activeSuggestion || !activeSuggestion?.text?.trim()) return;

        const { suggestionId, from, to, text, user } = activeSuggestion;

        const payload = {
            editionId: editionId,
            suggestionId: suggestionId,
            userId: user.id,
            text,
            fromPos: from,
            toPos: to,
            createdAt: new Date().toISOString(),
        };
        try {
            dispatch(createSuggestion(payload)); // redux-thunk
            // document.querySelector(".suggestion-popup")?.remove();
            tempSuggestion = null; // ✅ Clear only after save
            setActiveSuggestion(null); // Optionally reset React state


        } catch (error) {
            console.log("Create suggestion", error)
        }
    }

    const SuggestionCard = ({
        avatarUrl,
        username,
        timestamp,
        suggestionText,
        suggestionId,
        isActive,
        onApprove,
        onReject,
    }) => {
        return (
            <div
                className={`${suggestionId} sidebar-card rounded-md shadow-sm w-full max-w-md transition-all duration-200 ${isActive ? 'highlighted' : ''
                    }`}
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
                    <strong>Add:</strong>{' '}
                    <span className="italic text-gray-600">“{suggestionText}”</span>
                </div>
            </div>
        );
    };




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
                    aiLoading={aiLoading}
                    loadAiSuggestions={roleName === "editor" ? loadSuggestions : () => { }}
                    user={user}
                    editionsById={editionsById}
                    handleApprovalClick={handleApprovalClick}
                    actionType={setActionType}
                    sideBarMenu={setSideBarMenu}
                    suggestionLength={trackChangeDetails.suggestions.length}
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
                                        <div className="editor-container">
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
                                                {roleName === "editor" && (
                                                    <button
                                                        className={activeTab === 'ai' ? 'active' : ''}
                                                        onClick={() => setActiveTab('ai')}
                                                    >
                                                        AI Suggestions
                                                    </button>
                                                )}
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
                                                {activeTab === 'ai' && (action === "Editing") && (
                                                    <AISuggestionsSidebar editor={editor} aiLoading={aiLoading} />
                                                )}

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
                                                        <Box display="flex" justifyContent="center">
                                                            <Button
                                                                style={{ cursor: 'pointer' }}
                                                                variant="outlined"
                                                                color="primary"
                                                                type="submit"
                                                                onClick={showVersioningModal}
                                                            >
                                                                Show history
                                                            </Button>
                                                        </Box>

                                                    </div>
                                                )}
                                                {activeTab === "Suggesting" && (
                                                    <div style={{ display: "flex", flexDirection: "column", rowGap: 10 }}>
                                                        {trackChangeDetails.status === "succeeded" && trackChangeDetails.suggestions.length > 0 && trackChangeDetails.suggestions.map((sugg, index) => (
                                                            <SuggestionCard
                                                                key={index}
                                                                avatarUrl="https://example.com/avatar.jpg"
                                                                username={sugg?.userId?.email}
                                                                timestamp={sugg?.createdAt}
                                                                suggestionText={sugg.text}
                                                                suggestionId={sugg?.suggestionId}
                                                                isActive={activeSuggestion?.suggestionId === sugg?.suggestionId}
                                                                onApprove={(e) => onCardApprove(e)}
                                                                onReject={(e) => onCardReject(e)}
                                                            />
                                                        ))}
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