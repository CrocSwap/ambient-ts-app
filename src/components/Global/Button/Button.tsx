import styles from './Button.module.css';

interface propsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
    flat?: boolean;
    customAriaLabel?: string;
}

export default function Toggle(props: propsIF) {
    const { disabled, action, title, flat, customAriaLabel } = props;

    const buttonTypeStyle = flat ? styles.btn_flat : styles.btn_gradient;
    return (
        <button
            className={`${disabled ? styles.disabled_btn : buttonTypeStyle} ${
                styles.btn
            }`}
            onClick={action}
            disabled={disabled}
            aria-label={customAriaLabel && customAriaLabel}
            tabIndex={0}
        >
            {title}
        </button>
    );
}
