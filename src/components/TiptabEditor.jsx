import '../styles/tiptap.css'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import Editor from './Editor.jsx'
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

const appId = '7j9y6m10';

const TiptapEditor = () => {
  const { editionId } = useParams();
  const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);

  const ydoc = useMemo(() => new Y.Doc(), [editionId]);

  const provider = useMemo(() => {
    if (!editionId || !documentToken) return null;

    return new TiptapCollabProvider({
      appId,
      name: editionId,
      document: ydoc,
      token: documentToken,
    });
  }, [editionId, ydoc, documentToken]);

  if (!provider) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="col-group">
      <Editor provider={provider} ydoc={ydoc} room={editionId} />
    </div>
  );
};

export default TiptapEditor;
