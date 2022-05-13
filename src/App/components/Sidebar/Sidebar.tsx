import styles from './Sidebar.module.css';

interface SidebarProps {
    children?: React.ReactNode;
}

export default function Sidebar(props: SidebarProps) {
    return (
        <div className={styles.sidebar_container}>
            <div className={styles.sidebar_content}></div>
            {props.children}
        </div>
    );
}
