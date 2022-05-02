import React from 'react';
// import logo from './logo.svg';
import './App.css';

import Rive from '@rive-app/react-canvas';

export const Simple = () => (
  // <Rive src='./new_file.riv' />
  // <Rive src='https://cdn.rive.app/animations/off_road_car_v7.riv' />
  <Rive src='ambient.riv' />
  // <Rive src='off_road_car_v7.riv' />
);

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <img src={logo} className='App-logo' alt='logo' /> */}
        <Simple />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
