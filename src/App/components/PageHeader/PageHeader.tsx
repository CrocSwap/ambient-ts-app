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
    <header data-testid={'page-header'} className={styles.primary_header}>
      <div className={styles.logo_container}>
        <h1>ambient</h1>
      </div>
      <nav>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/trade'>Trade</NavLink>
        <NavLink to='/analytics'>Analytics</NavLink>
        <NavLink to='/portfolio'>Portfolio</NavLink>
      </nav>
    </header>
  );
}
