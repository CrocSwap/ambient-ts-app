// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CrocEnv, CrocReposition, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';

// START: Import JSX Components
import RepositionButton from '../../../components/Trade/Reposition/Repositionbutton/RepositionButton';
import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import RepositionRangeWidth from '../../../components/Trade/Reposition/RepositionRangeWidth/RepositionRangeWidth';
import ConfirmRepositionModal from '../../../components/Trade/Reposition/ConfirmRepositionModal/ConfirmRepositionModal';
import Modal from '../../../components/Global/Modal/Modal';

// START: Import Other Local Files
import styles from './Reposition.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PositionIF, SlippagePairIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { getPinnedPriceValuesFromTicks } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
// import { BigNumber } from 'ethers';
import { addPendingTx, addReceipt, removePendingTx } from '../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../utils/TransactionError';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    isDenomBase: boolean;
    ambientApy: number | undefined;
    repoSlippage: SlippagePairIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    seRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    tokenPair: TokenPairIF;
}

export default function Reposition(props: propsIF) {
    const {
        crocEnv,
        isDenomBase,
        ambientApy,
        repoSlippage,
        isPairStable,
        bypassConfirm,
        toggleBypassConfirm,
        setMinPrice,
        setMaxPrice,
        seRescaleRangeBoundariesWithSlider,
        tokenPair,
    } = props;

    // current URL parameter string
    const { params } = useParams();

    const [newRepositionTransactionHash, setNewRepositionTransactionHash] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(true);
    const [txErrorCode, setTxErrorCode] = useState('');
    const [txErrorMessage, setTxErrorMessage] = useState('');

    const resetConfirmation = () => {
        setShowConfirmation(true);
        setTxErrorCode('');

        setTxErrorMessage('');
    };

    // location object (we need this mainly for position data)
    const location = useLocation();

    // fn to conditionally navigate the user
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    // redirect path to use in this module
    // will try to preserve current params, will use default path otherwise
    const redirectPath = '/trade/range/' + (params ?? '');

    // log in console if conditions are such to trigger an automatic URL redirect
    // this will help troubleshoot if we ever break functionality to link this page
    console.assert(
        location.state,
        `Component Reposition() did not receive position data on load. Expected to receive a data object conforming to the shape of PositionIF in location.state as returned by the useLocation() hook. Actual value received is <<${location.state}>>. App will redirect to a page with generic functionality. Refer to Reposition.tsx for troubleshooting. This is expected behavior should a user navigate to the '/trade/reposition/:params' pathway any other way than clicking an in-app <Link/> element.`,
    );

    // navigate the user to the redirect URL path if location.state has no data
    // ... this value will be truthy if the user arrived here by clicking a link
    // ... inside the app, but will be empty if they navigated manually to the path
    location.state || navigate(redirectPath, { replace: true });

    // position data from the location object
    const { position } = location.state as { position: PositionIF };

    const tradeData = useAppSelector((state) => state.tradeData);

    const simpleRangeWidth = tradeData.simpleRangeWidth;

    const currentPoolPriceTick = position.poolPriceInTicks || 0;
    const baseTokenDecimals = position.baseDecimals || 18;
    const quoteTokenDecimals = position.quoteDecimals || 18;

    const currentPoolPriceNonDisplay = tickToPrice(currentPoolPriceTick);

    const currentPoolDisplayPriceInBase =
        1 / toDisplayPrice(currentPoolPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const currentPoolDisplayPriceInQuote = toDisplayPrice(
        currentPoolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const truncatedCurrentPoolDisplayPriceInBase = currentPoolDisplayPriceInBase
        ? currentPoolDisplayPriceInBase < 2
            ? currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentPoolDisplayPriceInBase.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const truncatedCurrentPoolDisplayPriceInQuote = currentPoolDisplayPriceInQuote
        ? currentPoolDisplayPriceInQuote < 2
            ? currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : currentPoolDisplayPriceInQuote.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '0'
            : isDenomBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    // const currentLocation = location.pathname;
    const [isModalOpen, openModal, closeModal] = useModal();

    useEffect(() => {
        setRangeWidthPercentage(() => simpleRangeWidth);
    }, [simpleRangeWidth]);

    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(10);
    const [pinnedLowTick, setPinnedLowTick] = useState(0);
    const [pinnedHighTick, setPinnedHighTick] = useState(0);

    useEffect(() => {
        if (!position) {
            return;
        }
        const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
        const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

        const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
            isDenomBase,
            position.baseDecimals,
            position.quoteDecimals,
            lowTick,
            highTick,
            lookupChain(position?.chainId || '0x5').gridSize,
        );

        setPinnedLowTick(pinnedDisplayPrices.pinnedLowTick);
        setPinnedHighTick(pinnedDisplayPrices.pinnedHighTick);
    }, [
        rangeWidthPercentage,
        currentPoolPriceTick,
        currentPoolPriceDisplay,
        position?.base,
        position?.quote,
    ]);

    useEffect(() => {
        if (tradeData.simpleRangeWidth !== rangeWidthPercentage) {
            console.log('set Range');
            // dispatch(setRangeModuleTriggered(true));
            // dispatch(setSimpleRangeWidth(rangeWidthPercentage));
        }
    }, [rangeWidthPercentage]);

    const sendRepositionTransaction = async () => {
        if (!crocEnv) {
            return;
        }
        let tx;

        try {
            const pool = crocEnv.pool(position.base, position.quote);
            const repo = new CrocReposition(pool, {
                liquidity: position.positionLiq,
                burn: [position.bidTick, position.askTick],
                mint: [pinnedLowTick, pinnedHighTick],
            });

            tx = await repo.rebal();
            setNewRepositionTransactionHash(tx?.hash);
            dispatch(addPendingTx(tx?.hash));
        } catch (error) {
            console.log({ error });
            setTxErrorCode(error?.code);
            setTxErrorMessage(error?.message);
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
                dispatch(addPendingTx(newTransactionHash));
                setNewRepositionTransactionHash(newTransactionHash);
                console.log({ newTransactionHash });
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                // console.log({ error });
                receipt = error.receipt;
            }
        }
        if (receipt) {
            dispatch(addReceipt(JSON.stringify(receipt)));
            dispatch(removePendingTx(receipt.transactionHash));
        }
    };

    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader
                positionHash={position.positionStorageSlot}
                redirectPath={redirectPath}
                repoSlippage={repoSlippage}
                isPairStable={isPairStable}
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
            />
            <div className={styles.reposition_content}>
                <RepositionRangeWidth
                    rangeWidthPercentage={rangeWidthPercentage}
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    seRescaleRangeBoundariesWithSlider={seRescaleRangeBoundariesWithSlider}
                />
                <RepositionDenominationSwitch
                    baseTokenSymbol={position.baseSymbol || 'ETH'}
                    quoteTokenSymbol={position.quoteSymbol || 'USDC'}
                />
                <RepositionPriceInfo
                    crocEnv={crocEnv}
                    position={position}
                    ambientApy={ambientApy}
                    currentPoolPriceDisplay={currentPoolPriceDisplay}
                    currentPoolPriceTick={currentPoolPriceTick}
                    rangeWidthPercentage={rangeWidthPercentage}
                    setMaxPrice={setMaxPrice}
                    setMinPrice={setMinPrice}
                />
                <RepositionButton
                    bypassConfirm={bypassConfirm}
                    onClickFn={openModal}
                    sendRepositionTransaction={sendRepositionTransaction}
                />
            </div>
            {isModalOpen && (
                <Modal onClose={closeModal} title=' Confirm Reposition'>
                    <ConfirmRepositionModal
                        crocEnv={crocEnv}
                        position={position as PositionIF}
                        ambientApy={ambientApy}
                        currentPoolPriceDisplay={currentPoolPriceDisplay}
                        currentPoolPriceTick={currentPoolPriceTick}
                        rangeWidthPercentage={rangeWidthPercentage}
                        onClose={closeModal}
                        onSend={sendRepositionTransaction}
                        setMaxPrice={setMaxPrice}
                        setMinPrice={setMinPrice}
                        showConfirmation={showConfirmation}
                        setShowConfirmation={setShowConfirmation}
                        newRepositionTransactionHash={newRepositionTransactionHash}
                        tokenPair={tokenPair}
                        resetConfirmation={resetConfirmation}
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                    />
                </Modal>
            )}
        </div>
    );
}
// // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
// function setTxErrorCode(code: any) {
//     throw new Error('Function not implemented.');
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
// function setTxErrorMessage(message: any) {
//     throw new Error('Function not implemented.');
// }
