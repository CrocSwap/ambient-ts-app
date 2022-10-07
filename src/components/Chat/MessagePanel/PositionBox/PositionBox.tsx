/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { HiOutlineExternalLink } from 'react-icons/hi';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import trimString from '../../../../utils/functions/trimString';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { formatAmount } from '../../../../utils/numbers';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import styles from './PositionBox.module.css';
import { motion } from 'framer-motion';
import { useSortedPositions } from '../../../Trade/TradeTabs/Ranges/useSortedPositions';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import { applyMiddleware } from '@reduxjs/toolkit';
import { FiCopy } from 'react-icons/fi';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../Global/SnackbarComponent/SnackbarComponent';

interface PositionBoxProps {
    message: string;
}

export default function PositionBox(props: PositionBoxProps) {
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [value, copy] = useCopyToClipboard();
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(false);
    const message = props.message;
    const [position, setPosition] = useState<ITransaction | undefined>(undefined);
    const [sPositions, setSPosition] = useState<PositionIF | undefined>(undefined);
    const [truncatedDisplayPrice, setTruncatedDisplayPrice] = useState<string | undefined>();
    const tradeData = useAppSelector((state) => state.tradeData);
    const graphData = useAppSelector((state) => state?.graphData);
    const transactionsData = graphData?.changesByPool?.changes;
    const [sortBy, setSortBy, reverseSort, setReverseSort, sortedPositions] = useSortedPositions(
        true,
        graphData?.positionsByUser?.positions,
        graphData?.positionsByPool?.positions,
    );
    const [minPrice, setMinPrice] = useState<string | undefined>();
    const [maxPrice, setMaxPrice] = useState<string | undefined>();
    const [apy, setApy] = useState<any | undefined>();

    useEffect(() => {
        if (message.includes('0x')) {
            const hashMsg = message.split(' ').find((item) => item.includes('0x'));
            setPosition(transactionsData.find((item) => item.tx === hashMsg));
        } else {
            setPosition(undefined);
        }
    }, [message]);

    useEffect(() => {
        if (message.includes('0x')) {
            const hashMsg = message.split(' ').find((item) => item.includes('0x'));
            setSPosition(
                sortedPositions.find((item: PositionIF) => item.positionStorageSlot === hashMsg),
            );
        } else {
            setSPosition(undefined);
        }
    }, [message]);

    const sSideType = sPositions ? 'Range' : '';

    function financial(x: any) {
        return Number.parseFloat(x).toFixed(2);
    }

    const sideType =
        position &&
        (position.entityType === 'swap' || position.entityType === 'limitOrder'
            ? (tradeData.isDenomBase && !position.isBuy) ||
              (!tradeData.isDenomBase && position.isBuy)
                ? 'Buy'
                : 'Sell'
            : position.changeType === 'burn'
            ? 'Sell'
            : 'Buy');

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
                if (position.limitPriceDecimalCorrected && position.invLimitPriceDecimalCorrected) {
                    const priceDecimalCorrected = position.limitPriceDecimalCorrected;
                    const invPriceDecimalCorrected = position.invLimitPriceDecimalCorrected;

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
                            ? priceDecimalCorrected.toPrecision(3)
                            : invPriceDecimalCorrected >= 100000
                            ? formatAmount(invPriceDecimalCorrected)
                            : invPriceDecimalCorrected.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });

                    const truncatedDisplayPrice = tradeData.isDenomBase
                        ? position.quoteSymbol
                            ? getUnicodeCharacter(position.quoteSymbol)
                            : '' + invertedPriceTruncated
                        : position.baseSymbol
                        ? getUnicodeCharacter(position.baseSymbol)
                        : '' + nonInvertedPriceTruncated;

                    setTruncatedDisplayPrice(
                        financial(position.askTickPriceDecimalCorrected).toString(),
                    );
                }
            } else {
                console.error(position);
                if (position.priceDecimalCorrected && position.invPriceDecimalCorrected) {
                    const priceDecimalCorrected = position.priceDecimalCorrected;
                    const invPriceDecimalCorrected = position.invPriceDecimalCorrected;

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
                            : invPriceDecimalCorrected.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });

                    const truncatedDisplayPrice = tradeData.isDenomBase
                        ? (position.quoteSymbol ? getUnicodeCharacter(position.quoteSymbol) : '') +
                          invertedPriceTruncated
                        : (position.baseSymbol ? getUnicodeCharacter(position.baseSymbol) : '') +
                          nonInvertedPriceTruncated;

                    setTruncatedDisplayPrice(truncatedDisplayPrice);
                } else {
                    setTruncatedDisplayPrice(undefined);
                }
            }
        }
    }, [position]);

    function getPositionAdress() {
        if (position) {
            return trimString(position.tx, 6, 4, '…');
        }

        if (sPositions) {
            return trimString(sPositions.positionStorageSlot, 6, 4, '…');
        }
    }
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {trimString(message, 6, 4, '…')} copied
        </SnackbarComponent>
    );
    function handleCopyAddress() {
        copy(message);
        setOpenSnackbar(true);
    }
    return position !== undefined ? (
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
                            <span className={styles.address}>{getPositionAdress()}</span>
                            <span>
                                <HiOutlineExternalLink size={22} color='rgba(235, 235, 255, 0.4)' />
                            </span>
                            <span>
                                <FiCopy onClick={handleCopyAddress} />
                            </span>
                        </div>
                    </div>
                    <div className={styles.position_info}>
                        <span className={styles.tokens_name}>{sideType} Price</span>

                        <span className={styles.price}>${truncatedDisplayPrice}</span>
                    </div>
                    {isPoolPriceChangePositive ? (
                        <>
                            <div className={styles.position_info}>
                                <span className={styles.tokens_name}>Range</span>

                                <span className={styles.range_price}>$2,950.00</span>
                                <span className={styles.range}>$4,200.00</span>
                            </div>
                            <div className={styles.position_info}>
                                <span className={styles.tokens_name}>APY</span>
                                <span
                                    className={
                                        isPoolPriceChangePositive
                                            ? styles.change_positive
                                            : styles.change_negative
                                    }
                                >
                                    36.65%
                                </span>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                {snackbarContent}
            </div>
        </motion.div>
    ) : sPositions ? (
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
                {snackbarContent}
                <div className={styles.position_box}>
                    <div className={styles.position_info}>
                        <div className={styles.tokens_name}>
                            {sPositions.quoteSymbol} / {sPositions.baseSymbol}
                        </div>
                        <div className={styles.address_box}>
                            <span className={styles.address}>{getPositionAdress()}</span>
                            <span>
                                <HiOutlineExternalLink size={22} color='rgba(235, 235, 255, 0.4)' />
                            </span>
                            <span>
                                <FiCopy onClick={handleCopyAddress} />
                            </span>
                        </div>
                    </div>
                    <div className={styles.position_info}>
                        <span className={styles.tokens_name}>Range</span>
                        <span className={styles.tokens_min_price}>${minPrice}</span>
                        <span className={styles.tokens_max_price}>${maxPrice}</span>
                    </div>
                    <div className={styles.position_info}>
                        <span className={styles.tokens_name}>APY</span>
                        <span className={styles.tokens_apy}>{financial(apy)}%</span>
                    </div>
                </div>
            </div>
        </motion.div>
    ) : (
        <></>
    );
}
