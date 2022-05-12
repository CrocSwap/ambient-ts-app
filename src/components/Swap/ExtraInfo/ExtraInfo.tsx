import styles from 'ExtraInfo.module.css';

interface ExtraInfoProps {
    children: React.ReactNode;
}

export default function ExtraInfo(props: ExtraInfoProps) {
    return <div className={styles.row}>{props.children}</div>;
}
