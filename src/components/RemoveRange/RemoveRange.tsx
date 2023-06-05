import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeTokenHeader from './RemoveRangeTokenHeader/RemoveRangeTokenHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangeInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useContext, useEffect, useMemo, useState } from 'react';

import { PositionIF } from '../../utils/interfaces/exports';
import { BigNumber, ethers } from 'ethers';
import {
    ambientPosSlot,
    concPosSlot,
    CrocPositionView,
} from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';
import RemoveRangeSettings from './RemoveRangeSettings/RemoveRangeSettings';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import ExtraControls from './ExtraControls/ExtraControls';
import {
    addPendingTx,
    addPositionPendingUpdate,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    removePositionPendingUpdate,
} from '../../utils/state/receiptDataSlice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../Global/TransactionException/TransactionException';
import { isStablePair } from '../../utils/data/stablePairs';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';
import { FaGasPump } from 'react-icons/fa';
import { GRAPHCACHE_URL, IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';

interface propsIF {
    baseTokenAddress: string;
    quoteTokenAddress: string;
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
    position: PositionIF;
    handleModalClose: () => void;
}

export default function RemoveRange(props: propsIF) {
    const {
        position,
        baseTokenAddress,
        quoteTokenAddress,
        handleModalClose,
        isAmbient,
    } = props;

    const { lastBlockNumber, gasPriceInGwei } = useContext(ChainDataContext);

    const {
        crocEnv,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { mintSlippage, dexBalRange } = useContext(UserPreferenceContext);

    const [removalPercentage, setRemovalPercentage] = useState<number>(100);

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] =
        useState<number | undefined>();

    const positionStatsCacheEndpoint = GRAPHCACHE_URL + '/position_stats?';

    const dispatch = useAppDispatch();

    const positionsPendingUpdate = useAppSelector(
        (state) => state.receiptData,
    ).positionsPendingUpdate;

    const [removalGasPriceinDollars, setRemovalGasPriceinDollars] = useState<
        string | undefined
    >();

    const averageGasUnitsForRemovalTx = 94500;
    const numGweiInWei = 1e-9;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForRemovalTx *
                numGweiInWei *
                ethMainnetUsdPrice;

            setRemovalGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const [currentLiquidity, setCurrentLiquidity] = useState<
        BigNumber | undefined
    >();

    const positionHasLiquidity = useMemo(
        () => !currentLiquidity?.isZero(),
        [currentLiquidity],
    );

    const liquidityToBurn = useMemo(
        () => currentLiquidity?.mul(removalPercentage).div(100),
        [currentLiquidity, removalPercentage],
    );

    const updateLiq = async () => {
        try {
            if (!crocEnv || !position) return;
            const pool = crocEnv.pool(position.base, position.quote);
            const pos = new CrocPositionView(pool, position.user);

            const liqBigNum = isAmbient
                ? (await pos.queryAmbient()).seeds
                : (await pos.queryRangePos(position.bidTick, position.askTick))
                      .liq;
            setCurrentLiquidity(liqBigNum);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (crocEnv && position) {
            updateLiq();
        }
    }, [crocEnv, lastBlockNumber, position?.positionId]);

    useEffect(() => {
        if (
            position.chainId &&
            position.poolIdx &&
            position.user &&
            position.base &&
            position.quote &&
            position.positionType
        ) {
            (async () => {
                fetch(
                    positionStatsCacheEndpoint +
                        new URLSearchParams({
                            chainId: position.chainId,
                            user: position.user,
                            base: position.base,
                            quote: position.quote,
                            poolIdx: position.poolIdx.toString(),
                            bidTick: position.bidTick
                                ? position.bidTick.toString()
                                : '0',
                            askTick: position.askTick
                                ? position.askTick.toString()
                                : '0',
                            addValue: 'true',
                            positionType: position.positionType,
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        setPosLiqBaseDecimalCorrected(
                            json?.data?.positionLiqBaseDecimalCorrected === null
                                ? undefined
                                : json?.data?.positionLiqBaseDecimalCorrected,
                        );
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected ===
                                null
                                ? undefined
                                : json?.data?.positionLiqQuoteDecimalCorrected,
                        );
                        setFeeLiqBaseDecimalCorrected(
                            json?.data?.feesLiqBaseDecimalCorrected === null
                                ? undefined
                                : json?.data?.feesLiqBaseDecimalCorrected,
                        );
                        setFeeLiqQuoteDecimalCorrected(
                            json?.data?.feesLiqQuoteDecimalCorrected === null
                                ? undefined
                                : json?.data?.feesLiqQuoteDecimalCorrected,
                        );
                    })
                    .catch((error) => console.error({ error }));
            })();
        }
    }, [lastBlockNumber]);

    const [showSettings, setShowSettings] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newRemovalTransactionHash, setNewRemovalTransactionHash] =
        useState('');
    const [txErrorCode, setTxErrorCode] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewRemovalTransactionHash('');
        setTxErrorCode('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const posHash =
        position.positionType === 'ambient'
            ? ambientPosSlot(
                  position.user,
                  position.base,
                  position.quote,
                  poolIndex,
              )
            : concPosSlot(
                  position.user,
                  position.base,
                  position.quote,
                  position.bidTick,
                  position.askTick,
                  poolIndex,
              );

    const isPositionPendingUpdate =
        positionsPendingUpdate.indexOf(posHash as string) > -1;

    const isPairStable: boolean = isStablePair(
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
    );

    const persistedSlippage: number = isPairStable
        ? mintSlippage.stable
        : mintSlippage.volatile;

    const removeFn = async () => {
        if (!crocEnv || !liquidityToBurn) return;
        IS_LOCAL_ENV && console.debug('removing');
        setShowConfirmation(true);

        const pool = crocEnv.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - persistedSlippage / 100);
        const highLimit = spotPrice * (1 + persistedSlippage / 100);

        dispatch(addPositionPendingUpdate(posHash as string));

        let tx;
        if (position.positionType === 'ambient') {
            if (removalPercentage === 100) {
                IS_LOCAL_ENV &&
                    console.debug(`${removalPercentage}% to be removed.`);
                try {
                    tx = await pool.burnAmbientAll([lowLimit, highLimit], {
                        surplus: dexBalRange.outputToDexBal.isEnabled,
                    });
                    IS_LOCAL_ENV && console.debug(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    console.error({ error });
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                }
            } else {
                try {
                    tx = await pool.burnAmbientLiq(liquidityToBurn, [
                        lowLimit,
                        highLimit,
                    ]);
                    IS_LOCAL_ENV && console.debug(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    IS_LOCAL_ENV && console.debug({ error });
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                }
            }
        } else if (position.positionType === 'concentrated') {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                .div(100);
            IS_LOCAL_ENV &&
                console.debug(`${removalPercentage}% to be removed.`);

            try {
                tx = await pool.burnRangeLiq(
                    liquidityToBurn,
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalRange.outputToDexBal.isEnabled },
                );
                IS_LOCAL_ENV && console.debug(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewRemovalTransactionHash(tx?.hash);
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Remove Range ${position.baseSymbol}+${position.quoteSymbol}`,
                        }),
                    );
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
                dispatch(removePositionPendingUpdate(posHash as string));
                setTxErrorCode(error?.code);
                dispatch(removePositionPendingUpdate(posHash as string));
            }
        } else {
            IS_LOCAL_ENV &&
                console.debug('unsupported position type for removal');
        }

        const newLiqChangeCacheEndpoint = GRAPHCACHE_URL + '/new_liqchange?';
        if (tx?.hash) {
            if (position.positionType === 'ambient') {
                fetch(
                    newLiqChangeCacheEndpoint +
                        new URLSearchParams({
                            chainId: position.chainId,
                            tx: tx.hash,
                            user: position.user,
                            base: position.base,
                            quote: position.quote,
                            poolIdx: position.poolIdx.toString(),
                            positionType: 'ambient',
                            changeType: 'burn',
                            isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                            liq: liquidityToBurn.toString(), // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                        }),
                );
            } else {
                fetch(
                    newLiqChangeCacheEndpoint +
                        new URLSearchParams({
                            chainId: position.chainId,
                            tx: tx.hash,
                            user: position.user,
                            base: position.base,
                            quote: position.quote,
                            poolIdx: position.poolIdx.toString(),
                            positionType: 'concentrated',
                            bidTick: position.bidTick.toString(),
                            askTick: position.askTick.toString(),
                            changeType: 'burn',
                            isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                            liq: liquidityToBurn.toString(), // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                        }),
                );
            }
        }

        let receipt;

        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;
            console.error({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                setNewRemovalTransactionHash(newTransactionHash);
                dispatch(addPendingTx(newTransactionHash));
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    if (position.positionType === 'ambient') {
                        fetch(
                            newLiqChangeCacheEndpoint +
                                new URLSearchParams({
                                    chainId: position.chainId,
                                    tx: newTransactionHash,
                                    user: position.user,
                                    base: position.base,
                                    quote: position.quote,
                                    poolIdx: position.poolIdx.toString(),
                                    positionType: 'ambient',
                                    changeType: 'burn',
                                    isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                    liq: liquidityToBurn.toString(), // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                                }),
                        );
                    } else {
                        fetch(
                            newLiqChangeCacheEndpoint +
                                new URLSearchParams({
                                    chainId: position.chainId,
                                    tx: newTransactionHash,
                                    user: position.user,
                                    base: position.base,
                                    quote: position.quote,
                                    poolIdx: position.poolIdx.toString(),
                                    positionType: 'concentrated',
                                    bidTick: position.bidTick.toString(),
                                    askTick: position.askTick.toString(),
                                    changeType: 'burn',
                                    isBid: 'false', // boolean (Only applies if knockout is true.) Whether or not the knockout liquidity position is a bid (rather than an ask).
                                    liq: liquidityToBurn.toString(), // boolean (Optional.) If true, transaction is immediately inserted into cache without checking whether tx has been mined.
                                }),
                        );
                    }
                }
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            IS_LOCAL_ENV && console.debug('dispatching receipt');
            IS_LOCAL_ENV && console.debug({ receipt });
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
            dispatch(removePositionPendingUpdate(posHash as string));
        }
    };
    const removalDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );

    const removalSuccess = (
        <TxSubmittedSimplify
            hash={newRemovalTransactionHash}
            content='Removal Transaction Successfully Submitted'
        />
    );

    const removalPending = (
        <WaitingConfirmation
            content={`Submitting removal transaction for ${position.baseSymbol} and ${position.quoteSymbol}.`}
        />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(removalPending);

    const transactionApproved = newRemovalTransactionHash !== '';
    const isRemovalDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isRemovalDenied;

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    function handleConfirmationChange(): void {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isRemovalDenied) {
            setCurrentConfirmationData(removalDenied);
        } else if (isTransactionException) {
            setCurrentConfirmationData(transactionException);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        newRemovalTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

    const baseRemovalNum =
        (((posLiqBaseDecimalCorrected || 0) +
            (feeLiqBaseDecimalCorrected || 0)) *
            removalPercentage) /
        100;

    const quoteRemovalNum =
        (((posLiqQuoteDecimalCorrected || 0) +
            (feeLiqQuoteDecimalCorrected || 0)) *
            removalPercentage) /
        100;

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            <RemoveRangeHeader
                onClose={handleModalClose}
                title={
                    showSettings
                        ? 'Remove Position Settings'
                        : 'Remove Position'
                }
                onBackButton={() => {
                    resetConfirmation();
                    setShowSettings(false);
                }}
                showBackButton={showSettings}
            />
            <div className={styles.confirmation_content}>
                {currentConfirmationData}
            </div>
        </div>
    );

    const [currentSlippage, setCurrentSlippage] =
        useState<number>(persistedSlippage);

    const updateSettings = (): void => {
        setShowSettings(false);
        isPairStable
            ? mintSlippage.updateStable(currentSlippage)
            : mintSlippage.updateVolatile(currentSlippage);
    };

    const buttonToDisplay = (
        <div style={{ padding: '1rem' }}>
            {showSettings ? (
                <Button
                    title={
                        currentSlippage > 0
                            ? 'Confirm'
                            : 'Enter a Valid Slippage'
                    }
                    action={updateSettings}
                    flat
                    disabled={!(currentSlippage > 0)}
                />
            ) : isPositionPendingUpdate ? (
                <RemoveRangeButton
                    removeFn={removeFn}
                    disabled={true}
                    title='Position Update Pending…'
                />
            ) : positionHasLiquidity ? (
                <RemoveRangeButton
                    removeFn={removeFn}
                    disabled={showSettings}
                    title='Remove Range'
                />
            ) : (
                <RemoveRangeButton
                    removeFn={removeFn}
                    disabled={true}
                    title='…'
                />
            )}
        </div>
    );

    const mainModalContent = showSettings ? (
        <RemoveRangeSettings
            persistedSlippage={persistedSlippage}
            setCurrentSlippage={setCurrentSlippage}
            presets={
                isPairStable
                    ? mintSlippage.presets.stable
                    : mintSlippage.presets.volatile
            }
        />
    ) : (
        <>
            <div
                className={styles.header_container}
                style={{ padding: '1rem' }}
            >
                <RemoveRangeTokenHeader
                    isPositionInRange={props.isPositionInRange}
                    isAmbient={props.isAmbient}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                />
            </div>
            <div style={{ padding: '0 1rem' }}>
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                <RemoveRangeInfo
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
                    posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
                    feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
                    feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
                    removalPercentage={removalPercentage}
                    baseRemovalNum={baseRemovalNum}
                    quoteRemovalNum={quoteRemovalNum}
                    isAmbient={props.isAmbient}
                />
                <ExtraControls />
            </div>
            <div className={styles.gas_pump}>
                <FaGasPump size={15} />{' '}
                {removalGasPriceinDollars ? removalGasPriceinDollars : '…'}
            </div>
        </>
    );

    if (showConfirmation) return confirmationContent;
    return (
        <>
            <RemoveRangeHeader
                onClose={handleModalClose}
                title={
                    showSettings
                        ? 'Remove Position Settings'
                        : 'Remove Position'
                }
                onBackButton={() => {
                    resetConfirmation();
                    setShowSettings(false);
                }}
                showBackButton={showSettings}
            />
            <div className={styles.remove_range_container}>
                <div className={styles.main_content}>
                    {mainModalContent}
                    {buttonToDisplay}
                </div>
            </div>
        </>
    );
}
