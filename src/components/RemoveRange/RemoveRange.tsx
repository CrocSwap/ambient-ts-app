import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeTokenHeader from './RemoveRangeTokenHeader/RemoveRangeTokenHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useEffect, useState } from 'react';

import { VscClose } from 'react-icons/vsc';
import { BsArrowLeft } from 'react-icons/bs';
import { PositionIF } from '../../utils/interfaces/exports';
import { ethers } from 'ethers';
import {
    ambientPosSlot,
    ChainSpec,
    concPosSlot,
    CrocEnv,
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
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import TxSubmittedSimplify from '../Global/TransactionSubmitted/TxSubmiitedSimplify';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider;
    chainData: ChainSpec;
    chainId: string;
    poolIdx: number;
    user: string;
    bidTick: number;
    askTick: number;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
    position: PositionIF;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    dexBalancePrefs: allDexBalanceMethodsIF;
    handleModalClose: () => void;
}

export default function RemoveRange(props: propsIF) {
    const { handleModalClose, crocEnv, chainData, position, dexBalancePrefs } =
        props;

    const lastBlockNumber = useAppSelector(
        (state) => state.graphData,
    ).lastBlock;

    const [removalPercentage, setRemovalPercentage] = useState(100);

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] =
        useState<number | undefined>();

    const positionStatsCacheEndpoint =
        'https://809821320828123.de:5000/position_stats?';

    const dispatch = useAppDispatch();

    const positionsPendingUpdate = useAppSelector(
        (state) => state.receiptData,
    ).positionsPendingUpdate;

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
                            console.log('setting base token wallet balance');
                            setBaseTokenBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(position.base)
                    .balanceDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== baseTokenDexBalance) {
                            console.log('setting base token dex balance');
                            setBaseTokenDexBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(position.quote)
                    .walletDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== quoteTokenBalance) {
                            console.log('setting quote token balance');

                            setQuoteTokenBalance(bal);
                        }
                    })
                    .catch(console.log);
                crocEnv
                    .token(position.quote)
                    .balanceDisplay(position.user)
                    .then((bal: string) => {
                        if (bal !== quoteTokenDexBalance) {
                            console.log('setting quote token dex balance');

                            setQuoteTokenDexBalance(bal);
                        }
                    })
                    .catch(console.log);
            }
        })();
    }, [
        crocEnv,
        position.user,
        position.base,
        position.quote,
        lastBlockNumber,
    ]);

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
                // console.log('fetching details');
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
                        console.log({ json });
                        setPosLiqBaseDecimalCorrected(
                            json?.data?.positionLiqBaseDecimalCorrected,
                        );
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected,
                        );
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

    const [showSettings, setShowSettings] = useState(false);

    const positionHasLiquidity =
        (posLiqBaseDecimalCorrected || 0) + (posLiqQuoteDecimalCorrected || 0) >
        0;

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

    const liquiditySlippageTolerance = 1;

    const posHash =
        position.positionType === 'ambient'
            ? ambientPosSlot(
                  position.user,
                  position.base,
                  position.quote,
                  chainData.poolIndex,
              )
            : concPosSlot(
                  position.user,
                  position.base,
                  position.quote,
                  position.bidTick,
                  position.askTick,
                  chainData.poolIndex,
              );

    const isPositionPendingUpdate =
        positionsPendingUpdate.indexOf(posHash as string) > -1;

    const removeFn = async () => {
        if (!crocEnv) return;
        console.log('removing');
        setShowConfirmation(true);

        const pool = crocEnv.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);

        dispatch(addPositionPendingUpdate(posHash as string));

        let tx;
        if (position.positionType === 'ambient') {
            if (removalPercentage === 100) {
                console.log(`${removalPercentage}% to be removed.`);
                try {
                    tx = await pool.burnAmbientAll([lowLimit, highLimit], {
                        surplus: dexBalancePrefs.range.outputToDexBal.isEnabled,
                    });
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    console.log({ error });
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                }
            } else {
                const positionLiq = position.positionLiq;

                const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                    .mul(removalPercentage)
                    .div(100);

                try {
                    tx = await pool.burnAmbientLiq(liquidityToBurn, [
                        lowLimit,
                        highLimit,
                    ]);
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    if (
                        error.reason ===
                        'sending a transaction requires a signer'
                    ) {
                        location.reload();
                    }
                    console.log({ error });
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                }
            }
        } else if (position.positionType === 'concentrated') {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                .div(100);
            console.log(`${removalPercentage}% to be removed.`);

            try {
                tx = await pool.burnRangeLiq(
                    liquidityToBurn,
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalancePrefs.range.outputToDexBal.isEnabled },
                );
                console.log(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewRemovalTransactionHash(tx?.hash);
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: 'Removal',
                        }),
                    );
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.log({ error });
                dispatch(removePositionPendingUpdate(posHash as string));
                setTxErrorCode(error?.code);
                // setTxErrorMessage(error?.message);
                dispatch(removePositionPendingUpdate(posHash as string));
            }
        } else {
            console.log('unsupported position type for removal');
        }

        const newLiqChangeCacheEndpoint =
            'https://809821320828123.de:5000/new_liqchange?';
        if (tx?.hash) {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                .div(100);

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
            console.log({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                console.log('repriced');
                dispatch(removePendingTx(error.hash));
                const newTransactionHash = error.replacement.hash;
                setNewRemovalTransactionHash(newTransactionHash);
                dispatch(addPendingTx(newTransactionHash));
                console.log({ newTransactionHash });
                receipt = error.receipt;

                if (newTransactionHash) {
                    const positionLiq = position.positionLiq;

                    const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                        .mul(removalPercentage)
                        .div(100);

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
            console.log('dispatching receipt');
            console.log({ receipt });
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
            content='Removal Transaction Successfully Submitted.'
        />
    );

    const removalPending = (
        <WaitingConfirmation
            content={`Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(removalPending);

    const transactionApproved = newRemovalTransactionHash !== '';

    const isRemovalDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    function handleConfirmationChange() {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isRemovalDenied) {
            setCurrentConfirmationData(removalDenied);
        } else if (
            isTransactionException ||
            isGasLimitException ||
            isInsufficientFundsException
        ) {
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
            {showConfirmation && (
                <header>
                    <div className={styles.button} onClick={resetConfirmation}>
                        {newRemovalTransactionHash == '' && (
                            <BsArrowLeft size={30} />
                        )}
                    </div>
                    {newRemovalTransactionHash !== '' && (
                        <div onClick={handleModalClose}>
                            <VscClose size={30} />
                        </div>
                    )}
                </header>
            )}
            <div className={styles.confirmation_content}>
                {currentConfirmationData}
            </div>
        </div>
    );

    const buttonToDisplay = (
        <div style={{ padding: '1rem' }}>
            {showSettings ? (
                <Button
                    title='Confirm'
                    action={() => setShowSettings(false)}
                    flat
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
            showSettings={showSettings}
            setShowSettings={setShowSettings}
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
                    isDenomBase={props.isDenomBase}
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
                />
                <ExtraControls dexBalancePrefs={dexBalancePrefs} />
            </div>
        </>
    );

    if (showConfirmation) return confirmationContent;
    return (
        <div className={styles.remove_range_container}>
            <div className={styles.main_content}>
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
                {mainModalContent}
                {buttonToDisplay}
            </div>
        </div>
    );
}
