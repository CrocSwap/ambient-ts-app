import { Outlet } from 'react-router-dom';
import styles from './Trade.module.css';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';
export default function Trade() {
    const [leftSidebar, setLeftSidebar] = useState<boolean>(true);
    const sidebarStyle = leftSidebar ? styles.main_layout : styles.main_layout2;

    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={sidebarStyle}>
                {/* <div className={styles.left_col}>
                    <div onClick={() => setLeftSidebar(!leftSidebar)}>
                        {leftSidebar ? (
                            <FaTimes size={20} color='#bdbdbd' />
                        ) : (
                            <FaArrowRight size={20} color='#bdbdbd' />
                        )}
                    </div>
                </div> */}
                <div className={styles.middle_col}></div>
                <div className={styles.right_col}></div>
            </main>
            <Outlet />
        </main>
    );
}
