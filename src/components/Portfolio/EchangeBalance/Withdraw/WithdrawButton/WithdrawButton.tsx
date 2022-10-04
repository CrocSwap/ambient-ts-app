import styles from './WithdrawButton.module.css';
import { useState } from 'react';
import Button from '../../../../Global/Button/Button';

interface PortfolioWithdrawButtonProps {
    onClick: () => void;
}

export default function WithdrawButton(props: PortfolioWithdrawButtonProps) {
    const { onClick } = props;
    const [allowedButton] = useState<boolean>(true);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Withdraw' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={onClick}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
