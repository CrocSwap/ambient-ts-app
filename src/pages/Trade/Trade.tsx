import { Outlet } from 'react-router-dom';
import styles from './Trade.module.css';

export default function Trade() {
    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <main className={styles.main_layout}>
                <div className={styles.middle_col}>
                    <h1>THIS IS GRAPH COMPONENT</h1>
                </div>
                <div className={styles.right_col}>
                    <h1></h1>
                </div>
            </main>
            <Outlet />
        </main>
    );
}
