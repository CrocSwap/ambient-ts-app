import { CSSProperties } from 'react';
import styles from './FutaDivider.module.css';
interface FutaDivider2Props {
    style?: CSSProperties;
}

export default function FutaDivider2(props: FutaDivider2Props) {
    const { style } = props;
    return (
        <div className={styles.container} style={style}>
            <span className={styles.left} />
            <span className={styles.middle} />
            <span className={styles.right} />
        </div>
    );
}
