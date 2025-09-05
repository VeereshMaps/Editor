import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import {
  memo, useCallback, useEffect, useMemo, useRef, useState,
} from 'react'
import React from 'react'
import { VersionItem } from './VersionItem'
import { CircularProgress } from '@mui/material'
import { useUser } from 'components/hooks/useUser'
import "../../../styles/tiptap.css";
import "../../../styles/version-histoty.scss";

import { watchPreviewContent } from '@tiptap-pro/extension-snapshot'
import StarterKit from '@tiptap/starter-kit'
import { SnapshotCompare } from '@tiptap-pro/extension-snapshot-compare'
import { CommenTipTapExtensions } from '../tiptapExtensions'
const getVersionName = version => {
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
  console.log(isOpen, onClose, onRevert, provider);
  console.log(versions);
  const [isLoading, setIsLoading] = useState(false);
  const [versionName, setVersionName] = useState(null);
  const [inisialEnter, setIsInitial] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const user = useUser();
  const currentUserRef = useRef(user);
  if (!colorMapping.has(user._id)) {
    colorMapping.set(user._id, colors[(user._id || '').length % colors.length])
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
  // const editorHistory = editor;
  const editorHistory = useEditor({
    editable: false,
    immediatelyRender: true,
    content: '',
    extensions: [
      StarterKit.configure({ history: false }),
      ...CommenTipTapExtensions(),
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
                // backgroundColor: `${colorMapping.get(userId)}B0`,
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
        const newVersion = version?.version || 0;
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
    <div style={{ display: 'flex' }} >
      <div style={{ width: '100%' }}> <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      </div>
        <div className=' col-group-history'>
          <div className="main_history">
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
              {editorHistory.can().hideDiff() && (
                <div className="hint">
                  Comparing <span className="highlight">{versions.find(v => v.version === currentVersionId)?.name}</span> with{' '}
                  <span className="highlight">{versions.find(v => v.version === currentVersionId - 1)?.name}</span>
                </div>
              )}
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

              <div className="button-group">
                <button
                  className="primary"
                  style={cancelButtonStyle}
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
});
VersioningModal.displayName = 'VersioningModal'