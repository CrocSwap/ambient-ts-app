import CSSDebug from './CSSDebug';
import styles from './CSSModal.module.css';

interface propsIF {
    close: () => void;
    noSwap?: boolean;
}

export default function CSSModal(props: propsIF) {
    const { close, noSwap } = props;
    return (
        <div className={styles.css_modal}>
            <button onClick={close}>Close</button>
            <CSSDebug noSwap={noSwap} />
        </div>
    );
}