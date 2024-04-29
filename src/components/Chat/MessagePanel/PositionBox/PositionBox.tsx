/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { trimString } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import styles from './PositionBox.module.css';
import { motion } from 'framer-motion';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { getTxSummary } from '../../../../ambient-utils/dataLayer/functions/findTransactionData';
import { TxPosition } from '../InputBox/MessageInput';

interface propsIF {
    message: string;
    isInput: boolean;
    isPosition: boolean;
    setIsPosition: Dispatch<SetStateAction<boolean>>;
    walletExplorer: any;
    isCurrentUser?: boolean;
    showAvatar?: boolean;
    setTxPositionSummary?: Dispatch<SetStateAction<TxPosition>>;
    txPositionSummary?: TxPosition;
}

type TransactionData = {
    txHash: string | undefined;
    entityType: string;
    tx: TransactionIF;
    poolSymbolsDisplay: string;
};
export default function PositionBox(props: propsIF) {
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPoolPriceChangePositive] = useState<boolean>(false);
    const message = props.message;
    const isInput = props.isInput;
    const [txSummary, setTxSummary] = useState<TransactionData | null>(null);
    const { isDenomBase } = useContext(TradeDataContext);
    const { positionsByPool, transactionsByPool } =
        useContext(GraphDataContext);

    const transactionsData = transactionsByPool.changes;
    const positionData = positionsByPool.positions;

    const posFingerprint = positionData.map((pos) => pos.positionId).join('|');
    const txFingerprint = transactionsData.map((tx) => tx.txHash).join('|');

    const { transactionsByUser, userTransactionsByPool } =
        useContext(GraphDataContext);

    useEffect(() => {
        if (message.includes('0x') && props.isInput) {
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            (async () => {
                console.log('txFingerPoint:', hashMsg);
                const txSummaryData = await getTxSummary(
                    hashMsg,
                    transactionsByUser.changes,
                    userTransactionsByPool.changes,
                    transactionsByPool.changes,
                );
                console.log({ txSummaryData });
                if (props.setTxPositionSummary) {
                    props.setTxPositionSummary({
                        poolsByDisplay: txSummaryData?.poolSymbolsDisplay || '',
                        txHash: txSummaryData?.txHash || '',
                        sideType: txSummaryData?.entityType || '',
                        price:
                            txSummaryData?.tx.bidTickInvPriceDecimalCorrected?.toFixed(
                                2,
                            ) || '',
                    });
                }
                setTxSummary(txSummaryData ?? null);
                if (txSummary !== undefined) {
                    props.setIsPosition(true);
                }
            })();
        }
    }, [message, posFingerprint, txFingerprint, isDenomBase]);

    function returnSideType(tx: TransactionIF) {
        if (tx.entityType === 'liqchange') {
            if (tx.changeType === 'burn') {
                return 'Remove';
            } else {
                return 'Add';
            }
        } else {
            if (tx.entityType === 'limitOrder') {
                if (tx.changeType === 'mint') {
                    if (tx?.isBuy === true) {
                        return 'Buy';
                    } else {
                        return 'Sell';
                    }
                } else {
                    if (tx.changeType === 'recover') {
                        return 'Claim';
                    } else {
                        return 'Remove';
                    }
                }
            } else if (tx.entityType === 'liqchange') {
                if (tx.changeType === 'burn') {
                    return 'Remove';
                } else {
                    return 'Add';
                }
            } else if (tx.entityType === 'swap') {
                if (tx?.isBuy) {
                    return 'Sell';
                } else {
                    return 'Buy';
                }
            }
        }
    }
    function returnTransactionTypeSide(tx: TransactionIF) {
        if (tx?.entityType === 'liqchange') {
            return 'Range';
        } else {
            if (tx?.entityType === 'swap') {
                return 'Market';
            } else if (tx?.entityType === 'limitOrder') {
                return 'Limit';
            }
        }
    }

    function getPositionAdress(txHash: string) {
        if (txHash) {
            return trimString(txHash, 6, 4, '…');
        }
    }

    function getRestOfMessagesIfAny() {
        if (message.includes(' ')) {
            return message.substring(message.indexOf(' ') + 1);
        } else {
            if (!props.isPosition) {
                return message;
            } else {
                return '';
            }
        }
    }

    function handleOpenExplorer() {
        if (props.isPosition) {
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            const explorerUrl = `${blockExplorer}tx/${hashMsg}`;
            window.open(explorerUrl);
        } else {
            const walletUrl = props.isCurrentUser
                ? '/account'
                : `/account/${props.walletExplorer}`;
            window.open(walletUrl);
        }
    }
    return props.isPosition ? (
        !isInput ? (
            <motion.div className={styles.animate_position_box}>
                <div
                    className={
                        props.showAvatar
                            ? styles.position_main_box
                            : styles.position_main_box_without_avatar
                    }
                >
                    <div className={styles.position_box}>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_name}>
                                {txSummary?.poolSymbolsDisplay}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress(
                                        txSummary?.txHash as string,
                                    )}
                                </div>

                                <div style={{ cursor: 'pointer' }}>
                                    <HiOutlineExternalLink
                                        size={16}
                                        onClick={handleOpenExplorer}
                                        title='Explorer'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>
                                {returnTransactionTypeSide(
                                    txSummary?.tx as TransactionIF,
                                )}{' '}
                                {returnSideType(txSummary?.tx as TransactionIF)}{' '}
                                Price
                            </div>

                            <div>
                                {txSummary?.tx.swapInvPriceDecimalCorrected.toFixed(
                                    2,
                                )}
                            </div>
                        </div>
                        {isPoolPriceChangePositive ? (
                            <>
                                <div className={styles.position_info}>
                                    <div className={styles.tokens_type}>
                                        Range
                                    </div>

                                    <div className={styles.range_price}>
                                        $2,950.00
                                    </div>
                                    <div className={styles.range}>
                                        $4,200.00
                                    </div>
                                </div>
                                <div className={styles.position_info}>
                                    <div className={styles.tokens_name}>
                                        APY
                                    </div>
                                    <div
                                        className={
                                            isPoolPriceChangePositive
                                                ? styles.change_positive
                                                : styles.change_negative
                                        }
                                    >
                                        36.65%
                                    </div>
                                </div>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <p className={styles.position_message}>
                    {getRestOfMessagesIfAny()}
                </p>
            </motion.div>
        ) : isInput ? (
            <motion.div
                className={styles.animate_position_box}
                key='content'
                initial='collapsed'
                animate='open'
                exit='collapsed'
                variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
                <div className={styles.position_main_box}>
                    <div className={styles.position_box}>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_name}>
                                {txSummary?.poolSymbolsDisplay}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress(
                                        txSummary?.txHash as string,
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>
                                {returnTransactionTypeSide(
                                    txSummary?.tx as TransactionIF,
                                )}{' '}
                                {returnSideType(txSummary?.tx as TransactionIF)}{' '}
                                Price
                            </div>

                            <div className={styles.price}>
                                {txSummary?.tx.swapInvPriceDecimalCorrected.toFixed(
                                    2,
                                )}
                            </div>
                        </div>
                        {isPoolPriceChangePositive ? (
                            <>
                                <div className={styles.position_info}>
                                    <div className={styles.tokens_type}>
                                        Range
                                    </div>

                                    <div className={styles.range_price}>
                                        $2,950.00
                                    </div>
                                    <div className={styles.range}>
                                        $4,200.00
                                    </div>
                                </div>
                                <div className={styles.position_info}>
                                    <div className={styles.tokens_type}>
                                        APY
                                    </div>
                                    <div
                                        className={
                                            isPoolPriceChangePositive
                                                ? styles.change_positive
                                                : styles.change_negative
                                        }
                                    >
                                        36.65%
                                    </div>
                                </div>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div>
                    <p className={styles.position_message}>
                        {getRestOfMessagesIfAny()}
                    </p>
                </div>
            </motion.div>
        ) : (
            <></>
        )
    ) : (
        <></>
    );
}
