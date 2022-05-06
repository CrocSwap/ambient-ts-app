/******* Import React and Dongles *******/
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

/******* Import Local Files *******/
import './App.css';
import HamburgerMenuIcon from '../animations/hamburger-menu-icon';
import AmbientLogoIcon from '../animations/ambient-logo-icon';

// TODO: move this function to its own file later
function Simple() {
  const { rive, RiveComponent } = useRive({
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
      style={{ height: '500px' }}
      onClick={() => switchInput && switchInput.fire()}
    />
  );
}

/******* React Function *******/
export default function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <img src={logo} className='App-logo' alt='logo' /> */}
        <HamburgerMenuIcon />
        <AmbientLogoIcon />
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