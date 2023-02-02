import styles from './RepositionButton.module.css';
import Button from '../../../Global/Button/Button';

interface propsIF {
    onClickFn: () => void;
}

export default function RepositionButton(props: propsIF) {
    const { onClickFn } = props;
    // ----------------------------TEMPORARY DATA------------------------
    const repositionAllowed = true;
    // const onClickFn = () => console.log('clicked');
    const rangeButtonErrorMessage = 'Enter an amount';
    // ----------------------------TEMPORARY DATA------------------------

    return (
        <div className={styles.button_container}>
            <Button
                title={repositionAllowed ? 'Open Confirmation' : rangeButtonErrorMessage}
                action={onClickFn}
                disabled={!repositionAllowed}
                flat={true}
            />
        </div>
    );
}
