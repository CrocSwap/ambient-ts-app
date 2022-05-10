/** ***** START: Import React and Dongles *******/
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { useRive, useStateMachineInput } from 'rive-react';
/** ***** END: Import Local Files *********/

export default function PageHeader() {
  // rive component
  const STATE_MACHINE_NAME = 'Basic State Machine';
  const INPUT_NAME = 'Switch';

  const { rive, RiveComponent } = useRive({
    src: './hamburger.riv',
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
  });

  const onClickInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

  // end of rive component

  // Page Header states
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);

  // End of Page Header States

  return (
    <header data-testid={'page-header'} className={styles.primary_header}>
      <div className={styles.logo_container}>
        <h1>ambient</h1>
      </div>
      <div
        className={styles.mobile_nav_toggle}
        aria-controls='primary_navigation'
        aria-expanded='false'
      >
        <RiveComponent onClick={() => onClickInput?.fire()} />
        <span className='sr-only'>Menu</span>
      </div>
      <nav className={styles.primary_navigation} id='primary_navigation'>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/trade'>Trade</NavLink>
        <NavLink to='/analytics'>Analytics</NavLink>
        <NavLink to='/portfolio'>Portfolio</NavLink>
      </nav>
    </header>
  );
}
