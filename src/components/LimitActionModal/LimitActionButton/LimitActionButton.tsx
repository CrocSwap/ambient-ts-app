import Button from '../../Global/Button/Button';
import styles from './LimitActionButton.module.css';
interface ILimitActionButtonProps {
    onClick: () => void;
    title: string;
    disabled?: boolean;
}

export default function RemoveOrderButton(props: ILimitActionButtonProps) {
    const { onClick, title, disabled } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={disabled ? '...' : title}
                disabled={disabled}
                action={onClick}
                flat={true}
            />
        </div>
    );
}
