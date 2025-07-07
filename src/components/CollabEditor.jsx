import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { EditorContent, useEditor } from "@tiptap/react";


import { MenuBar } from "./MenuBar";
import { RulesModal } from "./RulesModal";
import { SidebarRulesSection } from "./SidebarRulesSection";
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
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Import } from '@tiptap-pro/extension-import'
import { ThreadsList } from './ThreadsList'
import { ThreadsProvider } from './context'
import { useThreads } from './hooks/useThreads'
import { useUser } from './hooks/useUser'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import TextStyle from '@tiptap/extension-text-style';
import PageBreak from './extensions/PageBreak';
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import "../styles/collab-cursor.css";
import "../styles/tiptap.css";
import { CircularProgress } from "@mui/material";
import { CustomHighlight } from "./CustomHighlight";
import { AISuggestionsSidebar } from "./EditorSidebar";
import { CommentsSidebar } from "./CommentsSidebar";

const APP_ID = "pkry8p7m";//7j9y6m10
const ydoc = new Y.Doc();
const doc = new Y.Doc();
const isDev = import.meta.env.MODE === 'development' || 'development';
// const id = isDev ? 'dev' : uuid();



export default function CollabEditor() {
    const dispatch = useDispatch();
    const { editionId, projectId } = useParams();
    const userDetails = useSelector((state) => state.auth);
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const proofreadState = useSelector((state) => state.proofread);
    const importRef = useRef(null);
    const user = useUser();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUnresolved, setShowUnresolved] = useState(true)
    const [selectedThread, setSelectedThread] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rules, setRules] = useState(initialRules);
    const [tooltipElement, setTooltipElement] = useState(null);

    const webIORef = useRef(null);
    let webIODEv = useRef(null);
    const provider = new TiptapCollabProvider({
        appId: "7j9y6m10",
        name: `MapSystems_Room`,
        document: doc,
    })

    // useEffect(() => {
    //     if (!editionId || webIODEv) return;
    //     const wpro = new WebsocketProvider("ws://localhost:5000", editionId, ydoc);
    //     webIODEv = wpro;
    // }, [editionId]);

    // useEffect(() => {

    //     if (!editionId || webIORef.current) return;

    //     const ws = new WebSocket("ws://localhost:5000/" + editionId);
    //     webIORef.current = ws;

    //     ws.onopen = () => {
    //         console.log("✅ WebSocket connected");
    //         ws.send(JSON.stringify({ type: "join-room", userId: user._id, username: user.name }));
    //         ws.send(JSON.stringify({ type: "get-all-documents", editionId }));
    //         ws.send(JSON.stringify({ type: "all-comments", editionId }));
    //     };

    //     ws.onmessage = async (event) => {
    //         const message = JSON.parse(event.data);

    //         switch (message.type) {
    //             case "user-joined":
    //                 console.log("👤 User joined:", message.username);
    //                 break;
    //             case "user-left":
    //                 console.log("👋 User left:", message.username);
    //                 break;
    //             case "current-users":
    //                 console.log("🧑‍🤝‍🧑 Users in room:", message.users);
    //                 break;
    //             case "all-documents":
    //                 console.log("📄 Got documents:", message.data);
    //                 if (message.data?.content) {
    //                     setMode(true);
    //                     const updatedContent = injectPageBreaksIntoJSON(message.data.content);
    //                     await waitUntilEditorViewIsReady(editor);
    //                     requestAnimationFrame(() => {
    //                         try {
    //                             editor?.commands.setContent(updatedContent);
    //                             console.log("✅ Content synced");
    //                         } catch (err) {
    //                             console.error("❌ Set content error:", err);
    //                             setError("Setting content failed.");
    //                         } finally {
    //                             setIsLoading(false);
    //                         }
    //                     });
    //                 } else {
    //                     setMode(false);
    //                 }
    //                 break;
    //             case "all-comments":
    //                 setFilteredThreads(message.data);
    //                 break;
    //         }
    //     };

    //     ws.onerror = (err) => {
    //         console.error("❌ WebSocket error:", err);
    //     };

    //     ws.onclose = () => {
    //         console.log("🔌 WebSocket closed");
    //         webIORef.current = null;
    //     };

    //     return () => {
    //         ws.close();
    //         webIORef.current = null;
    //     };
    // }, [editionId]);

    const editor = useEditor(
        documentToken
            ? {
                extensions: [
                    StarterKit.configure({ history: false }),
                    Import.configure({
                        appId: APP_ID,
                        token: documentToken,
                        endpoint: 'https://api.tiptap.dev/v1/convert',
                        experimentalDocxImport: true,
                    }),
                    // Placeholder.configure({
                    //     placeholder: 'Write a text to add comments …',
                    // }),
                    Collaboration.configure({ document: ydoc }),
                    // CollaborationCursor.configure({
                    //     user: {
                    //         name: `${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`,
                    //         color: stringToColor(`${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`),
                    //     },
                    // }),
                    CollaborationCursor.configure({ provider }),
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
                    }),
                    CommentsKit.configure({
                        provider,
                        useLegacyWrapping: false,
                        onClickThread: (threadId) => {
                            const isResolved = threadsRef.current.find(t => t.id === threadId)?.resolvedAt;
                            if (!threadId || isResolved) {
                                setSelectedThread(null);
                                editor?.chain().unselectThread().run();
                            } else {
                                setSelectedThread(threadId);
                                editor?.chain().selectThread({ id: threadId, updateSelection: false }).run();
                            }
                        },
                    }),
                    CustomHighlight,
                    webIODEv,
                    Image.configure({ inline: true, allowBase64: true }),
                    Table.configure({ resizable: true }),
                    History,
                    TextStyle,
                    Underline,
                    Strike,
                    Highlight,
                    Link,
                    TextAlign.configure({ types: ['heading', 'paragraph'] }),
                    TableRow,
                    TableCell,
                    TableHeader,
                    PageBreak,
                ],
                // content: "<p>Start writing collaboratively...</p>",
                // onUpdate: ({ editor }) => {
                //     const json = editor.getJSON();
                //     const updatedContent = injectPageBreaksIntoJSON(json.content);
                //     // AI suggestions load on update
                //     updatedEditor.commands.loadAiSuggestions();
                //     // ✅ Safe WebSocket send
                //     console.log("webIORef.current" + webIORef.current);
                //     if (webIORef.current == null) {
                //         const ws = new WebSocket("ws://localhost:5000/" + editionId);
                //         webIORef.current = ws;

                //     }
                //     console.log("webIORef.current" + webIORef.current);
                //     if (webIORef.current) {
                //         ws.send(JSON.stringify({
                //             type: "update-document",
                //             userId: user._id,
                //             username: user.name,
                //             editionId,
                //             content: updatedContent,
                //         }));
                //     }
                // },
            }
            : null
    );

    // useEffect(() => {
    //     if (editor) {
    //         editor.commands.loadAiSuggestions();
    //     }
    // }, [editor]);


    // const handleProofread = () => {
    //     if (!editor) return;
    //     setIsLoading(true);
    //     const selection = editor.state.selection;
    //     const $pos = selection.$anchor;

    //     const allPageBreaks = [];
    //     editor.state.doc.descendants((node, pos) => {
    //         if (node.type.name === 'pageBreak') {
    //             allPageBreaks.push(pos);
    //         }
    //     });

    //     const currentPage = allPageBreaks.filter(pos => pos < $pos.pos).length + 1;

    //     const start = currentPage === 1 ? 0 : allPageBreaks[currentPage - 2] + 1;
    //     const end = allPageBreaks[currentPage - 1] ?? editor.state.doc.content.size;

    //     const pageSlice = editor.state.doc.slice(start, end);
    //     const pageText = pageSlice.content.textBetween(0, pageSlice.content.size, '\n');

    //     const { from } = editor.view.state.selection;
    //     const coords = editor.view.coordsAtPos(from);
    //     const container = document.querySelector(".tiptap");
    //     const rect = container.getBoundingClientRect();

    //     setSuggestionPosition({
    //         top: coords.top - rect.top + 30,
    //         left: coords.left - rect.left,
    //     });

    //     // ✅ Trigger loader and API call
    //     setIsLoading(true); // show loader
    //     dispatch(proofreadText(pageText))
    //         .then(() => setIsLoading(false)) // hide loader after success
    //         .catch(() => setIsLoading(false)); // hide loader on error
    // };


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
            onImport: (context) => {
                if (context.error) {
                    console.error("Import error:", context.error);
                } else {
                    setIsLoading(false);
                    console.log("context.content", context.content);

                    editor.commands.setContent(context.content);
                    // editor.commands.setTextSelection(editor.state.doc.content.size);
                    // editor.commands.focus();
                }
            },
        }).run();
    }, [editor]);

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

    const waitUntilEditorViewIsReady = async (editor, retries = 10, delay = 100) => {
        for (let i = 0; i < retries; i++) {
            if (editor?.view?.dom?.getBoundingClientRect) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        throw new Error("Editor view not ready after waiting.");
    };

    const { threads = [], createThread } = useThreads(provider, editor, user);
    const threadsRef = useRef(threads);
    threadsRef.current = threads;

    const selectThreadInEditor = useCallback(threadId => {
        editor.chain().selectThread({ id: threadId }).run();
    }, [editor]);

    const deleteThread = useCallback(threadId => {
        provider.deleteThread(threadId);
        editor.commands.removeThread({ id: threadId });
    }, [editor]);

    const resolveThread = useCallback(threadId => {
        editor.commands.resolveThread({ id: threadId });
    }, [editor]);

    const unresolveThread = useCallback(threadId => {
        editor.commands.unresolveThread({ id: threadId });
    }, [editor]);

    const updateComment = useCallback((threadId, commentId, content, metaData) => {
        editor.commands.updateComment({
            threadId, id: commentId, content, data: metaData,
        });
    }, [editor]);

    const onHoverThread = useCallback(threadId => {
        hoverThread(editor, [threadId]);
    }, [editor]);

    const onLeaveThread = useCallback(() => {
        hoverOffThread(editor);
    }, [editor]);

    if (!editor) return <p>Loading editor...</p>;

    const storage = editor.extensionStorage.aiSuggestion;
    const suggestions = storage.getSuggestions()


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
            <MenuBar
                editor={editor}
                // handleProofread={handleProofread}
                handleImportClick={handleImportClick}
                importRef={importRef}
                handleImportFilePick={handleImportFilePick}
            />
            {console.log("isLoading", isLoading, editor)}
            {!isLoading ? (
                <>
                    <div className="col-group">
                        <div className="main">
                            <div className="editor-container">
                                <div className="editor-page">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>
                        <AISuggestionsSidebar editor={editor} />
                    </div>
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
            <SuggestionTooltip element={tooltipElement} editor={editor} />
        </>
    );
}