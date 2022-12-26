import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeTokenHeader from './RemoveRangeTokenHeader/RemoveRangeTokenHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useEffect, useState } from 'react';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';

// import RemoveRangeSettings from './RemoveRangeSettings/RemoveRangeSettings';
import { RiListSettingsLine } from 'react-icons/ri';
import { BsArrowLeft } from 'react-icons/bs';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import { ethers } from 'ethers';
import { ambientPosSlot, ChainSpec, concPosSlot, CrocEnv } from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';

import RemoveRangeSettings from './RemoveRangeSettings/RemoveRangeSettings';
// import {
//     // CircleLoader,
//     // CircleLoaderFailed,
// } from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import ExtraControls from './ExtraControls/ExtraControls';
import {
    addPendingTx,
    addPositionPendingUpdate,
    addReceipt,
    removePendingTx,
    removePositionPendingUpdate,
} from '../../utils/state/receiptDataSlice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../utils/TransactionError';
import WithdrawAs from './WithdrawAs/WithdrawAs';
import WithdrawTo from './WithdrawTo/WithdrawTo';
import WaitingConfirmation from '../Global/WaitingConfirmation/WaitingConfirmation';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
interface IRemoveRangeProps {
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
    // lastBlockNumber: number;
    position: PositionIF;

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;
}

export default function RemoveRange(props: IRemoveRangeProps) {
    // console.log(props);
    const {
        // chainId,
        // poolIdx,
        // user,
        // bidTick,
        // askTick,
        // baseTokenAddress,
        // quoteTokenAddress,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        closeGlobalModal,
        chainData,
        provider,
        // lastBlockNumber,
        position,
    } = props;

    const lastBlockNumber = useAppSelector((state) => state.graphData).lastBlock;

    const [removalPercentage, setRemovalPercentage] = useState(100);

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();

    const positionStatsCacheEndpoint = 'https://809821320828123.de:5000/position_stats?';

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
                // console.log('fetching details');
                fetch(
                    positionStatsCacheEndpoint +
                        new URLSearchParams({
                            chainId: position.chainId,
                            user: position.user,
                            base: position.base,
                            quote: position.quote,
                            poolIdx: position.poolIdx.toString(),
                            bidTick: position.bidTick ? position.bidTick.toString() : '0',
                            askTick: position.askTick ? position.askTick.toString() : '0',
                            addValue: 'true',
                            positionType: position.positionType,
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        console.log({ json });
                        setPosLiqBaseDecimalCorrected(json?.data?.positionLiqBaseDecimalCorrected);
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected,
                        );
                        setFeeLiqBaseDecimalCorrected(json?.data?.feesLiqBaseDecimalCorrected);
                        setFeeLiqQuoteDecimalCorrected(json?.data?.feesLiqQuoteDecimalCorrected);
                    });
            })();
        }
    }, [lastBlockNumber]);

    const [showSettings, setShowSettings] = useState(false);

    const positionHasLiquidity =
        (posLiqBaseDecimalCorrected || 0) + (posLiqQuoteDecimalCorrected || 0) > 0;

    const removeRangeSetttingIcon = (
        <div onClick={() => setShowSettings(!showSettings)} className={styles.settings_icon}>
            {showSettings ? null : <RiListSettingsLine size={20} />}
        </div>
    );

    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newRemovalTransactionHash, setNewRemovalTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setNewRemovalTransactionHash('');
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

    useEffect(() => {
        if (!showConfirmation) {
            resetConfirmation();
        }
    }, [txErrorCode]);

    const liquiditySlippageTolerance = 1;

    const posHash =
        position.positionType === 'ambient'
            ? ambientPosSlot(position.user, position.base, position.quote, chainData.poolIndex)
            : concPosSlot(
                  position.user,
                  position.base,
                  position.quote,
                  position.bidTick,
                  position.askTick,
                  chainData.poolIndex,
              );

    const isPositionPendingUpdate = positionsPendingUpdate.indexOf(posHash as string) > -1;

    const removeFn = async () => {
        setShowConfirmation(true);

        const env = new CrocEnv(provider);
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);
        // console.log({ position });

        dispatch(addPositionPendingUpdate(posHash as string));

        let tx;
        if (position.positionType === 'ambient') {
            if (removalPercentage === 100) {
                console.log(`${removalPercentage}% to be removed.`);
                try {
                    tx = await pool.burnAmbientAll([lowLimit, highLimit], {
                        surplus: isSaveAsDexSurplusChecked,
                    });
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(error?.message);
                }
            } else {
                const positionLiq = position.positionLiq;

                const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                    .mul(removalPercentage)
                    .div(100);

                try {
                    tx = await pool.burnAmbientLiq(liquidityToBurn, [lowLimit, highLimit]);
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    dispatch(removePositionPendingUpdate(posHash as string));
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(error?.message);
                }
            }
        } else if (position.positionType === 'concentrated') {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                // .mul(removalPercentage === 100 ? 99 : removalPercentage)
                .div(100);
            console.log(`${removalPercentage}% to be removed.`);

            // console.log({ removalPercentage });
            // console.log({ liquidityToBurn });
            // console.log({ lowLimit });
            // console.log({ highLimit });
            // console.log({ isSaveAsDexSurplusChecked });
            // console.log(position.bidTick);
            // console.log(position.askTick);

            try {
                tx = await pool.burnRangeLiq(
                    liquidityToBurn,
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: isSaveAsDexSurplusChecked },
                );
                console.log(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewRemovalTransactionHash(tx?.hash);
            } catch (error) {
                dispatch(removePositionPendingUpdate(posHash as string));
                setTxErrorCode(error?.code);
                setTxErrorMessage(error?.message);
                dispatch(removePositionPendingUpdate(posHash as string));
            }
        } else {
            console.log('unsupported position type for removal');
        }

        const newLiqChangeCacheEndpoint = 'https://809821320828123.de:5000/new_liqchange?';
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
                            // bidTick: '0',
                            // askTick: '0',
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
                                    // bidTick: '0',
                                    // askTick: '0',
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
                // console.log({ error });
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
    const removalDenied = <TransactionDenied resetConfirmation={resetConfirmation} />;

    // const removalDenied = (
    //     <div className={styles.removal_pending}>
    //         <CircleLoaderFailed />
    //         <p>
    //             Check the Metamask extension in your browser for notifications, or click &quot;Try
    //             Again&quot;. You can also click the left arrow above to try again.
    //         </p>
    //         <Button title='Try Again' action={resetConfirmation} flat={true} />
    //     </div>
    // );

    const etherscanLink = chainData.blockExplorer + 'tx/' + newRemovalTransactionHash;

    const removalSuccess = (
        <div className={styles.removal_pending}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <p>Removal Transaction Successfully Submitted</p>
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
        <WaitingConfirmation
            content={`Please check the ${'Metamask'} extension in your browser for notifications.`}
        />
    );

    // const removalPending = (
    //     <div className={styles.removal_pending}>
    //         <CircleLoader size='5rem' borderColor='#171d27' />
    //         <p>Check the Metamask extension in your browser for notifications.</p>
    //     </div>
    // );

    const [currentConfirmationData, setCurrentConfirmationData] = useState(removalPending);

    const transactionApproved = newRemovalTransactionHash !== '';

    const isRemovalDenied =
        txErrorCode === 4001 &&
        txErrorMessage === 'MetaMask Tx Signature: User denied transaction signature.';

    function handleConfirmationChange() {
        setCurrentConfirmationData(removalPending);

        if (transactionApproved) {
            setCurrentConfirmationData(removalSuccess);
        } else if (isRemovalDenied) {
            setCurrentConfirmationData(removalDenied);
        }
    }

    useEffect(() => {
        handleConfirmationChange();
    }, [
        transactionApproved,
        // removalDenied,
        newRemovalTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

    const baseRemovalNum =
        (((posLiqBaseDecimalCorrected || 0) + (feeLiqBaseDecimalCorrected || 0)) *
            removalPercentage) /
        100;

    const quoteRemovalNum =
        (((posLiqQuoteDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0)) *
            removalPercentage) /
        100;

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            {showConfirmation && (
                // {showConfirmation && !removalDenied && (
                <div className={styles.button} onClick={resetConfirmation}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>{currentConfirmationData}</div>
        </div>
    );

    const buttonToDisplay = (
        <div style={{ padding: '0 1rem' }}>
            {showSettings ? (
                <Button title='Confirm' action={() => setShowSettings(false)} flat={true} />
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
                <RemoveRangeButton removeFn={removeFn} disabled={true} title='…' />
            )}
        </div>
    );

    const mainModalContent = showSettings ? (
        <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} />
    ) : (
        <>
            <div className={styles.header_container}>
                <RemoveRangeTokenHeader
                    isPositionInRange={props.isPositionInRange}
                    isAmbient={props.isAmbient}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    isDenomBase={props.isDenomBase}
                />
                {removeRangeSetttingIcon}
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
                <WithdrawAs />
                <WithdrawTo />
                <ExtraControls
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    baseTokenBalance={baseTokenBalance}
                    quoteTokenBalance={quoteTokenBalance}
                    baseTokenDexBalance={baseTokenDexBalance}
                    quoteTokenDexBalance={quoteTokenDexBalance}
                    baseRemovalNum={baseRemovalNum}
                    quoteRemovalNum={quoteRemovalNum}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                />
            </div>
        </>
    );

    if (showConfirmation) return confirmationContent;
    return (
        <div className={styles.remove_range_container}>
            <div className={styles.main_content}>
                <RemoveRangeHeader
                    onClose={closeGlobalModal}
                    title={showSettings ? 'Remove Position Settings' : 'Remove Position'}
                    onBackButton={() => {
                        resetConfirmation();
                        setShowSettings(false);
                    }}
                    showBackButton={showSettings}
                />
                {mainModalContent}
                {/* {harvestButtonOrNull} */}
                {buttonToDisplay}
            </div>
        </div>
    );
}
