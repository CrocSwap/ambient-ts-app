import FutaDivider2 from '../../../../components/Futa/Divider/FutaDivider2';
import TooltipLabel from '../../../../components/Futa/TooltipLabel/TooltipLabel';
import HexReveal from '../../Home/Animations/HexReveal';
import styles from './ClaimComponent.module.css';
import { motion, AnimatePresence } from 'framer-motion';

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
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.rightLayout}
            >
                <p className={styles.label}>
                    <HexReveal>CLAIM</HexReveal>
                    <FutaDivider2 style={{ margin: '0 -4px' }} />
                </p>
                {connectedAccountActive && (
                    <div className={styles.data_detail}>
                        <p className={styles.claimAllText}>
                            CLAIM ALL TOKENS FROM WINNING AUCTIONS AND UNUSED
                            BIDS
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
            </motion.div>
        </AnimatePresence>
    );
}
