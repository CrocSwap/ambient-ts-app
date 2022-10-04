import styles from './DepositButton.module.css';
import { useState } from 'react';
import Button from '../../../../Global/Button/Button';

interface PortfolioDepositButtonProps {
    onClick: () => void;
}

export default function DepositButton(props: PortfolioDepositButtonProps) {
    const { onClick } = props;

    const [allowedButton] = useState<boolean>(true);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Deposit' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={onClick}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
