import { CSSProperties } from 'react';
import styles from './OptionButton.module.css';

interface PropsIF {
    key?: string;
    ariaLabel?: string;
    style?: CSSProperties;
    onClick: (e?: any) => void;
    content: React.ReactNode;
}

export const OptionButton = (props: PropsIF) => {
    const { key, ariaLabel, onClick, style, content } = props;
    return (
        <button
            {...{ key }}
            className={styles.option_button}
            tabIndex={0}
            aria-label={ariaLabel}
            style={style}
            onClick={onClick}
        >
            {content}
        </button>
    );
};
