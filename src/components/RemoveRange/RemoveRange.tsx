import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
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
import { CrocEnv } from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';

import RemoveRangeSettings from './RemoveRangeSettings/RemoveRangeSettings';
import TransactionDenied from '../Global/TransactionDenied/TransactionDenied';
import {
    CircleLoader,
    CircleLoaderFailed,
} from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
interface IRemoveRangeProps {
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

export default function RemoveRange(props: IRemoveRangeProps) {
    const {
        // chainId,
        // poolIdx,
        // user,
        // bidTick,
        // askTick,
        // baseTokenAddress,
        // quoteTokenAddress,
        provider,
        lastBlockNumber,
        position,
    } = props;

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

    const removeRangeSetttingIcon = (
        <div onClick={() => setShowSettings(!showSettings)} className={styles.settings_icon}>
            {showSettings ? null : <RiListSettingsLine size={20} />}
        </div>
    );

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newRemovalTransactionHash, setNewRemovalTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const liquiditySlippageTolerance = 1;

    const removeFn = async () => {
        setShowConfirmation(true);
        console.log(`${removalPercentage}% to be removed.`);

        const env = new CrocEnv(provider);
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);

        if (position.positionType === 'ambient') {
            if (removalPercentage === 100) {
                try {
                    const tx = await pool.burnAmbientAll([lowLimit, highLimit]);
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(error?.message);
                }
            } else {
                const positionLiq = position.positionLiq;

                const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                    .mul(removalPercentage)
                    .div(100);

                try {
                    const tx = await pool.burnAmbientLiq(liquidityToBurn, [lowLimit, highLimit]);
                    console.log(tx?.hash);
                    setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    setTxErrorCode(error?.code);
                    setTxErrorMessage(error?.message);
                }
            }
        } else if (position.positionType === 'concentrated') {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                .div(100);

            try {
                const tx = await pool.burnRangeLiq(
                    liquidityToBurn,
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
            console.log('unsupported position type for removal');
        }
    };

    const harvestFn = async () => {
        console.log('all fees to be removed.');

        const env = new CrocEnv(provider);
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

    const harvestButtonOrNull =
        position.positionType === 'concentrated' &&
        (position.feesLiqBaseDecimalCorrected || 0) + (position.feesLiqQuoteDecimalCorrected || 0) >
            0 ? (
            <RemoveRangeButton removeFn={harvestFn} title={'Harvest Fees'} />
        ) : null;

    // const removeRangeSettingsPage = (
    //     <div className={styles.remove_range_settings_container}>
    //         <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} />
    //     </div>
    // );

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
                href={newRemovalTransactionHash}
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
    }, [transactionApproved, removalDenied, newRemovalTransactionHash, txErrorCode]);

    const confirmationContent = (
        <div className={styles.confirmation_container}>
            {showConfirmation && (
                <div className={styles.button} onClick={() => setShowConfirmation(false)}>
                    <BsArrowLeft size={30} />
                </div>
            )}
            <div className={styles.confirmation_content}>
                {/* {currentConfirmationData} */}
                {removalSuccess}
            </div>
        </div>
    );

    const mainModalContent = showSettings ? (
        <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} />
    ) : (
        <>
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
            />
        </>
    );

    if (showConfirmation) return confirmationContent;
    return (
        <div className={styles.remove_range_container}>
            {/* {removeRangeSettingsPage} */}
            {/* <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} /> */}
            <div className={styles.header_container}>
                <RemoveRangeHeader
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
            <div className={styles.main_content}>
                {mainModalContent}
                {harvestButtonOrNull}
                <RemoveRangeButton
                    removeFn={removeFn}
                    disabled={showSettings}
                    title='Remove Range'
                />
                <button onClick={() => setShowConfirmation(!showConfirmation)}>Button</button>
            </div>
        </div>
    );
}
