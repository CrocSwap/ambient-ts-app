import styles from './SwapButton.module.css';
import { useState } from 'react';
import Button from '../../Global/Button/Button';

interface ISwapButtonProps {
    onClickFn: () => void;
}

export default function SwapButton(props: ISwapButtonProps) {
    const [allowedButton] = useState<boolean>(false);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Swap' : 'Enter an amount'}
                // action={() => console.log('clicked')}
                action={props.onClickFn}
                disabled={allowedButton}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
