import React, { useEffect, useRef } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import Scene from './components/Scene';
import UI from './components/UI';

// Inner App component that has access to context
const AppContent = () => {
  const { toggleDebugUI } = useEditor();
  const toggleDebugUIRef = useRef(toggleDebugUI);
  
  // Update ref when function changes
  useEffect(() => {
    toggleDebugUIRef.current = toggleDebugUI;
  }, [toggleDebugUI]);
  
  // Expose debugUI function globally
  useEffect(() => {
    // Make debugUI function available globally
    window.debugUI = () => {
      console.log('🎛️ Toggling Camera Debug UI...');
      toggleDebugUIRef.current();
    };
    
    // Help function
    window.debugHelp = () => {
      console.group('🔧 WebGL Cotizador - Debug Functions');
      console.log('📹 debugUI() - Toggle camera information panel');
      console.log('❓ debugHelp() - Show this help message');
      console.groupEnd();
    };
    
    // Show initial message
    console.group('🚀 WebGL Cotizador Ready!');
    console.log('📹 Call debugUI() to toggle camera information panel');
    console.log('❓ Call debugHelp() to see all available debug functions');
    console.groupEnd();
    
    // Cleanup on unmount
    return () => {
      delete window.debugUI;
      delete window.debugHelp;
    };
  }, []);
  
  return (
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
  );
};

// Main App component with provider
const App = () => {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  );
};

export default App;
