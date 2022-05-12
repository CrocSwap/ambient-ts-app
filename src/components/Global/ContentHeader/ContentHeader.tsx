import styles from './ContentHeader.module.css';

interface ContentProps {
    children: React.ReactNode;
}

export default function ContentHeader(props: ContentProps) {
    return <div className={styles.content_header}>{props.children}</div>;
}
