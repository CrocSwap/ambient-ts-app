import styles from './MainLayout.module.css';

type Props = {
    children?: React.ReactNode;
};
export default function MainLayout({ children }: Props) {
    return (
        <main data-testid={'main-layout'} className={styles.main_layout}>
            {children}
        </main>
    );
}
