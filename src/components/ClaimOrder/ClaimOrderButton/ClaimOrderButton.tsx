import Button from '../../Global/Button/Button';
import styles from './ClaimOrderButton.module.css';
interface IClaimOrderButtonProps {
    claimFn: () => void;
    title: string;
    disabled?: boolean;
}

export default function ClaimOrderButton(props: IClaimOrderButtonProps) {
    const { claimFn, title } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={title}
                disabled={props.disabled}
                action={claimFn}
                flat={true}
            />
        </div>
    );
}
