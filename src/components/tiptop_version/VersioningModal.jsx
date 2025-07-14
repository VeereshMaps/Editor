import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
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
import { SnapshotCompare } from '@tiptap-pro/extension-snapshot-compare'
import { useUser } from 'components/hooks/useUser'
import "../../styles/tiptap.css";
import { Heading } from './DiffHeading'

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
const colors = [
  '#FF5722', // deep orange
  '#4CAF50', // green
  '#2196F3', // blue
  '#9C27B0', // purple
  '#FFC107', // amber
  '#E91E63', // pink
  '#3F51B5', // indigo
  '#00BCD4', // cyan
]

const colorMapping = new Map()


export const VersioningModal = memo(({
  versions, isOpen, onClose, onRevert, provider,
}) => {
  const [currentVersionId, setCurrentVersionId] = useState(null)
  const isCurrentVersion = versions && versions.length > 0 ? currentVersionId === versions.at(-1).version : false;
  const doc = provider.configuration.document;
  const [isLoading, setIsLoading] = useState(false);
  const [versionName, setVersionName] = useState(null);
  const [inisialEnter, setIsInitial] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const user = useUser();
  if (!colorMapping.has(user._id)) {
    // colorMapping.set(user._id, colors[(user._id || '').length % colors.length])
  }
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
    immediatelyRender: true,
    content: '',
    extensions: [
      Heading,
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
      TableHeader,
      SnapshotCompare.configure({
        provider,
        // Allows you to customize how the diffs are rendered as decorations within the editor
        mapDiffToDecorations(ctx) {
          return ctx.defaultMapDiffToDecorations({
            ...ctx,
            attributes: {
              // Add a custom attribute to the diff spans
              'data-my-custom-attribute': 'true',
            },
          })
        },
      }),
    ],
  })
  const versionData = useMemo(() => {
    if (!versions.length) {
      return null
    }
    return versions.find(v => v.version === currentVersionId)
  }, [currentVersionId, versions])
  const { isDiffing, users } = useEditorState({

    editor: editorHistory, // ← correct key!
    selector: ctx => {
      const userHistory = ctx.editor?.storage?.snapshotCompare

      if (!userHistory) {
        return {
          isDiffing: false,
          users: new Set(),
        }
      }

      return {
        isDiffing: userHistory.isPreviewing,
        users: userHistory.diffs.reduce(
          (acc, { attribution: { userId } }) => (userId ? acc.add(userId) : acc),
          new Set(),
        ),
      }
    }
  })

  const reversedVersions = useMemo(() => versions.slice().reverse(), [versions])
  const handleRevert = useCallback(() => {
    const accepted = confirm('Are you sure you want to revert to this version? Any changes not versioned will be lost.') // eslint-disable-line no-restricted-globals

    if (accepted) {
      onRevert(currentVersionId, versionData)
      onClose()
    }
  }, [onRevert, currentVersionId, versionData, onClose])
  const handleVersionChange = useCallback(
    newVersion => {
      setIsLoading(true);
      if (editorHistory.can().hideDiff()) {
        editorHistory.chain().hideDiff().run()
        setSelectedVersion(null)
      }
      setCurrentVersionId(newVersion)
      const version = versions.find(el => el.version === newVersion);
      setVersionName(version?.name || `Version ${newVersion}`);

      if (newVersion === 0) {
        // If the version is 0, show the content of version 0 and no diff
        // because there is no previous version
        provider.sendStateless(
          JSON.stringify({
            action: 'version.preview',
            version: newVersion,
          }),
        )
        return
      }

      editorHistory
        .chain()
        .compareVersions({
          toVersion: newVersion,
          fromVersion: newVersion - 1,
          /**
           * To add additional data to a user, we  can use this function to add context on a user
           * We've seen two approaches for this, a hash of the user's id mapping to a color
           * Or, to store the user's color preference in a separate field. For simplicity of this example, we just assign a random color
           */
          hydrateUserData: ({ userId }) => {
            if (!colorMapping.has(userId)) {
              colorMapping.set(userId, colors[(userId || '').length % colors.length])
            }

            return {
              /**
               * This will control the color of the changes made by the user
               * Flexibly allowing you to control the color of the text and background, or even by the type of change
               */
              color: {
                // This is the default color for the user
                color: '#000',
                backgroundColor: `${colorMapping.get(userId)}B0`,
                // Specifically color deletions as a lighter color
                delete: {
                  color: '#777',
                  backgroundColor: `${colorMapping.get(userId)}50`,
                },
              },
            }
          },
          onCompare: ctx => {
            if (ctx.error) {
              console.error(ctx.error)
              setErrorMessage(`An error occurred: ${String(ctx.error)}`)
              return
            }

            editorHistory.commands.showDiff(ctx.tr)

          },
        })
        .run()
    },
    [provider, editorHistory],
  )

  useEffect(() => {
    if (isOpen && currentVersionId === null && versions.length > 0) {
      const initialVersion = versions.at(-1).version
      console.log(inisialEnter);
      if (inisialEnter == true) {
        const version = versions[0];
        setVersionName(version?.name || `Version ${newVersion}`);
      }
      setCurrentVersionId(initialVersion)

      handleVersionChange(initialVersion)
    }

    if (!isOpen) {
      setCurrentVersionId(null)
    }
  }, [currentVersionId, versions, isOpen])

  useEffect(() => {
    if (isOpen) {
      const unbindContentWatcher = watchPreviewContent(provider, content => {
        if (editorHistory) {
          setIsLoading(false);
          editorHistory.commands.setContent(content)
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
    editorHistory.commands.clearContent()
  }, [onClose, editorHistory])


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
              {errorMessage}
              {isDiffing && (
                <div className="diff-users">
                  {Array.from(users).map(userId => (
                    <div key={userId} className="diff-user">
                      <span
                        className="diff-user-color"
                        style={{
                          backgroundColor: `${colorMapping.get(userId)}B0`,
                        }}
                      ></span>
                      {userId}
                    </div>
                  ))}
                </div>
              )}
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
                      isSelected={selectedVersion === v.version}
                    />
                  ))}
                </div>
                {editorHistory.can().hideDiff() && (
                  <div className="hint">
                    Comparing <span className="highlight">{versions.find(v => v.version === currentVersionId)?.name}</span> with{' '}
                    <span className="highlight">{versions.find(v => v.version === currentVersionId - 1)?.name}</span>
                  </div>
                )}
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
                  {/* <button
                    type="button"
                    onClick={() => {
                      editorHistory.chain().hideDiff().run()
                      handleClose()
                    }}
                  >
                    Close
                  </button>

                  <button
                    className="primary"
                    type="button"
                    disabled={!versions.length || currentVersionId === versions.at(-1).version}
                    onClick={() => {
                      // eslint-disable-next-line no-restricted-globals
                      const accepted = confirm(
                        'Are you sure you want to revert to this version? Any changes not versioned will be lost.',
                      )

                      if (!accepted) {
                        return
                      }
                      onRevert(currentVersionId)
                      handleClose()
                    }}
                  >
                    Restore
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Modal>
  )
});
VersioningModal.displayName = 'VersioningModal'