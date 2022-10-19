import Button from '../../Global/Button/Button';
import styles from './ClaimOrderButton.module.css';
interface IClaimOrderButtonProps {
    removeFn: () => void;

    title: string;

    disabled?: boolean;
}

export default function ClaimOrderButton(props: IClaimOrderButtonProps) {
    const { removeFn, title } = props;

    return (
        <div className={styles.button_container}>
            <Button title={title} disabled={props.disabled} action={removeFn} />
        </div>
    );
}
