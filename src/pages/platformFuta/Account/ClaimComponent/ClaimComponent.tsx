import TooltipLabel from '../../../../components/Futa/TooltipLabel/TooltipLabel';
import HexReveal from '../../Home/Animations/HexReveal';
import styles from './ClaimComponent.module.css';

interface PropsIF {
    connectedAccountActive: boolean;
    isButtonDisabled: boolean;
    sendClaimAndReturnAllTransaction: () => Promise<void>;
    buttonText: string;
}
export default function ClaimComponent(props: PropsIF) {
    const {
        connectedAccountActive,
        isButtonDisabled,
        sendClaimAndReturnAllTransaction,
        buttonText,
    } = props;

    return (
        <div className={styles.rightLayout}>
            <HexReveal>
                <p className={styles.label}>CLAIM</p>
            </HexReveal>
            {connectedAccountActive && (
                <div className={styles.data_detail}>
                    <p className={styles.claimAllText}>
                        CLAIM ALL TOKENS FROM WINNING AUCTIONS AND UNUSED BIDS
                    </p>

                    <div className={styles.extraFeeContainer}>
                        <div className={styles.justifyRow}>
                            <TooltipLabel
                                itemTitle='NETWORK FEE'
                                tooltipTitle='NETWORK FEE PAID IN ORDER TO TRANSACT'
                            />
                            <p
                                style={{
                                    color: 'var(--text2)',
                                    fontSize: '14px',
                                }}
                            >
                                ~0.01
                            </p>
                        </div>
                    </div>
                    <button
                        id='futa_account_claim_all_button'
                        className={styles.claim_btn}
                        disabled={isButtonDisabled}
                        onClick={sendClaimAndReturnAllTransaction}
                    >
                        {buttonText.toUpperCase()}
                    </button>
                </div>
            )}
        </div>
    );
}
