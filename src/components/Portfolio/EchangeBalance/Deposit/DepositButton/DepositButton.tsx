import styles from './DepositButton.module.css';
import Button from '../../../../Global/Button/Button';

interface PortfolioDepositButtonProps {
    onClick: () => void;
    disabled: boolean;
    buttonMessage: string;
}

export default function DepositButton(props: PortfolioDepositButtonProps) {
    const { onClick, disabled, buttonMessage } = props;

    const ButtonDisplay = (
        <div
            className={
                disabled
                    ? styles.button_container_disabled
                    : styles.button_container
            }
        >
            <Button
                title={buttonMessage}
                action={onClick}
                disabled={disabled}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
