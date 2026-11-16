import React, { useEffect, useRef, useState } from 'react';

interface WasmVMProps {
  imagePath: string;
  onExit?: () => void;
}

export const WasmVM: React.FC<WasmVMProps> = ({ imagePath, onExit }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onExitRef = useRef(onExit);
  const exitedRef = useRef(false);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (iframeRef.current?.contentWindow && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (event.data?.type === 'wasm-vm-exit' && !exitedRef.current) {
        exitedRef.current = true;
        setExited(true);
        onExitRef.current?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!exitedRef.current) {
        window.postMessage({
          type: 'wasm-vm-telemetry',
          stage: 'offline',
          ip: '0.0.0.0',
          gateway: null,
          cores: 0,
          ram: '0mb',
        }, '*');
      }
    };
  }, []);

  if (exited) {
    return null;
  }

  return (
    <div className="wasm-vm-container" style={{ margin: '10px 0', border: '1px solid #444', background: '#000' }}>

      <div style={{ background: '#222', padding: '2px 10px', fontSize: '10px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
        <span>x86-to-wasm virtual machine ({exited ? 'session exited' : 'just-in-time compilation active'})</span>
        <span>{imagePath}</span>
      </div>
      <iframe
        ref={iframeRef}
        src={`/vm/index.html?image=${encodeURIComponent(imagePath)}`}
        style={{ width: '100%', height: '600px', minHeight: '400px', resize: 'vertical', overflow: 'auto', border: 'none' }}
        title="WASM VM"
      />
    </div>
  );
};
