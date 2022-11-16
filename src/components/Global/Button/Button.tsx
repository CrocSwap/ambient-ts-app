import styles from './Button.module.css';

interface ButtonPropsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
    flat?: boolean;
}

export default function Toggle(props: ButtonPropsIF) {
    const { disabled, action, title, flat } = props;

    const buttonTypeStyle = flat ? styles.btn_flat : styles.btn_gradient;
    return (
        <button
            className={`${disabled ? styles.disabled_btn : buttonTypeStyle} ${styles.btn}`}
            onClick={action}
            disabled={disabled}
        >
            {title}
        </button>
    );
}
