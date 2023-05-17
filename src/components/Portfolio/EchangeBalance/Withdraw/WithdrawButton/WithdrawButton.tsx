import styles from './WithdrawButton.module.css';
import Button from '../../../../Global/Button/Button';
import { memo } from 'react';

interface PortfolioWithdrawButtonProps {
    onClick: () => void;
    disabled: boolean;
    buttonMessage: string;
}
function WithdrawButton(props: PortfolioWithdrawButtonProps) {
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

export default memo(WithdrawButton);
