import React, { useState } from 'react';
import { calculate_sha257sum } from '../utils/sha257';

interface QuineCodeBlockProps {
  summary: React.ReactNode;
  snippet: string;
  rawSource?: string;
  rawFilename?: string;
  color?: string;
  className?: string;
}

export const QuineCodeBlock: React.FC<QuineCodeBlockProps> = ({
  summary,
  snippet,
  rawSource,
  rawFilename,
  color = '#00ff00',
  className = '',
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const activeCode = showRaw && rawSource ? rawSource : snippet;
  const lineCount = activeCode.split('\n').length;
  const byteCount = new TextEncoder().encode(activeCode).length;

  const handleComputeHash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHashing(true);
    try {
      const digest = await calculate_sha257sum(activeCode);
      setHash(digest);
    } finally {
      setIsHashing(false);
    }
  };

  const handleToggleRaw = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRaw(prev => !prev);
    setHash(null);
  };

  return (
    <details
      className={`mt-2 text-small p-2 quine-details ${className}`}
      style={{
        border: `1px dashed ${color}`,
        color,
        marginTop: '10px',
      }}
    >
      <summary style={{ cursor: 'pointer', opacity: 0.85, userSelect: 'none' }}>
        {summary}
      </summary>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          paddingBottom: '6px',
          borderBottom: `1px dotted ${color}`,
          fontSize: '0.75em',
        }}
      >
        <span>
          {showRaw && rawFilename ? `quine://live/${rawFilename}` : 'quine://runtime/snippet'}{' '}
          ({lineCount}l · {byteCount}b)
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {rawSource && (
            <button
              type="button"
              onClick={handleToggleRaw}
              style={{
                background: showRaw ? color : 'transparent',
                color: showRaw ? '#000' : color,
                border: `1px solid ${color}`,
                padding: '1px 6px',
                fontFamily: 'monospace',
                fontSize: '1em',
                cursor: 'pointer',
                textTransform: 'lowercase',
              }}
            >
              {showRaw ? '[view snippet]' : '[live ?raw quine]'}
            </button>
          )}
          <button
            type="button"
            onClick={handleComputeHash}
            disabled={isHashing}
            style={{
              background: 'transparent',
              color,
              border: `1px solid ${color}`,
              padding: '1px 6px',
              fontFamily: 'monospace',
              fontSize: '1em',
              cursor: 'pointer',
              textTransform: 'lowercase',
            }}
          >
            {isHashing ? '[hashing...]' : '[sha257sum]'}
          </button>
        </div>
      </div>

      {hash && (
        <div
          style={{
            fontSize: '0.7em',
            marginTop: '6px',
            padding: '4px 6px',
            background: '#050505',
            borderLeft: `2px solid ${color}`,
            wordBreak: 'break-all',
            textAlign: 'left',
          }}
        >
          sha257sum (35-round): {hash}
        </div>
      )}

      <pre
        style={{
          wordBreak: 'break-all',
          fontSize: '0.8em',
          marginTop: '8px',
          marginBottom: 0,
          color,
          background: '#000',
          padding: '10px',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
          maxHeight: '260px',
          overflowY: 'auto',
        }}
      >
        {activeCode}
      </pre>
    </details>
  );
};
