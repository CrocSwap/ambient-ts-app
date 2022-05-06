import React from 'react';
// import logo from './logo.svg';
import './App.css';

import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

function Simple() {
  const { rive, RiveComponent } = useRive({
    // src: 'https://cdn.rive.app/animations/vehicles.riv',
    src: 'hamburger.riv',
    stateMachines: 'Basic State Machine',
    autoplay: true,
  });

  const switchInput = useStateMachineInput(
    rive,
    'Basic State Machine',
    'Switch'
  );

  return (
    <RiveComponent
      style={{ height: '50px' }}
      onClick={() => switchInput && switchInput.fire()}
    />
  );
}

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <img src={logo} className='App-logo' alt='logo' /> */}
        <Simple />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
