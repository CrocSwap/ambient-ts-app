import styles from './RangeActionModal.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RangeActionTokenHeader from './RangeActionTokenHeader/RangeActionTokenHeader';
import RemoveRangeInfo from './RangeActionInfo/RemoveRangeInfo';
import RangeActionButton from './RangeActionButton/RangeActionButton';
import { useContext, useEffect, useMemo, useState } from 'react';

import { PositionIF } from '../../utils/interfaces/exports';
import { BigNumber } from 'ethers';
import {
    ambientPosSlot,
    concPosSlot,
    CrocPositionView,
} from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';
import RangeActionSettings from './RangeActionSettings/RangeActionSettings';
import ExtraControls from './RangeActionExtraControls/RangeActionExtraControls';
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
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { getPositionData } from '../../App/functions/getPositionData';
import { TokenContext } from '../../contexts/TokenContext';
import { PositionServerIF } from '../../utils/interfaces/PositionIF';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import HarvestPositionInfo from './RangeActionInfo/HarvestPositionInfo';
import SimpleModalHeader from '../Global/SimpleModal/SimpleModalHeader/SimpleModalHeader';

interface propsIF {
    type: 'Remove' | 'Harvest';
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

export default function RangeActionModal(props: propsIF) {
    const {
        type,
        position,
        baseTokenAddress,
        quoteTokenAddress,
        handleModalClose,
        isAmbient,
    } = props;

    const { lastBlockNumber, gasPriceInGwei } = useContext(ChainDataContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { mintSlippage, dexBalRange } = useContext(UserPreferenceContext);

    const { tokens } = useContext(TokenContext);

    const [removalPercentage, setRemovalPercentage] = useState<number>(100);

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] =
        useState<number | undefined>();

    const areFeesAvailableToWithdraw =
        (feeLiqBaseDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0) >
        0;

    const positionStatsCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/position_stats?';

    const dispatch = useAppDispatch();

    const positionsPendingUpdate = useAppSelector(
        (state) => state.receiptData,
    ).positionsPendingUpdate;

    const [removalGasPriceinDollars, setRemovalGasPriceinDollars] = useState<
        string | undefined
    >();

    const averageGasUnitsForRemovalTx = type === 'Remove' ? 94500 : 92500;
    const numGweiInWei = 1e-9;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForRemovalTx *
                numGweiInWei *
                ethMainnetUsdPrice;

            setRemovalGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const [currentLiquidity, setCurrentLiquidity] = useState<
        BigNumber | undefined
    >();

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
                    .then((json) => json?.data)
                    .then(async (data: PositionServerIF) => {
                        if (data && crocEnv) {
                            const position = await getPositionData(
                                data,
                                tokens.tokenUniv,
                                crocEnv,
                                chainId,
                                lastBlockNumber,
                                cachedFetchTokenPrice,
                                cachedQuerySpotPrice,
                                cachedTokenDetails,
                                cachedEnsResolve,
                            );
                            setPosLiqBaseDecimalCorrected(
                                position.positionLiqBaseDecimalCorrected,
                            );
                            setPosLiqQuoteDecimalCorrected(
                                position.positionLiqQuoteDecimalCorrected,
                            );
                            setFeeLiqBaseDecimalCorrected(
                                position.feesLiqBaseDecimalCorrected,
                            );
                            setFeeLiqQuoteDecimalCorrected(
                                position.feesLiqQuoteDecimalCorrected,
                            );
                        } else {
                            setPosLiqBaseDecimalCorrected(undefined);
                            setPosLiqQuoteDecimalCorrected(undefined);
                            setFeeLiqBaseDecimalCorrected(undefined);
                            setFeeLiqQuoteDecimalCorrected(undefined);
                        }
                    })
                    .catch((error) => console.error({ error }));
            })();
        }
    }, [lastBlockNumber]);

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] =
        useState<string>('');

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (crocEnv && position.user && position.base && position.quote) {
                crocEnv
                    .token(position.base)
                    .walletDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== baseTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting base token wallet balance',
                                );
                            setBaseTokenBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(position.base)
                    .balanceDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== baseTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting base token dex balance');
                            setBaseTokenDexBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(position.quote)
                    .walletDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== quoteTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting quote token balance');

                            setQuoteTokenBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(position.quote)
                    .balanceDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== quoteTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting quote token dex balance',
                                );

                            setQuoteTokenDexBalance(bal);
                        }
                    })
                    .catch(console.error);
            }
        })();
    }, [
        crocEnv,
        position.user,
        position.base,
        position.quote,
        lastBlockNumber,
    ]);

    const [showSettings, setShowSettings] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newTransactionHash, setNewTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewTransactionHash('');
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
                    setNewTransactionHash(tx?.hash);
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
                    setNewTransactionHash(tx?.hash);
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
            try {
                tx = await pool.burnRangeLiq(
                    liquidityToBurn,
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalRange.outputToDexBal.isEnabled },
                );
                IS_LOCAL_ENV && console.debug(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewTransactionHash(tx?.hash);
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
                setNewTransactionHash(newTransactionHash);
                dispatch(addPendingTx(newTransactionHash));
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
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

    const harvestFn = async () => {
        setShowConfirmation(true);
        if (!crocEnv) return;
        const env = crocEnv;
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - persistedSlippage / 100);
        const highLimit = spotPrice * (1 + persistedSlippage / 100);

        let tx;
        if (position.positionType === 'concentrated') {
            try {
                IS_LOCAL_ENV && console.debug('Harvesting 100% of fees.');
                dispatch(addPositionPendingUpdate(posHash as string));
                tx = await pool.harvestRange(
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalRange.outputToDexBal.isEnabled },
                );
                IS_LOCAL_ENV && console.debug(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewTransactionHash(tx?.hash);
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Harvest Rewards ${position.baseSymbol}+${position.quoteSymbol}`,
                        }),
                    );
            } catch (error) {
                console.error({ error });
                dispatch(removePositionPendingUpdate(posHash as string));
                setTxErrorCode(error?.code);
                dispatch(removePositionPendingUpdate(posHash as string));
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
            }
        } else {
            console.error('unsupported position type for harvest');
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
                setNewTransactionHash(newTransactionHash);
                dispatch(addPendingTx(newTransactionHash));
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

    const transactionDenied = <TransactionDenied />;

    const transactionSuccess = (
        <TxSubmittedSimplify
            hash={newTransactionHash}
            content={`${
                type === 'Remove' ? 'Removal' : 'Harvest'
            } Transaction Successfully Submitted!`}
        />
    );

    const transactionPending = (
        <WaitingConfirmation
            content={`Submitting ${
                type === 'Remove' ? 'removal' : 'harvest'
            } transaction for ${position.baseSymbol} and ${
                position.quoteSymbol
            }.`}
        />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(transactionPending);

    const transactionApproved = newTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const transactionException = <TransactionException />;

    function handleConfirmationChange(): void {
        setCurrentConfirmationData(transactionPending);

        if (transactionApproved) {
            setCurrentConfirmationData(transactionSuccess);
        } else if (isTransactionDenied) {
            setCurrentConfirmationData(transactionDenied);
        } else if (isTransactionException) {
            setCurrentConfirmationData(transactionException);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        newTransactionHash,
        txErrorCode,
        showConfirmation,
        isTransactionDenied,
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

    const baseHarvestNum =
        feeLiqBaseDecimalCorrected !== undefined
            ? ((feeLiqBaseDecimalCorrected || 0) * removalPercentage) / 100
            : undefined;

    const quoteHarvestNum =
        feeLiqBaseDecimalCorrected !== undefined
            ? ((feeLiqQuoteDecimalCorrected || 0) * removalPercentage) / 100
            : undefined;

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            <SimpleModalHeader
                onClose={handleModalClose}
                title={
                    showSettings
                        ? `${
                              type === 'Remove' ? 'Remove Position' : 'Harvest'
                          } Settings`
                        : type === 'Remove'
                        ? 'Remove Position'
                        : 'Harvest Confirmation'
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
        <div className={styles.button_container}>
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
                <RangeActionButton
                    onClick={type === 'Remove' ? removeFn : harvestFn}
                    disabled={true}
                    title='Position Update Pending…'
                />
            ) : (
                <RangeActionButton
                    onClick={type === 'Remove' ? removeFn : harvestFn}
                    disabled={
                        (type === 'Remove'
                            ? liquidityToBurn === undefined ||
                              liquidityToBurn.isZero()
                            : !areFeesAvailableToWithdraw) || showSettings
                    }
                    title={
                        type === 'Remove' ? 'Remove Liquidity' : 'Harvest Fees'
                    }
                />
            )}
        </div>
    );

    const mainModalContent = showSettings ? (
        <RangeActionSettings
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
            <div className={styles.header_container}>
                <RangeActionTokenHeader
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
            <div>
                {type === 'Remove' && (
                    <RemoveRangeWidth
                        removalPercentage={removalPercentage}
                        setRemovalPercentage={setRemovalPercentage}
                    />
                )}
                <div className={styles.info_container}>
                    {type === 'Remove' && (
                        <RemoveRangeInfo
                            baseTokenSymbol={props.baseTokenSymbol}
                            quoteTokenSymbol={props.quoteTokenSymbol}
                            baseTokenLogoURI={props.baseTokenLogoURI}
                            quoteTokenLogoURI={props.quoteTokenLogoURI}
                            posLiqBaseDecimalCorrected={
                                posLiqBaseDecimalCorrected
                            }
                            posLiqQuoteDecimalCorrected={
                                posLiqQuoteDecimalCorrected
                            }
                            feeLiqBaseDecimalCorrected={
                                feeLiqBaseDecimalCorrected
                            }
                            feeLiqQuoteDecimalCorrected={
                                feeLiqQuoteDecimalCorrected
                            }
                            removalPercentage={removalPercentage}
                            baseRemovalNum={baseRemovalNum}
                            quoteRemovalNum={quoteRemovalNum}
                            isAmbient={props.isAmbient}
                        />
                    )}
                    {type === 'Harvest' && (
                        <HarvestPositionInfo
                            baseTokenSymbol={props.baseTokenSymbol}
                            quoteTokenSymbol={props.quoteTokenSymbol}
                            baseTokenLogoURI={props.baseTokenLogoURI}
                            quoteTokenLogoURI={props.quoteTokenLogoURI}
                            baseHarvestNum={baseHarvestNum}
                            quoteHarvestNum={quoteHarvestNum}
                        />
                    )}
                    <ExtraControls />
                    <div className={styles.extra_info_container}>
                        <div>
                            <span>Slippage Tolerange</span>
                            <span>{currentSlippage}%</span>
                        </div>
                        <div>
                            <span>Network Fee</span>
                            <span>~{removalGasPriceinDollars ?? '...'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    if (showConfirmation) return confirmationContent;
    return (
        <>
            <SimpleModalHeader
                onClose={handleModalClose}
                title={
                    showSettings
                        ? `${
                              type === 'Remove' ? 'Remove Position' : 'Harvest'
                          } Settings`
                        : type === 'Remove'
                        ? 'Remove Position'
                        : 'Harvest Confirmation'
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
