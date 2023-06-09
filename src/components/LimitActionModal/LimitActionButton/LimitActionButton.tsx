import Button from '../../Global/Button/Button';
import styles from './LimitActionButton.module.css';
interface ILimitActionButtonProps {
    onClick: () => void;
    title: string;
    disabled?: boolean;
}

export default function LimitActionButton(props: ILimitActionButtonProps) {
    const { onClick, title } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={title}
                disabled={props.disabled}
                action={onClick}
                flat={true}
            />
        </div>
    );
}
