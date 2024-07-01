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
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TxPosition } from '../InputBox/MessageInput';
import { Message } from '../../Model/MessageModel';

interface propsIF {
    message: string;
    isInput: boolean;
    isPosition?: boolean;
    setIsPosition?: Dispatch<SetStateAction<boolean>>;
    walletExplorer: any;
    isCurrentUser?: boolean;
    showAvatar?: boolean;
    setTxPositionSummary?: Dispatch<SetStateAction<TxPosition>>;
    txPositionSummary?: TxPosition;
    txSummary?: TransactionData | null;
    msg?: Message;
    isPositionForSentMessagePanel?: boolean;
    setIsPositionForSentMessagePanel?: Dispatch<SetStateAction<boolean>>;
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
    const txSummary = props.txSummary;

    // useEffect(() => {
    //     if (!props.txSummary || Object.keys(props.txSummary).length === 0) {
    //     }
    // }, [props.txSummary]);

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
        return '';
    }

    function getRestOfMessagesIfAny() {
        if (message.includes(' ')) {
            return message.substring(message.indexOf(' ') + 1);
        } else {
            if (!props.isPosition && !props.isPositionForSentMessagePanel) {
                return message;
            } else {
                return '';
            }
        }
    }

    function handleOpenExplorer() {
        // chainData may be changed!!
        if (props.isPosition || props.isPositionForSentMessagePanel) {
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            const explorerUrl = `${blockExplorer}tx/${hashMsg}`;
            window.open(explorerUrl);
        } else {
            const walletUrl = props.isCurrentUser
                ? '/account'
                : `/${props.walletExplorer}`;
            window.open(walletUrl);
        }
    }

    return !props.isPosition && !props.isPositionForSentMessagePanel ? (
        <></>
    ) : isInput && props.isPosition ? (
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
                                {getPositionAdress(txSummary?.txHash as string)}
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
                </div>
            </div>
            <p className={styles.position_message}>
                {getRestOfMessagesIfAny()}
            </p>
        </motion.div>
    ) : !props.isInput && props.isPositionForSentMessagePanel ? (
        <motion.div>
            <div className={styles.position_main_box}>
                <div className={styles.position_box}>
                    <div className={styles.position_info}>
                        <div className={styles.tokens_name}>
                            {props.msg?.position.poolsByDisplay}
                        </div>
                        <div className={styles.address_box}>
                            <div className={styles.address}>
                                {getPositionAdress(
                                    props.msg?.position?.txHash as string,
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
                            {props.msg?.position.sideType} Price
                        </div>
                        <div className={styles.price}>
                            {props.msg?.position?.price}
                        </div>
                    </div>
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
    );
}
