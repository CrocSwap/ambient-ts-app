import styles from './MainLayout.module.css';
import { useState } from 'react';

type Props = {
    children?: React.ReactNode;
};
export default function MainLayout({ children }: Props) {
    const [leftSidebar, setLeftSidebar] = useState<boolean>(true);
    return (
        <main data-testid={'main-layout'} className={styles.main_layout}>
            {children}
        </main>
    );
}
