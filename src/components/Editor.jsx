import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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
import "../styles/comment.css";
import "../styles/style.scss";
import { CircularProgress } from "@mui/material";
import { CustomHighlight } from "./CustomHighlight";
import { AISuggestionsSidebar } from "./EditorSidebar";
import { CommentsSidebar } from "./CommentsSidebar";
import { useSelector } from 'react-redux';
import { EditorContent, useEditor } from '@tiptap/react';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Markdown } from 'tiptap-markdown';
// import { useParams } from 'react-router';
import Comments from '@tiptap-pro/extension-comments';

import Paragraph from '@tiptap/extension-paragraph';
import { Pagination } from 'tiptap-pagination-breaks';



import CollaborationHistory from '@tiptap-pro/extension-collaboration-history'
import { VersioningModal } from './tiptop_version/VersioningModal';
import { renderDate } from './tiptop_version/utils';
import { InlineThread } from '@tiptap-pro/extension-comments'

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
        color: getRandomColor(),
    };
};

const Editor = ({ ydoc, provider, room }) => {
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const [status, setStatus] = useState('connecting');
    const [currentUser, setCurrentUser] = useState(getInitialUser());
    const [isLoading, setIsLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rules, setRules] = useState(initialRules);
    const [tooltipElement, setTooltipElement] = useState(null);
    const importRef = useRef(null);
    const APP_ID = "pkry8p7m";


    const [editionId] = useState(room);
    const webIORef = useRef(null);
    const [getThreds, setThreads] = useState([]);
    const [mode, setMode] = useState(false);
    const user = useUser();
    const threadsRef = useRef([])
    const [selectedThread, setSelectedThread] = useState(null)

    const [latestVersion, setLatestVersion] = React.useState(null)
    const [currentVersion, setCurrentVersion] = React.useState(null)
    const [versions, setVersions] = React.useState([])
    const [isAutoVersioning, setIsAutoVersioning] = React.useState(false)
    const [versioningModalOpen, setVersioningModalOpen] = React.useState(false)
    const [hasChanges, setHasChanges] = React.useState(false)

    const showVersioningModal = useCallback(() => {
        setVersioningModalOpen(true)
    }, [])

    // console.log("editionId", editionId);



    const editor = useEditor({
        room,
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

            Pagination.configure({
                pageHeight: 1056, // default height of the page
                pageWidth: 816,   // default width of the page
                pageMargin: 96,   // default margin of the page
                breaks: ['page-break']
            }),

            CommentsKit.configure({

                provider,

                useLegacyWrapping: false,
                deleteUnreferencedThreads: false,
                onClickThread: (threadId) => {
                    console.log("@#@@THREAD  " + JSON.stringify(threadId));
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

            Image.configure({ inline: true, allowBase64: true }),

            Table.configure({ resizable: true }),

            History,
            InlineThread,
            TextStyle,

            Underline,

            Highlight,

            Strike,

            Link,

            TextAlign.configure({ types: ['heading', 'paragraph', 'orderedList'] }),

            TableRow,

            TableCell,

            TableHeader,

            PageBreak,

            // Markdown.configure({

            //     html: true,                  // Allow HTML input/output

            //     tightLists: true,            // No <p> inside <li> in markdown output

            //     tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight

            //     bulletListMarker: '-',       // <li> prefix in markdown output

            //     linkify: false,              // Create links from "https://..." text

            //     breaks: false,               // New lines (\n) in markdown input are converted to <br>

            //     transformPastedText: false,  // Allow to paste markdown text in the editor

            //     transformCopiedText: false,  // Copied text is transformed to markdown

            // }),

            // Highlight,

            // TaskList,

            // TaskItem,

            // CharacterCount.extend().configure({ limit: 10000 }),

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
        ],

        // enableContentCheck: true,

        // onContentError: ({ disableCollaboration }) => {

        //     disableCollaboration();

        // },

        onCreate: ({ editor: currentEditor }) => {

            provider.on('synced', () => {

                if (currentEditor.isEmpty) {

                    currentEditor.commands.setContent(defaultContent);

                }

            });

        },
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            const updatedContent = injectPageBreaksIntoJSON(json.content);

            // ✅ Safe WebSocket send
            console.log(updatedContent);

            const payload = {
                content: updatedContent,
                type: "doc"
            }
            // alert("webIORef.current" + webIORef.current.readyState);
            if (webIORef.current && webIORef.current.readyState === 1) {
                webIORef.current.send(JSON.stringify({
                    type: "update-document",
                    userId: user._id,
                    username: user.name,
                    editionId: editionId,
                    content: payload,
                }));
            }


        },
    });
    const stableUser = useMemo(() => user, [user?._id]);


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

            // alert("fhjhjh" + message.type)
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
                        //  const updatedContent = injectPageBreaksIntoJSON(message.data.content);
                        //  await waitUntilEditorViewIsReady(editor);
                        //  requestAnimationFrame(() => {
                        //      try {
                        //          editor?.commands.setContent(updatedContent);
                        //          console.log("✅ Content synced");
                        //      } catch (err) {
                        //          console.error("❌ Set content error:", err);
                        //          setError("Setting content failed.");
                        //      } finally {
                        //          setIsLoading(false);
                        //      }
                        //  });
                    } else {
                        setMode(false);
                    }
                    break;
                case "all-comments":

                    console.log("📄 Got comments:", message.data);
                    setThreads(message.data);
                    // editor
                    //     .chain()
                    //     .setThread(message.data)
                    //     .run()
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
        if (!editor) return;

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
        if (!editor) return;

        try {
            await editor.commands.loadAiSuggestions();
            const storage = editor.extensionStorage.aiSuggestion
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

    const setName = useCallback(() => {
        const name = (window.prompt('Name', currentUser.name) || '').trim().substring(0, 32);
        if (name) setCurrentUser({ ...currentUser, name });
    }, [currentUser]);

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

                    console.log("context.content", context.content);

                    editor.commands.setContent(context.content);
                    // editor.commands.setTextSelection(editor.state.doc.content.size);
                    // editor.commands.focus();

                    // await waitUntilEditorViewIsReady(editor);
                    const updatedContent = context.content;
                    // alert(mode)
                    if (mode == false) {
                        // alert("DJHDHHJ", webIORef.current.readyState)

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
                        // alert(webIORef.current.readyState);
                        console.log("Updatre");
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

    const [showUnresolved, setShowUnresolved] = useState(true)
    const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'comments'
    const { threads, createThread } = useThreads(provider, editor, user, webIORef, getThreds || []);
    const filteredThreads = Array.isArray(threads)
        ? threads.filter(t => (showUnresolved ? !t.resolvedAt : !!t.resolvedAt))
        : [];


    // console.log("@#### 1" + JSON.stringify(filteredThreads));
    // console.log("@#### 12" + JSON.stringify(threads));

    threadsRef.current = threads;

    const updateComment = useCallback((threadId, commentId, content, metaData) => {
        editor.commands.updateComment({
            threadId, id: commentId, content, data: metaData,
        })
    }, [editor])
    const resolveThread = useCallback(threadId => {
        editor.commands.resolveThread({ id: threadId })
    }, [editor])
    const unresolveThread = useCallback(threadId => {
        editor.commands.unresolveThread({ id: threadId })
    }, [editor]);
    const onHoverThread = useCallback(threadId => {
        console.log("@##ThraedID" + threadId)
        console.log(editor.commands);

        hoverThread(editor, [threadId])
    }, [editor]);

    const onLeaveThread = useCallback(() => {
        hoverOffThread(editor)
    }, [editor]);
    const deleteThread = useCallback(threadId => {
        console.log("threadId", threadId);
        provider.deleteThread(threadId)
        editor.commands.removeThread({ id: threadId })
    }, [editor])

    const selectThreadInEditor = useCallback(threadId => {
        console.log("selectThreadInEditor" + threadId);
        editor.chain().selectThread({ id: threadId }).run()
    }, [editor])



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

    const [commitDescription, setCommitDescription] = React.useState('')

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
    }, [editor])


    return (
        <>
            <VersioningModal
                versions={versions}
                isOpen={versioningModalOpen}
                onClose={handleVersioningClose}
                onRevert={handleRevert}
                currentVersion={currentVersion}
                latestVersion={latestVersion}
                provider={provider}
            />
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
                    handleImportClick={handleImportClick}
                    importRef={importRef}
                    handleImportFilePick={handleImportFilePick}
                    aiLoading={aiLoading}
                    loadAiSuggestions={loadSuggestions}
                />

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
                            selectedThreads={editor.storage.comments.focusedThreads}
                            selectedThread={selectedThread}
                            setSelectedThread={setSelectedThread}
                            threads={threads}
                        >
                            <div className="col-group">
                                <div className="main" style={{ width: "70%" }}>
                                    <div className="control-group">
                                        <div className="button-group">
                                            <button onClick={createThread} disabled={editor.state.selection.empty}>Add comment</button>
                                            {/* <button onClick={() => editor.chain().focus().setImage({ src: 'https://placehold.co/800x500' }).run()}>Add image</button> */}
                                        </div>
                                    </div>
                                    <div className="editor-container">
                                        <div className="editor-page">
                                            <EditorContent editor={editor} />
                                            <div className="collab-status-group"
                                                data-state={status === 'connected' ? 'online' : 'offline'}>
                                                {/* <label>
                                                {status === 'connected'
                                                    ? `${editor.storage.collaborationCursor.users.length} user${editor.storage.collaborationCursor.users.length === 1 ? '' : 's'} online in ${room}`
                                                    : 'offline'}
                                            </label> */}
                                                {/* <button style={{ '--color': currentUser.color }} onClick={setName}>
                                                ✎ {currentUser.name}
                                            </button> */}
                                            </div>
                                            {/* <EditorContent editor={editor} /> */}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: '30%' }}>
                                    {/* Tab Buttons */}
                                    <div className="tab-header" style={{ width: '100%', overflowX: 'auto' }}>
                                        <button
                                            className={activeTab === 'ai' ? 'active' : ''}
                                            onClick={() => setActiveTab('ai')}
                                        >
                                            AI Suggestions
                                        </button>
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
                                    </div>

                                    {/* Tab Content */}
                                    <div className="tab-content">
                                        {activeTab === 'ai' && (
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
                                            <div className="sidebar-options">
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
                                                        <input
                                                            disabled={!hasChanges}
                                                            type="text"
                                                            placeholder="Version name"
                                                            value={commitDescription}
                                                            onChange={handleCommitDescriptionChange}
                                                        />
                                                        <button style={{ marginTop: '5px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer' }}
                                                            disabled={!hasChanges || commitDescription.length === 0}
                                                            type="submit"
                                                        >
                                                            Create
                                                        </button>
                                                    </form>
                                                </div>

                                                <hr />

                                                <button style={{ cursor: 'pointer' }} className="primary" type="button" onClick={showVersioningModal}>
                                                    Show history
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                <SuggestionTooltip element={tooltipElement} editor={editor} />
            </div >
        </>
    );

};

export default Editor;