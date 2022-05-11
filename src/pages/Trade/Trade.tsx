import { Outlet } from 'react-router-dom';
import styles from './Trade.module.css';
import MainLayout from '../../components/MainLayout/MainLayout';
import { FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function Trade() {
    const [leftSidebar, setLeftSidebar] = useState<boolean>(true);

    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={styles.main_layout}>
                <div className={styles.left_col}>
                    <FaTimes size={20} color='#bdbdbd' />
                </div>
                <div className={styles.middle_col}></div>
                <div className={styles.right_col}></div>
            </main>
            <Outlet />
        </main>
    );
}
