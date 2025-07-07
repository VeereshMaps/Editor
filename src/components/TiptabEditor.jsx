
import '../styles/tiptap.css'

import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

import Editor from './Editor.jsx'
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

const appId = '7j9y6m10';
// const appId = 'yko835w9';
const ydocA = new Y.Doc()
const TiptapEditor = () => {
    const { editionId } = useParams();
    const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
    console.log("@#$#$editionId " + editionId);

    const providerA = new TiptapCollabProvider({
        appId,
        name: editionId,
        document: ydocA,
        // token: documentToken
    })
    return (
        <div className="col-group">
            <Editor provider={providerA} ydoc={ydocA} room={editionId} />
        </div>
    )
}
export default TiptapEditor;