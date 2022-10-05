import styles from './TransferButton.module.css';
import { useState } from 'react';
import Button from '../../../../Global/Button/Button';

interface PortfolioTransferButtonProps {
    onClick: () => void;
}

export default function TransferButton(props: PortfolioTransferButtonProps) {
    const { onClick } = props;
    const [allowedButton] = useState<boolean>(true);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Transfer' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={onClick}
                disabled={!allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
