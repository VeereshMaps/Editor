import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { EditorContent, useEditor } from "@tiptap/react";
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
import AiSuggestion from "@tiptap-pro/extension-ai-suggestion";
import { Import } from '@tiptap-pro/extension-import'
import { useUser } from './hooks/useUser'
import TextStyle from '@tiptap/extension-text-style';
import PageBreak from './extensions/PageBreak';
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

import "../styles/collab-cursor.css";
import "../styles/tiptap.css";
import { Button, CircularProgress } from "@mui/material";
import { CustomHighlight } from "./CustomHighlight";
import { AISuggestionsSidebar } from "./EditorSidebar";
import { CheckCircleOutline } from "@mui/icons-material";
import { InlineThread } from '@tiptap-pro/extension-comments'
import { Heading } from "./tiptop_version/DiffHeading";
import Paragraph from "@tiptap/extension-paragraph";
import { getEditionById, updateEdition } from "redux/Slices/updateEditionSlice";
import AlertService from "utils/AlertService";
// const APP_ID = "7j9y6m10";//7j9y6m10

// const APP_ID = "8mzjy21k";
const APP_ID = "6kpvqylk";
export default function CollabEditor({ ydoc, provider, room }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { editionId, projectId } = useParams();
    const userDetails = useSelector((state) => state.auth);
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    const proofreadState = useSelector((state) => state.proofread);
    const importRef = useRef(null);
    const user = useUser();
    const editionsById = useSelector((state) => state.editionsById);
    // console.log("@#$editionsById ",editionsById);


    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rules, setRules] = useState(initialRules);
    const [tooltipElement, setTooltipElement] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [noContentFound, setContentFound] = useState(false);
    const editor = useEditor({
        editable: false,
        immediatelyRender: true,
        content: '',
        extensions: [
            StarterKit.configure({ history: false }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({ provider }),
            Image.configure({ inline: true, allowBase64: true }),
            Table.configure({ resizable: true }),
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
            Heading,
            CustomHighlight,
            InlineThread,
            TextStyle,
            Highlight,
            Image,
            // History,
            Underline,
            Strike,
            Link,
            Paragraph,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TableRow,
            TableCell,
            TableHeader,
            PageBreak,
        ],
    })
    const loadSuggestions = async () => {
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

    useEffect(() => {
        if (!editor && roleName != "editor") return;

        const interval = setInterval(() => {
            const storage = editor.extensionStorage.aiSuggestion;
            setAiLoading(storage?.isLoading || false);
        }, 200);

        return () => clearInterval(interval);
    }, [editor]);


    const handleImportFilePick = useCallback(async (e) => {
        const file = e.target.files[0];
        if (importRef.current) {
            importRef.current.value = "";
        }
        if (!file || !editor) return;

        setIsLoading(true);

        try {
            await editor.chain().import({
                file,
                onImport: (context) => {
                    if (context.error) {
                        console.error("Import error:", context.error);
                        setIsLoading(false);
                    } else {
                        console.log("context.content", context.content);
                        editor.commands.setContent(context.content);
                        setIsLoading(false);
                    }
                },
            }).run();
        } catch (error) {
            console.error("Import failed:", error);
            setIsLoading(false);
        }
    }, [editor]);

    const handleMoveToGold = async () => {
        try {
            console.log(editor?.getJSON());
            
            const updatedEdition = { status: "Gold", editorContent: editor?.getJSON() };
            const response=await dispatch(updateEdition({ id: editionId, updatedData: updatedEdition })).unwrap();
            console.log("!@##response ",response);
            AlertService.success('Edition Moved to gold successfully!');
            if(response){
                navigate(`/projects`);
            }
        } catch (error) {
            AlertService.error('Failed to move the edition to Gold.');
            console.error("Error updating edition status to Gold:", error);
        }
    };
    if (!editor) return <p>Loading editor...</p>;

    const storage = editor.extensionStorage.aiSuggestion;
    const suggestions = storage?.getSuggestions() || []; // Add null check
    useEffect(() => {
        setIsLoading(true)
        const fetchData = async () => {
            if (editionId) {
                try {
                    const response = await dispatch(getEditionById(editionId)).unwrap();
                    console.log("Fetched document:", response);
                    if (response.editorContent) {
                        setContentFound(true);
                        editor.commands.setContent(response.editorContent.content);
                    } else {
                        setContentFound(false);
                    }
                } catch (error) {
                    setContentFound(false);
                    console.error("Failed to fetch document:", error);
                }
                setIsLoading(false)
            }
        };

        fetchData();
    }, [dispatch, editionId]);

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
            {noContentFound && (
                <>
                    <Button
                        variant="outlined"
                        startIcon={
                            aiLoading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <CheckCircleOutline style={{ color: "green" }} />
                            )
                        }
                        onClick={loadSuggestions}
                        size="small"
                        disabled={aiLoading}
                    >
                        {aiLoading ? "Loading..." : "Proof Read with AI"}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleMoveToGold}
                        size="small"
                        style={{ marginLeft: '8px' }}
                    >
                        Move To Gold
                    </Button>
                </>
            )}

            {/* Hidden file input for import functionality */}
            <input
                ref={importRef}
                type="file"
                accept=".docx,.doc"
                style={{ display: 'none' }}
                onChange={handleImportFilePick}
            />
            {!isLoading ? (
                noContentFound ? (
                    <div className="col-group">
                        <div className="main" style={{ width: '70%' }}>
                            <div className="editor-container">
                                <div className="editor-page">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '30%' }}>
                            <AISuggestionsSidebar editor={editor} aiLoading={aiLoading} />
                        </div>
                    </div>
                ) : (
                    <div>No Content Found</div>
                )
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                    flexDirection: 'column',
                }}>
                    <CircularProgress />
                    <p style={{ marginTop: '1rem', color: '#555' }}>Processing .docx file...</p>
                </div>
            )}

            <SuggestionTooltip element={tooltipElement} editor={editor} />
        </>
    );
}