import styles from './SwapButton.module.css';
import { useEffect, useState } from 'react';
import Button from '../../Global/Button/Button';

// interface SwapButtonProps {
//     children: React.ReactNode;
// }

export default function SwapButton() {
    const [allowedButton, setAllowedButton] = useState<boolean>(false);

    const inputValue = document.getElementById('sell-quantity') as HTMLInputElement;
    console.log(inputValue);
    const sellQty = parseInt(inputValue?.value);

    // function handleAllowedButton() {
    //   if (isNaN(sellQty) || sellQty === 0 || sellQty < 0) {
    //     setAllowedButton(false);
    //   } else {
    //     setAllowedButton(true);
    //   }
    // }
    // useEffect(() => {
    //     handleAllowedButton();
    //     console.log(inputValue)
    //     console.log(allowedButton)
    // }, [inputValue]);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Swap' : 'Enter an amount'}
                action={() => console.log('clicked')}
                disabled={allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
