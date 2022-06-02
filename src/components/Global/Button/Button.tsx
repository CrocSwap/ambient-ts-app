import styles from './Button.module.css';

interface ButtonProps {
    disabled?: boolean;
    title: string;

    // action: React.MouseEventHandler<HTMLElement>;
    action: () => void;
}
export default function Toggle(props: ButtonProps) {
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
