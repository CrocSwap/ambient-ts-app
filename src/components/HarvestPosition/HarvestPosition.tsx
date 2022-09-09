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
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import HarvestPositionHeader from './HarvestPositionHeader/HarvestPositionHeader';
import HavrestExtraControls from './HarvestExtraControls/HarvestExtraControls';

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
                            calcValues: 'true',
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

    const harvestFn = async () => {
        console.log('100% of fees to be removed.');
        setShowConfirmation(true);
        if (!crocEnv) return;
        const env = crocEnv;
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);

        if (position.positionType === 'concentrated') {
            try {
                const tx = await pool.harvestRange(
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                );
                console.log(tx?.hash);
                setNewHarvestTransactionHash(tx?.hash);
            } catch (error) {
                setTxErrorCode(error?.code);
                setTxErrorMessage(error?.message);
            }
        } else {
            console.log('unsupported position type for harvest');
        }
    };

    const positionType = 'concentrated';

    const feesGreaterThanZero =
        (feeLiqBaseDecimalCorrected || 0) + (feeLiqQuoteDecimalCorrected || 0) > 0;

    const harvestButtonOrNull =
        positionType === 'concentrated' && feesGreaterThanZero && !showSettings ? (
            <HarvestPositionButton harvestFn={harvestFn} title={'Harvest Fees'} />
        ) : (
            <HarvestPositionButton disabled={true} harvestFn={harvestFn} title={'…'} />
        );

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
            <p>
                Check the Metamask extension in your browser for notifications. Make sure your
                browser is not blocking pop-up windows.
            </p>
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

    const buttonToDisplay = showSettings ? (
        <Button title='Confirm' action={() => setShowSettings(false)} />
    ) : (
        harvestButtonOrNull
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
            <HarvestPositionInfo
                baseTokenSymbol={props.baseTokenSymbol}
                quoteTokenSymbol={props.quoteTokenSymbol}
                baseTokenLogoURI={baseTokenLogoURI}
                quoteTokenLogoURI={quoteTokenLogoURI}
                posLiqBaseDecimalCorrected={position.positionLiqBaseDecimalCorrected}
                posLiqQuoteDecimalCorrected={position.positionLiqQuoteDecimalCorrected}
                feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
                feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
                // removalPercentage={removalPercentage}
                removalPercentage={100}
            />
            <HavrestExtraControls
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
            />
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
