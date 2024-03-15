/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import {
    trimString,
    getFormattedNumber,
    getUnicodeCharacter,
    getChainExplorer,
} from '../../../../ambient-utils/dataLayer';
import {
    PositionIF,
    TokenIF,
    TransactionIF,
} from '../../../../ambient-utils/types';
import styles from './PositionBox.module.css';
import { motion } from 'framer-motion';
import { GraphDataContext } from '../../../../contexts/GraphDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { LuPanelBottomOpen } from 'react-icons/lu';

interface propsIF {
    message: string;
    isInput: boolean;
    isPosition: boolean;
    setIsPosition: Dispatch<SetStateAction<boolean>>;
    walletExplorer: any;
    isCurrentUser?: boolean;
    showAvatar?: boolean;
}

export default function PositionBox(props: propsIF) {
    const {
        chainData: { blockExplorer, chainId },
    } = useContext(CrocEnvContext);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPoolPriceChangePositive] = useState<boolean>(false);
    const message = props.message;
    const isInput = props.isInput;
    const [position, setPosition] = useState<TransactionIF | undefined>(
        undefined,
    );
    const [sPositions, setSPosition] = useState<PositionIF | undefined>(
        undefined,
    );
    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<
        string | undefined
    >();
    const { isDenomBase } = useContext(TradeDataContext);
    const { positionsByPool, transactionsByPool } =
        useContext(GraphDataContext);

    const transactionsData = transactionsByPool.changes;
    const positionData = positionsByPool.positions;

    const [minPrice, setMinPrice] = useState<string | undefined>();
    const [maxPrice, setMaxPrice] = useState<string | undefined>();
    const [apy, setApy] = useState<any | undefined>();

    const posFingerprint = positionData.map((pos) => pos.positionId).join('|');
    const txFingerprint = transactionsData.map((tx) => tx.txHash).join('|');
    const [topToken, setTopToken] = useState<string | undefined>(undefined);
    const [bottomToken, setBottomToken] = useState<string | undefined>(
        undefined,
    );

    const updateIsPosition = () => {
        if (message && message.includes('0x')) {
            console.log('isDenomBase: ', isDenomBase);
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            if (transactionsData.find((item) => item.txHash === hashMsg)) {
                setPosition(
                    transactionsData.find((item) => item.txHash === hashMsg),
                );
                if (isDenomBase) {
                    setTopToken(position?.baseSymbol); // Assuming these are now TokenIF objects
                    setBottomToken(position?.quoteSymbol);
                } else {
                    setTopToken(position?.quoteSymbol); // Swap if condition is false
                    setBottomToken(position?.baseSymbol);
                }
                console.log(
                    'topToken: ',
                    topToken,
                    ' bottomToken: ',
                    bottomToken,
                );
                props.setIsPosition(true);
            } else if (
                positionData.find(
                    (item: PositionIF) => item.firstMintTx === hashMsg,
                )
            ) {
                setSPosition(
                    positionData.find(
                        (item: PositionIF) => item.firstMintTx === hashMsg,
                    ),
                );
                console.log('sposition: ', sPositions);
                props.setIsPosition(true);
            }
        } else {
            setPosition(undefined);
            setSPosition(undefined);
            props.setIsPosition(false);
        }
    };

    useEffect(() => {
        updateIsPosition();
    }, [message, posFingerprint, txFingerprint, isDenomBase]);

    function financial(position: TransactionIF) {
        if (position?.entityType === 'limitOrder') {
            return position.bidTickInvPriceDecimalCorrected.toFixed(2);
        } else {
            // TODO
            if (position?.entityType === 'swap') {
                return position.askTickPriceDecimalCorrected.toFixed(2);
            } else if (position?.entityType === 'liqchange') {
                console.log('hey');
                return (
                    position.bidTickInvPriceDecimalCorrected.toFixed(2) +
                    position.askTickInvPriceDecimalCorrected.toFixed(2)
                );
            }
        }
    }

    /*

that will merged manually
    const sideType =
        position &&
        (position.entityType === 'swap' || position.entityType === 'limitOrder'
            ? (isDenomBase && !position.isBuy) ||
              (!isDenomBase && position.isBuy)
                ? 'Buy'
                : 'Sell'
            : position.changeType === 'burn'
            ? 'Sell'
            : 'Buy');

*/

    function returnSideType(position: TransactionIF) {
        if (position) {
            if (position.entityType === 'liqchange') {
                if (position.changeType === 'burn') {
                    return 'Remove';
                } else {
                    return 'Add';
                }
            } else {
                if (position.entityType === 'limitOrder') {
                    if (position.changeType === 'mint') {
                        if (position?.isBuy === true) {
                            return 'Buy';
                        } else {
                            return 'Sell';
                        }
                    } else {
                        if (position.changeType === 'recover') {
                            return 'Claim';
                        } else {
                            return 'Remove';
                        }
                    }
                } else if (position.entityType === 'liqchange') {
                    if (position.changeType === 'burn') {
                        return 'Remove';
                    } else {
                        return 'Add';
                    }
                } else if (position.entityType === 'swap') {
                    if (position?.isBuy) {
                        return 'Sell';
                    } else {
                        return 'Buy';
                    }
                }
            }
        }
    }
    function returnTransactionTypeSide(position: TransactionIF) {
        if (position?.entityType === 'liqchange') {
            return 'Range';
        } else {
            if (position?.entityType === 'swap') {
                return 'Market';
            } else if (position?.entityType === 'limitOrder') {
                return 'Limit';
            }
        }
    }
    const sideType = returnSideType(position as TransactionIF);

    const transactionTypeSide = returnTransactionTypeSide(
        position as TransactionIF,
    );

    /* 
     switch (entityType) {
        case 'swap':
            output = 'Market';
            break;
        case 'limitOrder':
            output = 'Limit';
            break;
        case 'liqchange':
            output = 'Range';
            break;
        default:
            console.warn(errorMessage);
            output = 'Unknown';
    }
    */

    useEffect(() => {
        console.log('sposition: ', sPositions);
        if (sPositions) {
            setMinPrice(sPositions?.lowRangeDisplayInBase);
            setMaxPrice(sPositions?.highRangeDisplayInBase);
            setApy(sPositions.apy);
        }
    }, [sPositions]);

    useEffect(() => {
        console.log(position?.entityType);
        if (position !== undefined) {
            console.log('positon: ', position);
            if (position.entityType === 'Swap') {
                if (
                    position.limitPriceDecimalCorrected &&
                    position.invLimitPriceDecimalCorrected
                ) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const priceDecimalCorrected =
                        position.limitPriceDecimalCorrected;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const invPriceDecimalCorrected =
                        position.invLimitPriceDecimalCorrected;

                    setTruncatedDisplayPrice(financial(position));
                }
            } else {
                // In range-remove or range-add here
                if (
                    position.swapPriceDecimalCorrected &&
                    position.swapInvPriceDecimalCorrected
                ) {
                    const priceDecimalCorrected =
                        position.swapPriceDecimalCorrected;
                    const invPriceDecimalCorrected =
                        position.swapInvPriceDecimalCorrected;

                    const nonInvertedPriceTruncated = getFormattedNumber({
                        value: priceDecimalCorrected,
                    });
                    const invertedPriceTruncated = getFormattedNumber({
                        value: invPriceDecimalCorrected,
                    });

                    const truncatedDisplayPrice = isDenomBase
                        ? (position.baseSymbol
                              ? getUnicodeCharacter(position.baseSymbol)
                              : '') + invertedPriceTruncated
                        : (position.quoteSymbol
                              ? getUnicodeCharacter(position.quoteSymbol)
                              : '') + nonInvertedPriceTruncated;
                    console.log(truncatedDisplayPrice);
                    setTruncatedDisplayPrice(truncatedDisplayPrice);
                } else {
                    setTruncatedDisplayPrice(undefined);
                }
            }
        }
    }, [position]);

    function getPositionAdress() {
        if (position) {
            return trimString(position.txHash, 6, 4, '…');
        }

        if (sPositions) {
            return trimString(sPositions.firstMintTx, 6, 4, '…');
        }
    }

    function getRestOfMessagesIfAny() {
        if (message.includes(' ')) {
            return message.substring(message.indexOf(' ') + 1);
        } else {
            if (
                (!position && !props.isPosition) ||
                (!sPositions && !props.isPosition)
            ) {
                return message;
            } else {
                return '';
            }
        }
    }

    function handleOpenExplorer() {
        // chainData may be changed!!
        if (sPositions === undefined && position !== undefined) {
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
        position !== undefined && !isInput ? (
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
                                {topToken} / {bottomToken}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress()}
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
                                {returnTransactionTypeSide(position)} {sideType}{' '}
                                Price
                            </div>

                            <div
                                className={
                                    sideType === 'Buy'
                                        ? styles.buy_price
                                        : sideType === 'Sell'
                                        ? styles.sell_price
                                        : ''
                                }
                            >
                                {truncatedDisplayPrice}
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
        ) : position !== undefined && isInput ? (
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
                                {topToken} / {bottomToken}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>
                                {returnTransactionTypeSide(position)} {sideType}{' '}
                                Price
                            </div>

                            <div className={styles.price}>
                                {truncatedDisplayPrice}
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
        ) : sPositions !== undefined && !isInput ? (
            <motion.div className={styles.animate_position_box}>
                <div className={styles.position_main_box}>
                    <div className={styles.position_box}>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_name}>
                                {sPositions.baseSymbol} /{' '}
                                {sPositions.quoteSymbol}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress()}
                                </div>
                                <div style={{ cursor: 'pointer' }}>
                                    <HiOutlineExternalLink
                                        size={16}
                                        onClick={handleOpenExplorer}
                                        title='Wallet'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>Range</div>
                            <div className={styles.tokens_min_price}>
                                ${minPrice}
                            </div>
                            <div className={styles.tokens_max_price}>
                                ${maxPrice}
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>APY</div>
                            <div className={styles.tokens_apy}>
                                {financial(apy)}%
                            </div>
                        </div>
                    </div>
                </div>
                <p className={styles.position_message}>
                    {getRestOfMessagesIfAny()}
                </p>
            </motion.div>
        ) : sPositions !== undefined && isInput ? (
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
                                {topToken} / {bottomToken}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>Range</div>
                            <div className={styles.tokens_min_price}>
                                ${minPrice}
                            </div>
                            <div className={styles.tokens_max_price}>
                                ${maxPrice}
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>APY</div>
                            <div className={styles.tokens_apy}>
                                {financial(apy)}%
                            </div>
                        </div>
                    </div>
                </div>
                <p className={styles.position_message}>
                    {getRestOfMessagesIfAny()}
                </p>
            </motion.div>
        ) : (
            <></>
        )
    ) : (
        <></>
    );
}
