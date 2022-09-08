import styles from './HarvestPosition.module.css';
// import HarvestPositionWidth from './HarvestPositionWidth/HarvestPositionWidth';
import HarvestPositionHeader from './HarvestPositionHeader/HarvestPositionHeader';
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
import { CrocEnv } from '@crocswap-libs/sdk';

interface IHarvestPositionProps {
    crocEnv: CrocEnv | undefined;
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
}
export default function HarvestPosition(props: IHarvestPositionProps) {
    const {
        crocEnv,
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
                // setNewRemovalTransactionHash(tx?.hash);
            } catch (error) {
                // setTxErrorCode(error?.code);
                // setTxErrorMessage(error?.message);
            }
        } else {
            console.log('unsupported position type for harvest');
        }
    };

    const positionType = 'concentrated';

    const feesGreaterThanZero =
        feeLiqBaseDecimalCorrected && feeLiqQuoteDecimalCorrected
            ? feeLiqBaseDecimalCorrected + feeLiqQuoteDecimalCorrected > 0
            : false;

    const harvestButtonOrNull =
        positionType === 'concentrated' && feesGreaterThanZero && !showSettings ? (
            <HarvestPositionButton harvestFn={harvestFn} title={'Harvest Fees'} />
        ) : (
            <HarvestPositionButton
                disabled={true}
                harvestFn={harvestFn}
                title={'No Fees to Harvest'}
            />
        );

    // confirmation modal
    const removalDenied = (
        <div className={styles.removal_pending}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to try again.
            </p>
            <Button title='Try Again' action={() => setShowConfirmation(false)} />
        </div>
    );

    const removalSuccess = (
        <div className={styles.removal_pending}>
            <div className={styles.completed_animation}>
                <Animation animData={completed} loop={false} />
            </div>
            <p>message to be display here</p>
            <a
                href={newHarvestTransactionHash}
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
                <div className={styles.button} onClick={() => setShowConfirmation(false)}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>{currentConfirmationData}</div>
        </div>
    );

    const mainModalContent = showSettings ? (
        <HarvestPositionSettings showSettings={showSettings} setShowSettings={setShowSettings} />
    ) : (
        <>
            <div className={styles.header_container}>
                <HarvestPositionHeader
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
        </>
    );

    if (showConfirmation) return confirmationContent;

    return (
        <div className={styles.remove_range_container}>
            {/* {removeRangeSettingsPage} */}
            {/* <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} /> */}

            <div className={styles.main_content}>
                {mainModalContent}
                {/* {harvestButtonOrNull} */}
                {buttonToDisplay}
            </div>
        </div>
    );
}
