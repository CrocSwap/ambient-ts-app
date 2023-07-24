import { CSSProperties, SyntheticEvent } from 'react';
import styles from './OptionButton.module.css';

interface PropsIF {
    key?: string;
    ariaLabel?: string;
    selected?: boolean;
    onClick: () => void;
    content: React.ReactNode;
}

export const OptionButton = (props: PropsIF) => {
    const { key, ariaLabel, selected, onClick, content } = props;
    return (
        <button
            {...{ key }}
            className={`${styles.option_button} ${selected && styles.selected}`}
            tabIndex={0}
            aria-label={ariaLabel}
            onClick={onClick}
        >
            {content}
        </button>
    );
};
