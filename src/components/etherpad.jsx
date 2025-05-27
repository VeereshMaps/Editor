import React from 'react';

const EtherpadEmbed = () => {
  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <iframe
        title="Etherpad"
        src="http://localhost:9001/p/testpad?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default EtherpadEmbed;