import styles from './HarvestPosition.module.css';
import HarvestPositionTokenHeader from './HarvestPositionTokenHeader/HarvestPositionTokenHeader';
import HarvestPositionInfo from './HarvestPositionInfo/HarvestPositionInfo';
import HarvestPositionButton from './HarvestPositionButton/HarvestPositionButton';
import { useEffect, useState } from 'react';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { RiListSettingsLine } from 'react-icons/ri';
import { BsArrowLeft } from 'react-icons/bs';
import { PositionIF } from '../../utils/interfaces/exports';
import { ethers } from 'ethers';
import Button from '../Global/Button/Button';
import HarvestPositionSettings from './HarvestPositionSettings/HarvestPositionSettings';
import {
    CircleLoader,
    CircleLoaderFailed,
} from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import {
    ambientPosSlot,
    ChainSpec,
    concPosSlot,
    CrocEnv,
} from '@crocswap-libs/sdk';
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
    removePendingTx,
    removePositionPendingUpdate,
} from '../../utils/state/receiptDataSlice';
import TransactionException from '../Global/TransactionException/TransactionException';
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider;
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
    closeGlobalModal: () => void;
    dexBalancePrefs: allDexBalanceMethodsIF;
    handleModalClose: () => void;
}

export default function HarvestPosition(props: propsIF) {
    const {
        crocEnv,
        chainData,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        position,
        dexBalancePrefs,
        handleModalClose,
    } = props;

    // settings
    const [showSettings, setShowSettings] = useState(false);

    const lastBlockNumber = useAppSelector(
        (state) => state.graphData,
    ).lastBlock;

    const [showConfirmation, setShowConfirmation] = useState(false);
    // eslint-disable-next-line
    const [newHarvestTransactionHash, setNewHarvestTransactionHash] =
        useState('');
    // eslint-disable-next-line
    const [txErrorCode, setTxErrorCode] = useState('');
    // eslint-disable-next-line
    // const [txErrorMessage, setTxErrorMessage] = useState('');

    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] =
        useState<number | undefined>();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] =
        useState<number | undefined>();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewHarvestTransactionHash('');
        setTxErrorCode('');
    };

    const positionStatsCacheEndpoint =
        'https://809821320828123.de:5000/position_stats?';
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

    const harvestFn = async () => {
        setShowConfirmation(true);
        if (!crocEnv) return;
        const env = crocEnv;
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);

        let tx;
        if (position.positionType === 'concentrated') {
            try {
                console.log('Harvesting 100% of fees.');
                dispatch(addPositionPendingUpdate(posHash as string));
                tx = await pool.harvestRange(
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: dexBalancePrefs.range.outputToDexBal.isEnabled },
                );
                console.log(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewHarvestTransactionHash(tx?.hash);
            } catch (error) {
                console.log('caught error');
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
            console.log('unsupported position type for harvest');
        }

        const newLiqChangeCacheEndpoint =
            'https://809821320828123.de:5000/new_liqchange?';
        if (tx?.hash) {
            fetch(
                newLiqChangeCacheEndpoint +
                    new URLSearchParams({
                        chainId: position.chainId,
                        tx: tx.hash,
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
                        positionType: position.positionType,
                        changeType: 'harvest',
                    }),
            );
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
                setNewHarvestTransactionHash(newTransactionHash);
                dispatch(addPendingTx(newTransactionHash));
                console.log({ newTransactionHash });

                receipt = error.receipt;

                if (newTransactionHash) {
                    fetch(
                        newLiqChangeCacheEndpoint +
                            new URLSearchParams({
                                chainId: position.chainId,
                                tx: newTransactionHash,
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
                                positionType: position.positionType,
                                changeType: 'harvest',
                            }),
                    );
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
        <div className={styles.removal_denied}>
            <CircleLoaderFailed size='10rem' />
            <p>
                Check the Metamask extension in your browser for notifications,
                or click &quot;Try Again&quot;. You can also click the left
                arrow above to try again.
            </p>
            <Button title='Try Again' action={resetConfirmation} flat />
        </div>
    );

    const etherscanLink =
        chainData.blockExplorer + 'tx/' + newHarvestTransactionHash;

    const removalSuccess = (
        <div className={styles.removal_denied}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
                <p>Harvest Transaction Successfully Submitted!</p>
            </div>
            <a
                href={etherscanLink}
                target='_blank'
                rel='noreferrer'
                className={styles.view_etherscan}
            >
                View on Etherscan
                <FiExternalLink size={20} color='black' />
            </a>
        </div>
    );

    const removalPending = (
        <div className={styles.removal_pending}>
            <CircleLoader size='10rem' borderColor='#171d27' />
            <p>
                Check the Metamask extension in your browser for notifications.
            </p>
        </div>
    );

    const [currentConfirmationData, setCurrentConfirmationData] =
        useState(removalPending);

    const transactionApproved = newHarvestTransactionHash !== '';

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
        isRemovalDenied,
    ]);

    const mainModalContent = showSettings ? (
        <HarvestPositionSettings
            showSettings={showSettings}
            setShowSettings={setShowSettings}
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
                <HarvestExtraControls dexBalancePrefs={dexBalancePrefs} />
            </div>
        </>
    );

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            {showConfirmation && (
                <div className={styles.button} onClick={resetConfirmation}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>
                {currentConfirmationData}
            </div>
        </div>
    );

    if (showConfirmation) return confirmationContent;

    return (
        <div className={styles.remove_range_container}>
            <div className={styles.main_content}>
                <HarvestPositionHeader
                    onClose={handleModalClose}
                    title={
                        showSettings
                            ? 'Harvest Position Settings'
                            : 'Harvest Position'
                    }
                    onBackButton={() => {
                        resetConfirmation();
                        setShowSettings(false);
                    }}
                    showBackButton={showSettings}
                />
                {mainModalContent}
                <div style={{ padding: '0 1rem' }}>
                    {showSettings ? (
                        <Button
                            title='Confirm'
                            action={() => setShowSettings(false)}
                            flat
                        />
                    ) : (
                        harvestButtonOrNull
                    )}
                </div>
            </div>
        </div>
    );
}
