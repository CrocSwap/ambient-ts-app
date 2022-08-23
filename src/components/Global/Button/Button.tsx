import styles from './Button.module.css';

interface ButtonPropsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
}

export default function Toggle(props: ButtonPropsIF) {
    const { disabled, action, title } = props;
    return (
        <button
            className={`${disabled ? styles.disabled_btn : styles.btn}`}
            onClick={action}
            disabled={disabled}
        >
            {title}
        </button>
    );
}
