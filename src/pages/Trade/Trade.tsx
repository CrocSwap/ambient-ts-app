import { Outlet } from 'react-router-dom';
import styles from './Trade.module.css';
import MainLayout from '../../components/MainLayout/MainLayout';

export default function Trade() {
    return (
        <main data-testid={'trade'}>
            {/* <h1>This is Trade.tsx</h1> */}
            <MainLayout>
                <div className={styles.left_col}>I am first</div>
                <div className={styles.middle_col}>I am first</div>
                <div className={styles.right_col}>I am first</div>
            </MainLayout>
            <Outlet />
        </main>
    );
}
