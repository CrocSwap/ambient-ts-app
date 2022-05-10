/** ***** START: Import React and Dongles *******/
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
/** ***** END: Import Local Files *********/

export default function PageHeader() {
  return (
    <header data-testid={'page-header'}>
      <h1>This is the Page Header!</h1>
      <h3>PageHeader.tsx</h3>
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/trade'>Trade</Link>
        <Link to='/analytics'>Analytics</Link>
        <Link to='/portfolio'>Portfolio</Link>
      </nav>
    </header>
  );
}
