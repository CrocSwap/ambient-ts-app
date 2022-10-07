import styles from './WithdrawButton.module.css';
import Button from '../../../../Global/Button/Button';

interface PortfolioWithdrawButtonProps {
    onClick: () => void;
    disabled: boolean;
    buttonMessage: string;
}

export default function WithdrawButton(props: PortfolioWithdrawButtonProps) {
    const { onClick, disabled, buttonMessage } = props;

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={buttonMessage}
                // action={() => console.log('clicked')}
                action={onClick}
                disabled={disabled}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
