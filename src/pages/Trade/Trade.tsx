import { Outlet } from 'react-router-dom';
import styles from './Trade.module.css';

export default function Trade() {
    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={styles.main_layout}>
                {/* <div className={styles.left_col}>
                    <div onClick={() => setLeftSidebar(!leftSidebar)}>
                        {leftSidebar ? (
                            <FaTimes size={20} color='#bdbdbd' />
                        ) : (
                            <FaArrowRight size={20} color='#bdbdbd' />
                        )}
                    </div>
                </div> */}
                <div className={styles.middle_col}>
                    I AM THE MAIN LAYOUT AND I WORK JUST FINE. WHAT IS YOUR PROSO SOFJSOIFJSOIFJSFOS
                    JSOIFJSOIFJSOIFJ SOI FJSIOF JSOIFJS OIF JSOIF JSIOJOFJSOI JFSOJF SOF
                </div>
                <div className={styles.right_col}></div>
            </main>
            <Outlet />
        </main>
    );
}
