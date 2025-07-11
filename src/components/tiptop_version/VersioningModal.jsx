import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { watchPreviewContent } from '@tiptap-pro/extension-collaboration-history'
import {
  memo, useCallback, useEffect, useMemo, useState,
} from 'react'
import React from 'react'
import { VersionItem } from './VersionItem'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { CustomHighlight } from 'components/CustomHighlight'
import Table from '@tiptap/extension-table'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from "@tiptap/extension-table-header";
import Highlight from '@tiptap/extension-highlight'
import History from '@tiptap/extension-history'
import Image from "@tiptap/extension-image";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { InlineThread } from '@tiptap-pro/extension-comments'
import { CircularProgress, Modal } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
const getVersionName = version => {
  // console.log(version);

  if (version.name) {
    return version.name
  }

  if (version.version === 0) {
    return 'Initial version'
  }

  return `Version ${version.version}`
}

export const VersioningModal = memo(({
  versions, isOpen, onClose, onRevert, provider,
}) => {
  const [currentVersionId, setCurrentVersionId] = useState(null)
  const isCurrentVersion = versions && versions.length > 0 ? currentVersionId === versions.at(-1).version : false;
  const doc = provider.configuration.document;
  const [isLoading, setIsLoading] = useState(false);
  const [versionName, setVersionName] = useState(null);
  const [inisialEnter, setIsInitial] = useState(true)

  const buttonStyle = {
    padding: '6px 6px',
    marginRight: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#f1f1f1',
    cursor: 'pointer',
    fontSize: '0.9rem',
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e0e0e0',
    color: '#333',
  };
  const editorHistory = useEditor({
    editable: false,
    content: '',
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: doc }),
      CollaborationCursor.configure({ provider }),
      CustomHighlight,
      InlineThread,
      Table.configure({ resizable: true }),
      TextStyle,
      Highlight,
      Image,
      History,
      Underline,
      Strike,
      Link,
      Document,
      Paragraph,
      TextAlign.configure({ types: ['heading', 'paragraph', 'orderedList', 'inlineThread'] }),
      TableRow,
      TableCell,
      TableHeader
    ],
  })

  const reversedVersions = useMemo(() => versions.slice().reverse(), [versions])

  const handleVersionChange = newVersion => {
    setIsInitial(false);
    setIsLoading(true);
    setCurrentVersionId(newVersion);

    const version = versions.find(el => el.version === newVersion);
    setVersionName(version?.name || `Version ${newVersion}`);

    provider.sendStateless(
      JSON.stringify({
        action: 'version.preview',
        version: newVersion,
      }),
    );
  };

  const versionData = useMemo(() => {
    if (!versions.length) {
      return null
    }

    return versions.find(v => v.version === currentVersionId)
  }, [currentVersionId, versions])
  useEffect(() => {
    if (isOpen && currentVersionId === null && versions.length > 0) {
      const initialVersion = versions.at(-1).version

      setCurrentVersionId(initialVersion);
      provider.sendStateless(
        JSON.stringify({
          action: 'version.preview',
          version: initialVersion,
        }),
      )
    }
  }, [currentVersionId, versions, isOpen, provider])

  useEffect(() => {
    if (isOpen) {
      const unbindContentWatcher = watchPreviewContent(provider, content => {
        if (editorHistory) {
          console.log(content);
          console.log(inisialEnter);
          if (inisialEnter == true) {
            const version = versions[0];
            setVersionName(version?.name || `Version ${newVersion}`);
          }
          editorHistory.commands.setContent(content.content);
          setIsLoading(false);
        }
      })

      return () => {
        unbindContentWatcher()
      }
    }
  }, [isOpen, provider, editorHistory])
  const handleClose = useCallback(() => {
    onClose()
    setCurrentVersionId(null)
    // editorHistory?.commands.clearContent()
  }, [onClose, editorHistory])

  const handleRevert = useCallback(() => {
    const accepted = confirm('Are you sure you want to revert to this version? Any changes not versioned will be lost.') // eslint-disable-line no-restricted-globals

    if (accepted) {
      onRevert(currentVersionId, versionData)
      onClose()
    }
  }, [onRevert, currentVersionId, versionData, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >

        <div style={{ display: 'flex' }}>



          <div className="dialog-content " style={{ width: '80%' }}> <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <h2 style={{ color: 'gray' }}>{versionName}</h2>
            <IconButton style={{ marginLeft: 'auto' }} onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </div>
            <div className=' col-group'>
              <div className="main">
                {!isLoading ? (
                  <EditorContent editor={editorHistory} />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '400px',
                      flexDirection: 'column',
                    }}
                  >
                    <CircularProgress />
                    <p style={{ marginTop: '1rem', color: '#555' }}>Processing content...</p>
                  </div>
                )}
              </div>
              <div className="sidebarHistory">
                <div className="sidebar-options">
                  <div className="label-large">History ({reversedVersions.length} versions)</div>
                  <div className="versions-group">
                    {reversedVersions.map(v => (
                      <VersionItem
                        date={v.date}
                        title={getVersionName(v)}
                        onClick={() => handleVersionChange(v.version)}
                        isActive={currentVersionId === v.version}
                        key={`version_item_${v.version}`}
                      />
                    ))}
                  </div>
                  <div className="button-group">
                    <button type="button" style={cancelButtonStyle} onClick={handleClose}>
                      Close
                    </button>
                    <button
                      className="primary"
                      type="button"
                      disabled={!versionData || isCurrentVersion}
                      style={cancelButtonStyle} onClick={handleRevert}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    </Modal>
  )
})

VersioningModal.displayName = 'VersioningModal'