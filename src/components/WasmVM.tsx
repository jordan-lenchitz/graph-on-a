import React from 'react';

interface WasmVMProps {
  imagePath: string;
}

export const WasmVM: React.FC<WasmVMProps> = ({ imagePath }) => {
  return (
    <div className="wasm-vm-container" style={{ margin: '10px 0', border: '1px solid #444', background: '#000' }}>

      <div style={{ background: '#222', padding: '2px 10px', fontSize: '10px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
        <span>x86-to-wasm virtual machine (jit active)</span>
        <span>{imagePath}</span>
      </div>
      {/* 
          In a real production environment, we would use the v86 library directly.
          For this prototype, we'll embed the v86 player in an iframe, pointing to our custom image.
          We use a placeholder for now that demonstrates the intent.
      */}
      <iframe 
        src={`/vm/index.html?image=${encodeURIComponent(imagePath)}`}
        style={{ width: '100%', height: '400px', border: 'none' }}
        title="WASM VM"
      />
    </div>
  );
};
