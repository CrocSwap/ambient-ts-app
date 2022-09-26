import styles from './HarvestPosition.module.css';
// import HarvestPositionWidth from './HarvestPositionWidth/HarvestPositionWidth';
import HarvestPositionTokenHeader from './HarvestPositionTokenHeader/HarvestPositionTokenHeader';
import HarvestPositionInfo from './HarvestPositionInfo/HarvestPositionInfo';
import HarvestPositionButton from './HarvestPositionButton/HarvestPositionButton';
import { useEffect, useState } from 'react';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';

// import HarvestPositionSettings from './HarvestPositionSettings/HarvestPositionSettings';
import { RiListSettingsLine } from 'react-icons/ri';
import { BsArrowLeft } from 'react-icons/bs';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import { ethers } from 'ethers';
// import { CrocEnv } from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';

import HarvestPositionSettings from './HarvestPositionSettings/HarvestPositionSettings';
import {
    CircleLoader,
    CircleLoaderFailed,
} from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import { ambientPosSlot, ChainSpec, concPosSlot, CrocEnv } from '@crocswap-libs/sdk';
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

interface IHarvestPositionProps {
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
    lastBlockNumber: number;
    position: PositionIF;
    closeGlobalModal: () => void;
}
export default function HarvestPosition(props: IHarvestPositionProps) {
    const {
        crocEnv,
        chainData,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        // chainId,
        // poolIdx,
        // user,
        // bidTick,
        // askTick,
        // baseTokenAddress,
        // quoteTokenAddress,
        // provider,
        lastBlockNumber,
        closeGlobalModal,
        position,
    } = props;

    // settings
    const [showSettings, setShowSettings] = useState(false);

    const harvestPositionSetttingIcon = (
        <div onClick={() => setShowSettings(!showSettings)} className={styles.settings_icon}>
            {showSettings ? null : <RiListSettingsLine size={20} />}
        </div>
    );

    // const [removalPercentage, setRemovalPercentage] = useState(100);

    const [showConfirmation, setShowConfirmation] = useState(false);
    // eslint-disable-next-line
    const [newHarvestTransactionHash, setNewHarvestTransactionHash] = useState('');
    // eslint-disable-next-line
    const [txErrorCode, setTxErrorCode] = useState(0);
    // eslint-disable-next-line
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();

    const resetConfirmation = () => {
        setShowConfirmation(false);
        setTxErrorCode(0);
        setTxErrorMessage('');
    };

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
                        setFeeLiqBaseDecimalCorrected(json?.data?.feesLiqBaseDecimalCorrected);
                        setFeeLiqQuoteDecimalCorrected(json?.data?.feesLiqQuoteDecimalCorrected);
                    });
            })();
        }
    }, [lastBlockNumber]);

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

    const harvestFn = async () => {
        console.log('100% of fees to be removed.');
        dispatch(addPositionPendingUpdate(posHash as string));
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
                tx = await pool.harvestRange(
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                    { surplus: isSaveAsDexSurplusChecked },
                );
                console.log(tx?.hash);
                dispatch(addPendingTx(tx?.hash));
                setNewHarvestTransactionHash(tx?.hash);
            } catch (error) {
                setTxErrorCode(error?.code);
                setTxErrorMessage(error?.message);
            }
        } else {
            console.log('unsupported position type for harvest');
        }

        const newLiqChangeCacheEndpoint = 'https://809821320828123.de:5000/new_liqchange?';
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
                        bidTick: position.bidTick ? position.bidTick.toString() : '0',
                        askTick: position.askTick ? position.askTick.toString() : '0',
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
                                bidTick: position.bidTick ? position.bidTick.toString() : '0',
                                askTick: position.askTick ? position.askTick.toString() : '0',
                                positionType: position.positionType,
                                changeType: 'harvest',
                            }),
                    );
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

    const positionType = 'concentrated';

    const feesGreaterThanZero =
        (feeLiqBaseDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0) > 0;

    const harvestButtonOrNull = isPositionPendingUpdate ? (
        <HarvestPositionButton
            disabled={true}
            harvestFn={harvestFn}
            title={'Position Update Pending…'}
        />
    ) : positionType === 'concentrated' && feesGreaterThanZero && !showSettings ? (
        <HarvestPositionButton harvestFn={harvestFn} title={'Harvest Fees'} />
    ) : (
        <HarvestPositionButton disabled={true} harvestFn={harvestFn} title={'…'} />
    );

    const removalPercentage = 100;

    const baseRemovalNum = ((feeLiqBaseDecimalCorrected || 0) * removalPercentage) / 100;

    const quoteRemovalNum = ((feeLiqQuoteDecimalCorrected || 0) * removalPercentage) / 100;

    // confirmation modal
    const removalDenied = (
        <div className={styles.removal_pending}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to try again.
            </p>
            <Button title='Try Again' action={resetConfirmation} />
        </div>
    );

    const etherscanLink = chainData.blockExplorer + 'tx/' + newHarvestTransactionHash;

    const removalSuccess = (
        <div className={styles.removal_pending}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <p>Harvest Transaction Successfully Submitted</p>
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
            <CircleLoader size='5rem' borderColor='#171d27' />
            <p>Check the Metamask extension in your browser for notifications.</p>
        </div>
    );

    const [currentConfirmationData, setCurrentConfirmationData] = useState(removalPending);

    const transactionApproved = newHarvestTransactionHash !== '';

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
        newHarvestTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

    const buttonToDisplay = (
        <div style={{ padding: '0 1rem' }}>
            {showSettings ? (
                <Button title='Confirm' action={() => setShowSettings(false)} />
            ) : (
                harvestButtonOrNull
            )}
        </div>
    );

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            {showConfirmation && (
                <div className={styles.button} onClick={resetConfirmation}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>{currentConfirmationData}</div>
        </div>
    );
    const [isSaveAsDexSurplusChecked, setIsSaveAsDexSurplusChecked] = useState(false);

    const mainModalContent = showSettings ? (
        <HarvestPositionSettings showSettings={showSettings} setShowSettings={setShowSettings} />
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
                {harvestPositionSetttingIcon}
            </div>
            {/* <HarvestPositionWidth
                removalPercentage={removalPercentage}
                setRemovalPercentage={setRemovalPercentage}
            /> */}
            <div style={{ padding: '0 1rem' }}>
                <HarvestPositionInfo
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={baseTokenLogoURI}
                    quoteTokenLogoURI={quoteTokenLogoURI}
                    posLiqBaseDecimalCorrected={position.positionLiqBaseDecimalCorrected}
                    posLiqQuoteDecimalCorrected={position.positionLiqQuoteDecimalCorrected}
                    feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
                    feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
                    baseRemovalNum={baseRemovalNum}
                    quoteRemovalNum={quoteRemovalNum}
                    removalPercentage={removalPercentage}
                />
                <HarvestExtraControls
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseRemovalNum={baseRemovalNum}
                    quoteRemovalNum={quoteRemovalNum}
                    baseTokenBalance={baseTokenBalance}
                    quoteTokenBalance={quoteTokenBalance}
                    baseTokenDexBalance={baseTokenDexBalance}
                    quoteTokenDexBalance={quoteTokenDexBalance}
                />
            </div>
        </>
    );

    if (showConfirmation) return confirmationContent;

    return (
        <div className={styles.remove_range_container}>
            {/* {removeRangeSettingsPage} */}
            {/* <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} /> */}

            <div className={styles.main_content}>
                <HarvestPositionHeader
                    onClose={closeGlobalModal}
                    title={showSettings ? 'Harvest Position Settings' : 'Harvest Position'}
                    onBackButton={() => setShowSettings(false)}
                    showBackButton={showSettings}
                />
                {mainModalContent}
                {/* {harvestButtonOrNull} */}
                {buttonToDisplay}
            </div>
        </div>
    );
}
