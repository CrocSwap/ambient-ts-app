import styles from './TabComponent.module.css';

interface TabComponentProps {
    children: React.ReactNode;
}

export default function TabComponent(props: TabComponentProps) {
    return <div className={styles.row}>{props.children}</div>;
}
