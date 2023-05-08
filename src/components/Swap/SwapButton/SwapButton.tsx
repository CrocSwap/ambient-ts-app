import styles from './SwapButton.module.css';
import Button from '../../Global/Button/Button';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';

interface propsIF {
    onClickFn: () => void;
    swapAllowed: boolean;
    swapButtonErrorMessage: string;
    bypassConfirmSwap: skipConfirmIF;
    areBothAckd: boolean;
}

export default function SwapButton(props: propsIF) {
    const {
        bypassConfirmSwap,
        swapAllowed,
        swapButtonErrorMessage,
        onClickFn,
        areBothAckd,
    } = props;

    return (
        <div className={styles.button_container}>
            <Button
                title={
                    areBothAckd
                        ? bypassConfirmSwap.isEnabled
                            ? swapAllowed
                                ? 'Submit Swap'
                                : swapButtonErrorMessage
                            : swapAllowed
                            ? bypassConfirmSwap.isEnabled
                                ? 'Submit Swap'
                                : 'Open Confirmation'
                            : swapButtonErrorMessage
                        : 'Acknowledge'
                }
                action={onClickFn}
                disabled={!swapAllowed && areBothAckd}
                flat
            />
        </div>
    );
}
