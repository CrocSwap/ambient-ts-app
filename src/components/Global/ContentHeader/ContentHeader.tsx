import styles from './ContentHeader.module.css';

interface ContentProps {
    children: React.ReactNode;
}

export default function ContentHeader(props: ContentProps) {
    return <div className={styles.row}>{props.children}</div>;
}
