import styles from './Sidebar.module.css';

interface SidebarProps {
    children: React.ReactNode;
}

export default function Sidebar(props: SidebarProps) {
    return <div className={styles.Sidebar}>{props.children}</div>;
}
