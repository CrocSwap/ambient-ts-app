import CSSDebug from './CSSDebug';
import styles from './CSSModal.module.css';

interface propsIF {
    noSwap?: boolean;
}

export default function CSSModal(props: propsIF) {
    const { noSwap } = props;
    return (
        <div className={styles.css_modal}>
            <CSSDebug noSwap={noSwap} />
        </div>
    );
}