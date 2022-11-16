import styles from './EditButton.module.css';
import { useState } from 'react';
import Button from '../../../Global/Button/Button';

interface IEditButtonProps {
    onClickFn: () => void;
}
export default function EditButton(props: IEditButtonProps) {
    const [allowedButton] = useState<boolean>(true);

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={allowedButton ? 'Open Edit Confirmation' : 'Enter an amount'}
                action={props.onClickFn}
                disabled={!allowedButton}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
