import React, { useRef } from 'react';

const EtherpadEmbed = () => {
  const iframeRef = useRef(null);
   const goFullScreen = () => {
    const iframe = iframeRef.current;
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen(); 
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen(); 
    }
  };

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <button
          onClick={goFullScreen}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Fullscreen
        </button>
      </div>
      <iframe
       ref={iframeRef}
        title="Etherpad"
        src="https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf"
        style={{ width: '100%', height: '90vh', border: 'none' }}
        allow="fullscreen"  
      />
    </div>
  );
};

export default EtherpadEmbed;