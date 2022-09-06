import styles from './HarvestPosition.module.css';
import HarvestPositionWidth from './HarvestPositionWidth/HarvestPositionWidth';
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
// import { PositionIF } from '../../utils/interfaces/PositionIF';
// import { ethers } from 'ethers';
// import { CrocEnv } from '@crocswap-libs/sdk';
import Button from '../Global/Button/Button';

import HarvestPositionSettings from './HarvestPositionSettings/HarvestPositionSettings';
import {
    CircleLoader,
    CircleLoaderFailed,
} from '../Global/LoadingAnimations/CircleLoader/CircleLoader';

// interface IHarvestPositionProps {
//     provider: ethers.providers.Provider;
//     chainId: string;
//     poolIdx: number;
//     user: string;
//     bidTick: number;
//     askTick: number;
//     baseTokenAddress: string;
//     quoteTokenAddress: string;
//     isPositionInRange: boolean;
//     isAmbient: boolean;
//     baseTokenSymbol: string;
//     quoteTokenSymbol: string;
//     baseTokenLogoURI: string;
//     quoteTokenLogoURI: string;
//     isDenomBase: boolean;
//     lastBlockNumber: number;
//     position: PositionIF;
// }
export default function HarvestPosition() {
    // const {
    //     chainId,
    //     poolIdx,
    //     user,
    //     bidTick,
    //     askTick,
    //     baseTokenAddress,
    //     quoteTokenAddress,
    //     provider,
    //     lastBlockNumber,
    //     position,
    // } = props;

    // settings
    const [showSettings, setShowSettings] = useState(false);

    const harvestPositionSetttingIcon = (
        <div onClick={() => setShowSettings(!showSettings)} className={styles.settings_icon}>
            {showSettings ? null : <RiListSettingsLine size={20} />}
        </div>
    );

    const [showConfirmation, setShowConfirmation] = useState(false);
    // eslint-disable-next-line
    const [newHarvestTransactionHash, setNewHarvestTransactionHash] = useState('');
    // eslint-disable-next-line
    const [txErrorCode, setTxErrorCode] = useState(0);
    // eslint-disable-next-line
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const harvestFn = () => console.log('harvested');

    const positionType = 'concentrated';

    const harvestButtonOrNull =
        positionType === 'concentrated' ? (
            <HarvestPositionButton harvestFn={harvestFn} title={'Harvest Fees'} />
        ) : null;

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
        removalDenied,
        newHarvestTransactionHash,
        txErrorCode,
        showConfirmation,
        isRemovalDenied,
    ]);

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
            <HarvestPositionWidth
            // removalPercentage={removalPercentage}
            // setRemovalPercentage={setRemovalPercentage}
            />
            <HarvestPositionInfo
            // baseTokenSymbol={props.baseTokenSymbol}
            // quoteTokenSymbol={props.quoteTokenSymbol}
            // baseTokenLogoURI={props.baseTokenLogoURI}
            // quoteTokenLogoURI={props.quoteTokenLogoURI}
            // posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
            // posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
            // feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
            // feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
            // removalPercentage={removalPercentage}
            />
        </>
    );

    if (showConfirmation) return confirmationContent;

    return (
        <div className={styles.remove_range_container}>
            {/* {removeRangeSettingsPage} */}
            {/* <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} /> */}
            <div className={styles.header_container}>
                <HarvestPositionHeader
                // isPositionInRange={props.isPositionInRange}
                // isAmbient={props.isAmbient}
                // baseTokenSymbol={props.baseTokenSymbol}
                // quoteTokenSymbol={props.quoteTokenSymbol}
                // baseTokenLogoURI={props.baseTokenLogoURI}
                // quoteTokenLogoURI={props.quoteTokenLogoURI}
                // isDenomBase={props.isDenomBase}
                />
                {harvestPositionSetttingIcon}
            </div>
            <div className={styles.main_content}>
                {mainModalContent}
                {harvestButtonOrNull}
                <HarvestPositionButton
                    harvestFn={harvestFn}
                    disabled={showSettings}
                    title='Harvest Position'
                />
            </div>
        </div>
    );
}
