import '../styles/tiptap.css'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import CollabEditor from './CollabEditor';

const appId = '7j9y6m10';

const ProofReaderEditorProvider = () => {
    const { editionId } = useParams();
    const { documentToken } = useSelector((state) => state.tiptapToken);

    const ydoc = useMemo(() => new Y.Doc(), [editionId]);

    const provider = useMemo(() => {
        if (!editionId || !documentToken) return null;
        return new TiptapCollabProvider({
            appId,
            name: editionId+"Final",
            document: ydoc,
            token: documentToken,
        });
    }, [editionId, ydoc, documentToken]);

    if (!provider) {
        return <div>Loading editor...</div>;
    }
    return (
        <div >
            <CollabEditor provider={provider} ydoc={ydoc} room={editionId} APP_ID={appId} />
        </div>
    );
};

export default ProofReaderEditorProvider;