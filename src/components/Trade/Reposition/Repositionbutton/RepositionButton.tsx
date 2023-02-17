import styles from './RepositionButton.module.css';
import Button from '../../../Global/Button/Button';

interface propsIF {
    bypassConfirm: boolean;
    onClickFn: () => void;
    sendRepositionTransaction: () => void;
    isPositionInRange: boolean;
}

// TODO:   @Junior  please get rid of this file and move JSX into Reposition.tsx

export default function RepositionButton(props: propsIF) {
    const { isPositionInRange, bypassConfirm, onClickFn, sendRepositionTransaction } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    isPositionInRange
                        ? 'Position Currently In Range'
                        : bypassConfirm
                        ? 'Reposition'
                        : 'Open Confirmation'
                }
                action={bypassConfirm ? sendRepositionTransaction : onClickFn}
                disabled={isPositionInRange}
                flat={true}
            />
        </div>
    );
}
