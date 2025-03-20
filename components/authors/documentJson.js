import React, { useRef, useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { Prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function DocumentDisplay({ documents }) {
  if (!documents || Object.keys(documents).length === 0) return null;
  const codeString = JSON.stringify(documents, null, 2);
  
  // Create a custom theme based on the tailwind color scale
  const customTailwindTheme = {
    ...Prism,
    'code[class*="language-"]': {
      color: '#334155', // slate-700 for text
      background: '#f9fafb', // gray-50 for background
    },
    'pre[class*="language-"]': {
      color: '#334155', // slate-700 for text
      background: '#f9fafb', // gray-50 for background
    },
    'comment': {
      color: '#9ca3af' // gray-400
    },
    'punctuation': {
      color: '#6b7280' // gray-500
    },
    'property': {
      color: '#ef4444' // red-500
    },
    'string': {
      color: '#f87171' // red-400
    },
    'operator': {
      color: '#4b5563' // gray-600
    },
    'keyword': {
      color: '#f43f5e' // rose-500
    },
    'function': {
      color: '#6b7280' // gray-500
    },
  };

  // Custom styles for the syntax highlighter
  const customStyle = {
    maxHeight: '50vh',  // Use viewport height instead of fixed pixels
    overflow: 'auto',   // Enable scrolling
    borderRadius: '0.2rem',
    margin: '0',
  };

  return (
    <div className="rounded-lg border border-gray-300 p-1 bg-gray-50 h-full">
      <SyntaxHighlighter 
        language="json" 
        style={customTailwindTheme} 
        customStyle={customStyle}
        className="text-xs"
        wrapLongLines={true}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}