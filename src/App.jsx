import React from 'react';
import { EditorProvider } from './context/EditorContext';
import Scene from './components/Scene';
import UI from './components/UI';

const App = () => {
  return (
    <EditorProvider>
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative',
        background: '#1a1a1a'
      }}>
        {/* 3D Scene */}
        <Scene />
        
        {/* UI Overlay */}
        <UI />
      </div>
    </EditorProvider>
  );
};

export default App;
