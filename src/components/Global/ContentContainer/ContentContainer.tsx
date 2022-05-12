import styles from 'ContentContainer.module.css';

interface ContentContainerProps {
    children: React.ReactNode;
}

export default function ContentContainer(props: ContentContainerProps) {
    return <div className={styles.row}>{props.children}</div>;
}
