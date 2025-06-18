import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import mammoth from "mammoth";

import "../styles/editor-toolbar.css";
import "../styles/collab-cursor.css";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSelector } from "react-redux";

const ydoc = new Y.Doc();
const provider = new WebsocketProvider("ws://localhost:5000", "my-room", ydoc);

export default function CollabEditor() {
    const userDetails = useSelector((state) => state.auth);
    console.log("userDetails",userDetails);
    
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ history: false }),
            Collaboration.configure({ document: ydoc }),
            CollaborationCursor.configure({
                provider,
                user: {
                    name: `${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`,
                    color: stringToColor(`${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`),
                },
            }),
        ],
    });

    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `#${((hash >> 24) & 0xff).toString(16).padStart(2, "0")}${(
            (hash >> 16) &
            0xff
        )
            .toString(16)
            .padStart(2, "0")}${((hash >> 8) & 0xff).toString(16).padStart(2, "0")}`;
        return color.slice(0, 7);
    }


    const handleDocxImport = async (event) => {
        const file = event.target.files[0];
        if (!file || !editor) return;

        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

        editor.commands.setContent(html, false); // push imported HTML into editor
    };

    return (
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
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

                <button
                    className="upload-docx-button"
                    title="Upload DOCX"
                    onClick={() => document.getElementById("docx-upload-input").click()}
                >
                    <UploadFileIcon style={{ marginRight: "6px" }} />
                    Upload
                </button>
                <input
                    type="file"
                    id="docx-upload-input"
                    accept=".doc,.docx"
                    style={{ display: "none" }}
                    onChange={handleDocxImport}
                />

            </div>
            {editor ? (
                <EditorContent editor={editor} />
            ) : (
                <p>Loading collaborative editor...</p>
            )}
        </div>
    );
}
