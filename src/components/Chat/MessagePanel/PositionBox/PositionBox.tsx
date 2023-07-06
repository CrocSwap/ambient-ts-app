/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import trimString from '../../../../utils/functions/trimString';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { formatAmount } from '../../../../utils/numbers';
import {
    PositionIF,
    TransactionIF,
} from '../../../../utils/interfaces/exports';
import styles from './PositionBox.module.css';
import { motion } from 'framer-motion';

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
    const tradeData = useAppSelector((state) => state.tradeData);
    const graphData = useAppSelector((state) => state?.graphData);

    const transactionsData = graphData?.changesByPool?.changes;
    const positionData = graphData?.positionsByPool?.positions;

    const [minPrice, setMinPrice] = useState<string | undefined>();
    const [maxPrice, setMaxPrice] = useState<string | undefined>();
    const [apy, setApy] = useState<any | undefined>();

    const posFingerprint = positionData.map((pos) => pos.positionId).join('|');
    const txFingerprint = transactionsData.map((tx) => tx.txHash).join('|');

    const updateIsPosition = () => {
        if (message && message.includes('0x')) {
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            if (transactionsData.find((item) => item.txHash === hashMsg)) {
                setPosition(
                    transactionsData.find((item) => item.txHash === hashMsg),
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
        // console.log('ddd ', posFingerprint);
    }, [message, posFingerprint, txFingerprint]);

    useEffect(() => {
        // console.log(
        //     'aaaaaakdxsnbşljmnfc ',
        //     transactionsData.find(
        //         (item) =>
        //             item.txHash ===
        //             '0x42e90fa2db7ccffae0e6164b6daa43103ea6a38658601a59ba50372f57ad8105',
        //     ),
        // );
    }, [message]);

    function financial(x: any) {
        console.log(x);
        if (position?.entityType === 'limitOrder') {
            return position.bidTickInvPriceDecimalCorrected.toFixed(2);
        } else {
            if (position?.entityType === 'swap') {
                return position.askTickPriceDecimalCorrected.toFixed(2);
            } else if (position?.entityType === 'liqchange') {
                return 'p2222';
            }
        }
    }

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
                        if (position?.isBuy) {
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
                        return 'Buy';
                    } else {
                        return 'Sell';
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

    useEffect(() => {
        if (sPositions) {
            setMinPrice(sPositions?.lowRangeDisplayInBase);
            setMaxPrice(sPositions?.highRangeDisplayInBase);
            setApy(sPositions.apy);
        }
    }, [sPositions]);

    useEffect(() => {
        if (position !== undefined) {
            if (position.entityType === 'limitOrder') {
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

                    const nonInvertedPriceTruncated =
                        priceDecimalCorrected === 0
                            ? '0.00'
                            : priceDecimalCorrected < 0.0001
                            ? priceDecimalCorrected.toExponential(2)
                            : priceDecimalCorrected < 2
                            ? priceDecimalCorrected.toPrecision(3)
                            : priceDecimalCorrected >= 100000
                            ? formatAmount(priceDecimalCorrected)
                            : priceDecimalCorrected.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });
                    const invertedPriceTruncated =
                        invPriceDecimalCorrected === 0
                            ? '0.00'
                            : invPriceDecimalCorrected < 0.0001
                            ? invPriceDecimalCorrected.toExponential(2)
                            : invPriceDecimalCorrected < 2
                            ? invPriceDecimalCorrected.toPrecision(3)
                            : invPriceDecimalCorrected >= 100000
                            ? formatAmount(invPriceDecimalCorrected)
                            : invPriceDecimalCorrected.toLocaleString(
                                  undefined,
                                  {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  },
                              );

                    const truncatedDisplayPrice = tradeData.isDenomBase
                        ? (position.quoteSymbol
                              ? getUnicodeCharacter(position.quoteSymbol)
                              : '') + invertedPriceTruncated
                        : (position.baseSymbol
                              ? getUnicodeCharacter(position.baseSymbol)
                              : '') + nonInvertedPriceTruncated;

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
        if (sPositions === undefined && position !== undefined) {
            const hashMsg = message
                .split(' ')
                .find((item) => item.includes('0x'));
            const explorerUrl = 'https://goerli.etherscan.io/tx/' + hashMsg;
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
                                {position.quoteSymbol} / {position.baseSymbol}
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
                                {transactionTypeSide} {sideType} Price
                            </div>

                            <div
                            // className={
                            //     sideType === 'Buy'
                            //         ? styles.buy_price
                            //         : styles.sell_price
                            // }
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
                                {position.quoteSymbol} / {position.baseSymbol}
                            </div>
                            <div className={styles.address_box}>
                                <div className={styles.address}>
                                    {getPositionAdress()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.position_info}>
                            <div className={styles.tokens_type}>
                                {sideType} Price
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
                                {sPositions.quoteSymbol} /{' '}
                                {sPositions.baseSymbol}
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
                                {sPositions.quoteSymbol} /{' '}
                                {sPositions.baseSymbol}
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
