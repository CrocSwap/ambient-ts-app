import styles from './SwapButton.module.css';
import { useEffect, useState } from 'react';
import Button from '../../Global/Button/Button';

interface SwapButtonProps {
    children: React.ReactNode;
}

export default function SwapButton() {
    const [allowedButton, setAllowedButton] = useState<boolean>(false);

    const sellQtya = document.getElementById('sell-quantity');
    console.log(sellQtya);

    // const sellQty = document.getElementById('sell-quantity')?.value;
    // function handleAllowedButton() {
    //   if (isNaN(sellQty) || sellQty === 0 || sellQty < 0) {
    //     setAllowedButton(false);
    //   } else {
    //     setAllowedButton(true);
    //   }
    // }
    // useEffect(() => {
    //   handleAllowedButton();
    // }, [sellQty]);
    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Swap' : 'Enter an amount'}
                action={() => console.log('clicked')}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
