// import '../styles/tiptap.css'
// import { TiptapCollabProvider } from '@hocuspocus/provider'
// import * as Y from 'yjs'
// import Editor from './Editor.jsx'
// import { useParams } from 'react-router';
// import { useSelector } from 'react-redux';
// import { useEffect, useMemo } from 'react';

// // const appId = '8mzjy21k';
// // const appId = '6kpvqylk';
// const appId = '89jew2ek';
// ;

// const TiptapEditor = () => {
//   const { editionId } = useParams();
//   const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);

//   const ydoc = useMemo(() => new Y.Doc(), [editionId]);

//   const provider = useMemo(() => {
//     if (!editionId || !documentToken) return null;

//     return new TiptapCollabProvider({
//       appId,
//       name: editionId,
//       document: ydoc,
//       token: documentToken,
//       // token: "281fbfb283dd31ec817b7592e15edbbde1f62898a571beab8d71251236c130ec",
//     });
//   }, [editionId, ydoc, documentToken]);
//   // useEffect(() => {
//     console.log("🔍 editionId:", editionId);
//     console.log("🔐 documentToken:", documentToken);
//     console.log("🏷️ appId:", appId);
//     console.log("@## ydoc instance:", ydoc);

//     if (!provider) {
//       console.warn("⚠️ Provider not initialized — missing token or editionId?");
//       return;
//     }

//     console.log("@## provider object:", provider);

//     provider.on("status", (event) => {
//       console.log("🔌 Provider status:", event.status); // 'connected' or 'disconnected'
//     });

//     provider.on("sync", (isSynced) => {
//       console.log("📡 Sync status:", isSynced);
//     });

//     provider.awareness.on("update", () => {
//       console.log("👥 Awareness update:", provider.awareness.getStates());
//     });

//     provider.on("error", (error) => {
//       console.error("🔥 Provider error event:", error);
//     });

//     // Optional: catch unhandled promise rejections globally
//     window.addEventListener("unhandledrejection", (event) => {
//       console.error("💥 Unhandled Promise Rejection:", event.reason);
//     });
//     provider.on('authenticationFailed', ({ reason }) => {
//       console.error('Authentication failed:', reason)
//       requestUserReauthentication()
//     })

//     // // Cleanup on unmount
//     // return () => {
//     //   provider.destroy?.();
//     // };
//   // }, [provider, editionId, documentToken]);

//   if (!provider) {
//     return <div>Loading editor...</div>;
//   }

//   return (
//     <div className="col-group">
//       <Editor provider={provider} ydoc={ydoc} room={editionId} />
//     </div>
//   );
// };

// export default TiptapEditor;


import '../styles/tiptap.css'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'
import Editor from './Editor.jsx'
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { SignJWT } from 'jose';
import { CircularProgress, Box, Typography } from "@mui/material";
import NewEditorComponent from './tiptapEditor/NewEditor';

// const appId = '8mzjy21k';
// const appId = '6kpvqylk';
const appId = '89jew2ek';
// const appId = '7j9y6m10';
const secret = '281fbfb283dd31ec817b7592e15edbbde1f62898a571beab8d71251236c130ec';
  
const TiptapEditor = () => {
  const { editionId } = useParams();
  const { contentAIToken, documentToken } = useSelector((state) => state.tiptapToken);
  const loginDetails = useSelector((state) => state.auth);

  const ydoc = useMemo(() => new Y.Doc(), [editionId]);

  const [jwt1, setJwt1] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing editor...");

  // 🔐 JWT Generation
  useEffect(() => {
      if (!secret || !editionId || !loginDetails?.user?._id) return;

      const generateJWT = async () => {
          setStatusMessage("Generating access token...");

          const encodedSecret = new TextEncoder().encode(secret);

          const token = await new SignJWT({
              allowedDocumentNames: [editionId],
              sub: loginDetails.user._id,
          })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .sign(encodedSecret);

          setJwt1(token);
      };

      generateJWT();
  }, [secret, editionId, loginDetails?.user?._id]);

  // 🔌 Provider Initialization
  useEffect(() => {
      if (!editionId || !jwt1) return;

      setStatusMessage("Connecting to collaborative provider...");

      const newProvider = new TiptapCollabProvider({
          appId,
          name: editionId,
          document: ydoc,
          token: jwt1,
      });

      setProvider(newProvider);

      newProvider.on("status", (event) => {
          console.log("🔌 Provider status:", event.status);
          if (event.status === "connected") {
              setIsConnected(true);
          } else {
              setIsConnected(false);
              setStatusMessage(`Connection status: ${event.status}`);
          }
      });

      newProvider.on("error", (error) => {
          console.error("🔥 Provider error:", error);
          setStatusMessage("Error connecting to provider.");
      });

      newProvider.awareness.on("update", () => {
          console.log("👥 Awareness update:", newProvider.awareness.getStates());
      });

      return () => {
          newProvider.destroy();
      };
  }, [editionId, jwt1, ydoc]);

  // 🌐 Unhandled Promise
  useEffect(() => {
      const handleRejection = (event) => {
          console.error("💥 Unhandled Promise Rejection:", event.reason);
      };

      window.addEventListener("unhandledrejection", handleRejection);
      return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  // ⏳ Loader until connected
  if (!provider || !isConnected) {
      return (
          <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="80vh"
              gap={2}
          >
              <CircularProgress />
              <Typography variant="body1" color="text.secondary">
                  {statusMessage}
              </Typography>
          </Box>
      );
  }

  // ✅ Editor Ready
  return (
      <div className="col-group">
          {/* <Editor provider={provider} ydoc={ydoc} room={editionId} /> */}
          <NewEditorComponent provider={provider} ydoc={ydoc} room={editionId} />
      </div>
  );
};

export default TiptapEditor;
 
