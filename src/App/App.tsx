/******* Import React and Dongles *******/
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

/******* Import Local Files *******/
import './App.css';

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
        <Simple />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}