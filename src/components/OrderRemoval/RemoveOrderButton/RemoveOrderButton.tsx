import Button from '../../Global/Button/Button';
import styles from './RemoveOrderButton.module.css';
interface IRemoveOrderButtonProps {
    removeFn: () => void;
    title: string;
    disabled?: boolean;
}

export default function RemoveOrderButton(props: IRemoveOrderButtonProps) {
    const { removeFn, title } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={title}
                disabled={props.disabled}
                action={removeFn}
                flat={true}
            />
        </div>
    );
}
