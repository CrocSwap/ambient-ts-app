import styles from './RangeActionModal.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RangeActionTokenHeader from './RangeActionTokenHeader/RangeActionTokenHeader';
import RemoveRangeInfo from './RangeActionInfo/RemoveRangeInfo';
import { memo, useContext, useEffect, useMemo, useState } from 'react';

import {
    PositionIF,
    PositionServerIF,
    RangeModalAction,
} from '../../ambient-utils/types';
import { BigNumber } from 'ethers';
import Button from '../Form/Button';
import RangeActionSettings from './RangeActionSettings/RangeActionSettings';
import ExtraControls from './RangeActionExtraControls/RangeActionExtraControls';

import {
    isTransactionFailedError,
    isTransactionReplacedError,
    parseErrorMessage,
    TransactionError,
} from '../../utils/TransactionError';
import { GCGO_OVERRIDE_URL, IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import {
    getPositionData,
    getFormattedNumber,
    isStablePair,
} from '../../ambient-utils/dataLayer';
import { TokenContext } from '../../contexts/TokenContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import HarvestPositionInfo from './RangeActionInfo/HarvestPositionInfo';
import ModalHeader from '../Global/ModalHeader/ModalHeader';
import Modal from '../Global/Modal/Modal';
import SubmitTransaction from '../Trade/TradeModules/SubmitTransaction/SubmitTransaction';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    GAS_DROPS_ESTIMATE_RANGE_REMOVAL,
    GAS_DROPS_ESTIMATE_RANGE_HARVEST,
    NUM_GWEI_IN_WEI,
} from '../../ambient-utils/constants/';
import { ReceiptContext } from '../../contexts/ReceiptContext';
import { UserDataContext } from '../../contexts/UserDataContext';
import { useProcessRange } from '../../utils/hooks/useProcessRange';
import { getPositionHash } from '../../ambient-utils/dataLayer/functions/getPositionHash';

interface propsIF {
    type: RangeModalAction;
    position: PositionIF;
    onClose: () => void;
    isAccountView: boolean;
}

function RangeActionModal(props: propsIF) {
    const { type, position, onClose, isAccountView } = props;

    const { userAddress } = useContext(UserDataContext);

    const {
        isAmbient,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenLogo: baseTokenLogoURI,
        quoteTokenLogo: quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
        isPositionInRange,
    } = useProcessRange(position, userAddress, isAccountView);

    const { lastBlockNumber, gasPriceInGwei } = useContext(ChainDataContext);

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { mintSlippage, dexBalRange } = useContext(UserPreferenceContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

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

    const usdRemovalValue = useMemo(
        () =>
            type === 'Remove'
                ? getFormattedNumber({
                      value: (position.totalValueUSD * removalPercentage) / 100,
                      prefix: '$',
                  })
                : getFormattedNumber({
                      value: position.feesValueUSD,
                      prefix: '$',
                  }),
        [position, removalPercentage, type],
    );

    const areFeesAvailableToWithdraw =
        (feeLiqBaseDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0) >
        0;

    const positionStatsCacheEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/position_stats?'
        : activeNetwork.graphCacheUrl + '/position_stats?';

    const [removalGasPriceinDollars, setRemovalGasPriceinDollars] = useState<
        string | undefined
    >();

    const averageGasUnitsForRemovalTxInGasDrops =
        type === 'Remove'
            ? GAS_DROPS_ESTIMATE_RANGE_REMOVAL
            : GAS_DROPS_ESTIMATE_RANGE_HARVEST;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForRemovalTxInGasDrops *
                NUM_GWEI_IN_WEI *
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
            const pos = crocEnv.positions(
                position.base,
                position.quote,
                position.user,
            );

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
                        if (data && crocEnv && provider) {
                            // temporarily skip ENS fetch
                            const skipENSFetch = true;
                            const position = await getPositionData(
                                data,
                                tokens.tokenUniv,
                                crocEnv,
                                provider,
                                chainId,
                                lastBlockNumber,
                                cachedFetchTokenPrice,
                                cachedQuerySpotPrice,
                                cachedTokenDetails,
                                cachedEnsResolve,
                                skipENSFetch,
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
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewTransactionHash('');
        setTxErrorCode('');
        setTxErrorMessage('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const closeModal = () => {
        resetConfirmation();
        onClose();
    };

    const isPairStable: boolean = isStablePair(
        baseTokenAddress,
        quoteTokenAddress,
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
                    addPendingTx(tx?.hash);
                    setNewTransactionHash(tx?.hash);
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    console.error({ error });
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(parseErrorMessage(error));
                }
            } else {
                try {
                    tx = await pool.burnAmbientLiq(liquidityToBurn, [
                        lowLimit,
                        highLimit,
                    ]);
                    addPendingTx(tx?.hash);
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
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(parseErrorMessage(error));
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
                addPendingTx(tx?.hash);
                setNewTransactionHash(tx?.hash);
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.error({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(parseErrorMessage(error));
            }
        } else {
            IS_LOCAL_ENV &&
                console.debug('unsupported position type for removal');
        }

        if (tx?.hash) {
            addTransactionByType({
                userAddress: userAddress || '',
                txHash: tx.hash,
                txAction: 'Remove',
                txType: 'Range',
                txDescription: `Remove Range ${position.baseSymbol}+${position.quoteSymbol}`,
                txDetails: {
                    baseAddress: position.base,
                    quoteAddress: position.quote,
                    poolIdx: poolIndex,
                    baseSymbol: position.baseSymbol,
                    quoteSymbol: position.quoteSymbol,
                    baseTokenDecimals: position.baseDecimals,
                    quoteTokenDecimals: position.quoteDecimals,
                    isAmbient: isAmbient,
                    lowTick: position.bidTick,
                    highTick: position.askTick,
                    gridSize: lookupChain(position.chainId).gridSize,
                },
            });
            const posHash = getPositionHash(position);
            addPositionUpdate({
                txHash: tx.hash,
                positionID: posHash,
                isLimit: false,
                unixTimeAdded: Math.floor(Date.now() / 1000),
            });
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
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                setNewTransactionHash(newTransactionHash);
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            IS_LOCAL_ENV && console.debug('dispatching receipt');
            IS_LOCAL_ENV && console.debug({ receipt });
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.transactionHash);
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
                tx = await pool.harvestRange(
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalRange.outputToDexBal.isEnabled },
                );
                IS_LOCAL_ENV && console.debug(tx?.hash);
                addPendingTx(tx?.hash);
                setNewTransactionHash(tx?.hash);
                if (tx?.hash) {
                    addTransactionByType({
                        userAddress: userAddress || '',
                        txHash: tx.hash,
                        txAction: 'Harvest',
                        txType: 'Range',
                        txDescription: `Harvest Rewards ${position.baseSymbol}+${position.quoteSymbol}`,
                        txDetails: {
                            baseAddress: position.base,
                            quoteAddress: position.quote,
                            poolIdx: poolIndex,
                            baseSymbol: position.baseSymbol,
                            quoteSymbol: position.quoteSymbol,
                            baseTokenDecimals: position.baseDecimals,
                            quoteTokenDecimals: position.quoteDecimals,
                            isAmbient: isAmbient,
                            lowTick: position.bidTick,
                            highTick: position.askTick,
                            gridSize: lookupChain(position.chainId).gridSize,
                        },
                    });
                    const posHash = getPositionHash(position);
                    addPositionUpdate({
                        txHash: tx.hash,
                        positionID: posHash,
                        isLimit: false,
                        unixTimeAdded: Math.floor(Date.now() / 1000),
                    });
                }
            } catch (error) {
                console.error({ error });
                setTxErrorCode(error?.code);
                setTxErrorMessage(parseErrorMessage(error));
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
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                setNewTransactionHash(newTransactionHash);
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            IS_LOCAL_ENV && console.debug('dispatching receipt');
            IS_LOCAL_ENV && console.debug({ receipt });
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.transactionHash);
        }
    };

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

    const [currentSlippage, setCurrentSlippage] =
        useState<number>(persistedSlippage);

    const updateSettings = (): void => {
        setShowSettings(false);
        isPairStable
            ? mintSlippage.updateStable(currentSlippage)
            : mintSlippage.updateVolatile(currentSlippage);
    };

    // logic to prevent harvest button updating during/after harvest completion
    const [memoIsActionReset, setMemoIsActionReset] = useState<
        boolean | undefined
    >();
    const [memoBaseHarvestNum, setMemoBaseHarvestNum] = useState<
        number | undefined
    >();
    const [memoQuoteHarvestNum, setMemoQuoteHarvestNum] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (newTransactionHash === '') {
            setMemoIsActionReset(!areFeesAvailableToWithdraw);
            setMemoBaseHarvestNum(baseHarvestNum);
            setMemoQuoteHarvestNum(quoteHarvestNum);
        }
    }, [
        newTransactionHash,
        areFeesAvailableToWithdraw,
        baseHarvestNum,
        quoteHarvestNum,
    ]);

    const buttonToDisplay = (
        <div className={styles.button_container}>
            {showSettings ? (
                <Button
                    idForDOM='update_settings_button_in_range_modal'
                    title={
                        currentSlippage > 0
                            ? 'Confirm'
                            : 'Enter a Valid Slippage'
                    }
                    action={updateSettings}
                    flat
                    disabled={!(currentSlippage > 0)}
                />
            ) : showConfirmation ? (
                <SubmitTransaction
                    type={
                        type === 'Harvest'
                            ? memoIsActionReset
                                ? 'Reset'
                                : 'Harvest'
                            : type === 'Remove'
                            ? 'Remove'
                            : 'Range'
                    }
                    newTransactionHash={newTransactionHash}
                    txErrorCode={txErrorCode}
                    txErrorMessage={txErrorMessage}
                    resetConfirmation={resetConfirmation}
                    sendTransaction={type === 'Remove' ? removeFn : harvestFn}
                    transactionPendingDisplayString={
                        'Submitting transaction...'
                    }
                    disableSubmitAgain
                />
            ) : (
                <Button
                    idForDOM='harvest_remove_fees_modal_button'
                    title={
                        !(
                            (type === 'Remove'
                                ? liquidityToBurn === undefined ||
                                  liquidityToBurn.isZero()
                                : memoIsActionReset) || showSettings
                        )
                            ? type === 'Remove'
                                ? 'Remove Liquidity'
                                : 'Harvest Fees'
                            : type === 'Harvest'
                            ? 'Reset'
                            : '...'
                    }
                    disabled={
                        (type === 'Remove' &&
                            (liquidityToBurn === undefined ||
                                liquidityToBurn.isZero())) ||
                        showSettings
                    }
                    action={type === 'Remove' ? removeFn : harvestFn}
                    flat
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
                    isPositionInRange={isPositionInRange}
                    isAmbient={isAmbient}
                    baseTokenSymbol={baseTokenSymbol}
                    quoteTokenSymbol={quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    baseTokenAddress={baseTokenAddress}
                    quoteTokenAddress={quoteTokenAddress}
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
                            baseTokenAddress={baseTokenAddress}
                            quoteTokenAddress={quoteTokenAddress}
                            baseTokenSymbol={baseTokenSymbol}
                            quoteTokenSymbol={quoteTokenSymbol}
                            baseTokenLogoURI={baseTokenLogoURI}
                            quoteTokenLogoURI={quoteTokenLogoURI}
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
                            fiatRemovalVal={usdRemovalValue}
                            isAmbient={isAmbient}
                        />
                    )}
                    {type === 'Harvest' && (
                        <HarvestPositionInfo
                            baseTokenAddress={baseTokenAddress}
                            quoteTokenAddress={quoteTokenAddress}
                            baseTokenSymbol={baseTokenSymbol}
                            quoteTokenSymbol={quoteTokenSymbol}
                            baseTokenLogoURI={baseTokenLogoURI}
                            quoteTokenLogoURI={quoteTokenLogoURI}
                            baseHarvestNum={memoBaseHarvestNum}
                            quoteHarvestNum={memoQuoteHarvestNum}
                            fiatHarvestVal={usdRemovalValue}
                        />
                    )}
                    <ExtraControls />
                    <div className={styles.extra_info_container}>
                        <div>
                            <span>Slippage Tolerange</span>
                            <span>{currentSlippage}%</span>
                        </div>
                        {chainId === '0x1' && (
                            <div>
                                <span>Network Fee</span>
                                <span>
                                    {removalGasPriceinDollars
                                        ? '~' + removalGasPriceinDollars
                                        : '...'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <Modal usingCustomHeader onClose={closeModal}>
            <ModalHeader
                onClose={closeModal}
                title={
                    showSettings
                        ? `${
                              type === 'Remove' ? 'Remove Liquidity' : 'Harvest'
                          } Settings`
                        : type === 'Remove'
                        ? 'Remove Liquidity'
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
        </Modal>
    );
}

export default memo(RangeActionModal);
