/******* Import Local Files *******/
import './App.css';
import HamburgerMenuIcon from '../animations/hamburger-menu-icon';
import AmbientLogoIcon from '../animations/ambient-logo-icon';

/******* React Function *******/
export default function App() {
  return (
    <div className='App'>
      <header className='App-header'>
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