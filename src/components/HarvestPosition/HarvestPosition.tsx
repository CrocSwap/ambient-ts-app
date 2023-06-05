import styles from './HarvestPosition.module.css';
import HarvestPositionTokenHeader from './HarvestPositionTokenHeader/HarvestPositionTokenHeader';
import HarvestPositionInfo from './HarvestPositionInfo/HarvestPositionInfo';
import HarvestPositionButton from './HarvestPositionButton/HarvestPositionButton';
import { useEffect, useState, useContext } from 'react';

import { RiListSettingsLine } from 'react-icons/ri';
import { PositionIF } from '../../utils/interfaces/exports';
import { ethers } from 'ethers';
import Button from '../Global/Button/Button';
import HarvestPositionSettings from './HarvestPositionSettings/HarvestPositionSettings';

import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import HarvestPositionHeader from './HarvestPositionHeader/HarvestPositionHeader';
import HarvestExtraControls from './HarvestExtraControls/HarvestExtraControls';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    addPendingTx,
    addPositionPendingUpdate,
    addReceipt,
    addTransactionByType,
    removePendingTx,
    removePositionPendingUpdate,
} from '../../utils/state/receiptDataSlice';
import TransactionException from '../Global/TransactionException/TransactionException';
import { isStablePair } from '../../utils/data/stablePairs';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import { FaGasPump } from 'react-icons/fa';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';

interface propsIF {
    provider: ethers.providers.Provider;
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

export default function HarvestPosition(props: propsIF) {
    const { baseTokenLogoURI, quoteTokenLogoURI, position, handleModalClose } =
        props;

    // settings
    const [showSettings, setShowSettings] = useState(false);

    const {
        crocEnv,
        chainData: { chainId, poolIndex },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { mintSlippage, dexBalRange } = useContext(UserPreferenceContext);

    const isPairStable: boolean = isStablePair(
        position.base,
        position.quote,
        chainId,
    );

    const persistedSlippage: number = isPairStable
        ? mintSlippage.stable
        : mintSlippage.volatile;

    const [currentSlippage, setCurrentSlippage] =
        useState<number>(persistedSlippage);

    const updateSettings = (): void => {
        setShowSettings(false);
        isPairStable
            ? mintSlippage.updateStable(currentSlippage)
            : mintSlippage.updateVolatile(currentSlippage);
    };

    const lastBlockNumber = useAppSelector(
        (state) => state.graphData,
    ).lastBlock;

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newHarvestTransactionHash, setNewHarvestTransactionHash] =
        useState('');
    const [txErrorCode, setTxErrorCode] = useState('');

    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] =
        useState<number | undefined>();

    const [harvestGasPriceinDollars, setHarvestGasPriceinDollars] = useState<
        string | undefined
    >();

    const averageGasUnitsForHarvestTx = 92500;
    const numGweiInWei = 1e-9;

    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForHarvestTx *
                numGweiInWei *
                ethMainnetUsdPrice;

            setHarvestGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewHarvestTransactionHash('');
        setTxErrorCode('');
    };

    const positionStatsCacheEndpoint =
        GRAPHCACHE_SMALL_URL + '/position_stats?';
    const dispatch = useAppDispatch();

    const positionsPendingUpdate = useAppSelector(
        (state) => state.receiptData,
    ).positionsPendingUpdate;

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
                        setFeeLiqBaseDecimalCorrected(
                            json?.data?.feesLiqBaseDecimalCorrected,
                        );
                        setFeeLiqQuoteDecimalCorrected(
                            json?.data?.feesLiqQuoteDecimalCorrected,
                        );
                    });
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

    const harvestFn = async () => {
        setShowConfirmation(true);
        if (!crocEnv) {
            location.reload();
            return;
        }
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
                setNewHarvestTransactionHash(tx?.hash);
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
                setNewHarvestTransactionHash(newTransactionHash);
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

    const positionType = 'concentrated';

    const feesGreaterThanZero =
        (feeLiqBaseDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0) >
        0;

    const harvestButtonOrNull = isPositionPendingUpdate ? (
        <HarvestPositionButton
            disabled={true}
            harvestFn={harvestFn}
            title={'Position Update Pending…'}
        />
    ) : positionType === 'concentrated' &&
      feesGreaterThanZero &&
      !showSettings ? (
        <HarvestPositionButton harvestFn={harvestFn} title={'Harvest Fees'} />
    ) : (
        <HarvestPositionButton
            disabled={true}
            harvestFn={harvestFn}
            title={'…'}
        />
    );

    const removalPercentage = 100;

    const baseRemovalNum =
        ((feeLiqBaseDecimalCorrected || 0) * removalPercentage) / 100;

    const quoteRemovalNum =
        ((feeLiqQuoteDecimalCorrected || 0) * removalPercentage) / 100;

    // confirmation modal
    const removalDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );

    const removalSuccess = (
        <TxSubmittedSimplify
            hash={newHarvestTransactionHash}
            content='Harvest Transaction Successfully Submitted!'
        />
    );

    const removalPending = (
        <WaitingConfirmation
            content={`Submitting harvest rewards transaction for ${position.baseSymbol} and ${position.quoteSymbol}.`}
        />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(removalPending);

    const transactionApproved = newHarvestTransactionHash !== '';
    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode !== '' && !isTransactionDenied;

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    function handleConfirmationChange() {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isTransactionDenied) {
            setCurrentConfirmationData(removalDenied);
        } else if (isTransactionException) {
            setCurrentConfirmationData(transactionException);
        }
    }

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        newHarvestTransactionHash,
        txErrorCode,
        showConfirmation,
        isTransactionDenied,
    ]);

    const mainModalContent = showSettings ? (
        <HarvestPositionSettings
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
                <HarvestPositionTokenHeader
                    isPositionInRange={props.isPositionInRange}
                    isAmbient={props.isAmbient}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                    isDenomBase={props.isDenomBase}
                />
                <div
                    onClick={() => setShowSettings(!showSettings)}
                    className={styles.settings_icon}
                >
                    {showSettings ? null : <RiListSettingsLine size={20} />}
                </div>
            </div>
            <div style={{ padding: '0 1rem' }}>
                <HarvestPositionInfo
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                    posLiqBaseDecimalCorrected={
                        position.positionLiqBaseDecimalCorrected
                    }
                    posLiqQuoteDecimalCorrected={
                        position.positionLiqQuoteDecimalCorrected
                    }
                    feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
                    feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
                    baseRemovalNum={baseRemovalNum}
                    quoteRemovalNum={quoteRemovalNum}
                    removalPercentage={removalPercentage}
                />
                <HarvestExtraControls />
            </div>
            <div className={styles.gas_pump}>
                <FaGasPump size={15} />
                {harvestGasPriceinDollars ? harvestGasPriceinDollars : '…'}
            </div>
        </>
    );

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            <HarvestPositionHeader
                onClose={handleModalClose}
                title={
                    showSettings ? 'Harvest Settings' : 'Harvest Confirmation'
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

    if (showConfirmation) return confirmationContent;

    return (
        <>
            <HarvestPositionHeader
                onClose={handleModalClose}
                title={showSettings ? 'Harvest Settings' : 'Harvest Rewards'}
                onBackButton={() => {
                    resetConfirmation();
                    setShowSettings(false);
                }}
                showBackButton={showSettings}
            />
            <div className={styles.remove_range_container}>
                <div className={styles.main_content}>
                    {mainModalContent}
                    <div style={{ padding: '0 1rem' }}>
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
                        ) : (
                            harvestButtonOrNull
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
