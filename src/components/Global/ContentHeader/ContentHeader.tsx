import { ReactNode } from 'react';
import styles from './ContentHeader.module.css';

interface ContentPropsIF {
    children: ReactNode;
}

export default function ContentHeader(props: ContentPropsIF) {
    const { children } = props;
    return <div className={styles.content_header}>{children}</div>;
}
