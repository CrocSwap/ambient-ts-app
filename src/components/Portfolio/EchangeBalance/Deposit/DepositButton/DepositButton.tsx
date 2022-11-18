import styles from './DepositButton.module.css';
import Button from '../../../../Global/Button/Button';

interface PortfolioDepositButtonProps {
    onClick: () => void;
    disabled: boolean;
    buttonMessage: string;
}

export default function DepositButton(props: PortfolioDepositButtonProps) {
    const { onClick, disabled, buttonMessage } = props;

    const ButtonDisplay = (
        <div className={styles.button_container}>
            <Button
                title={buttonMessage}
                // action={() => console.log('clicked')}
                action={onClick}
                disabled={disabled}
                flat={true}
            />
        </div>
    );

    return <div>{ButtonDisplay}</div>;
}
