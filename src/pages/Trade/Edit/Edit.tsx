import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import CurrencyDisplayContainer from '../../../components/Trade/Edit/CurrencyDisplayContainer/CurrencyDisplayContainer';
import EditMinMaxPrice from '../../../components/Trade/Edit/EditMinMaxPrice/EditMinMaxPrice';
import EditPriceInfo from '../../../components/Trade/Edit/EditPriceInfo/EditPriceInfo';
import EditButton from '../../../components/Trade/Edit/EditButton/EditButton';
import Divider from '../../../components/Global/Divider/Divider';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmEditModal from '../../../components/Trade/Edit/ConfirmEditModal/ConfirmEditModal';
import { useModal } from '../../../components/Global/Modal/useModal';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PositionIF, TokenIF } from '../../../utils/interfaces/exports';
import {
    getPinnedPriceValuesFromTicks,
    getPinnedPriceValuesFromDisplayPrices,
} from '../Range/rangeFunctions';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';

interface PositionState {
    position: PositionIF;
}

export default function Edit() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const location = useLocation();

    const tradeData = useAppSelector((state) => state.tradeData);

    // Redirect if we don't have a position in state(just url)
    const state = location.state as PositionState;
    if (!state) {
        console.warn(
            'Dev Readonly: No position data to be displayed. Url does not contain state without active click from the position',
        );
        console.log(
            'Dev Readonly: No position data to be displayed. Url does not contain state without active click from the position',
        );
        return <Navigate replace to='/trade/range' />;
    }

    const { position } = state;

    // useEffect(() => {
    //     console.log({ position });
    // }, [position]);

    // const minPricePercentage = -15;
    // const maxPricePercentage = 15;

    const [rangeLowTick, setRangeLowTick] = useState(position.bidTick);
    const [rangeHighTick, setRangeHighTick] = useState(position.askTick);

    const [initializationComplete, setInitializationComplete] = useState(false);

    const [isAdvancedModeActive, setIsAdvancedModeActive] = useState(false);
    // const [denominationsInBase, setDenominationsInBase] = useState(true);
    const denominationsInBase = tradeData.isDenomBase;

    useEffect(() => {
        const rangeLowBoundDisplayField = document.getElementById(
            'edit-base-price-input-quantity',
        ) as HTMLInputElement;
        if (rangeLowBoundDisplayField) {
            // console.log(rangeLowBoundDisplayField.value);
            const rangeHighBoundDisplayField = document.getElementById(
                'edit-quote-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                setIsAdvancedModeActive(true);
                setInitializationComplete(false);
            }
        }
    }, [denominationsInBase, isAdvancedModeActive, rangeLowTick, rangeHighTick, location.pathname]);

    const baseTokenDecimals = position.baseDecimals;
    const quoteTokenDecimals = position.quoteDecimals;

    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] = useState('');
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] = useState('');

    const currentPoolPriceTick = position.poolPriceInTicks ?? 0;
    const currentPoolPriceNonDisplay = tickToPrice(currentPoolPriceTick);

    const currentPoolDisplayPriceInQuote = toDisplayPrice(
        currentPoolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const currentPoolDisplayPriceInBase =
        1 / toDisplayPrice(currentPoolPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const truncatedCurrentPoolDisplayPriceInQuote =
        currentPoolDisplayPriceInQuote < 2
            ? truncateDecimals(currentPoolDisplayPriceInQuote, 4)
            : truncateDecimals(currentPoolDisplayPriceInQuote, 2);
    const truncatedCurrentPoolDisplayPriceInBase =
        currentPoolDisplayPriceInBase < 2
            ? truncateDecimals(currentPoolDisplayPriceInBase, 4)
            : truncateDecimals(currentPoolDisplayPriceInBase, 2);

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '0'
            : denominationsInBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    const defaultMinPriceDifferencePercentage = -15;
    const defaultMaxPriceDifferencePercentage = 15;

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] = useState(
        defaultMinPriceDifferencePercentage,
    );
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] = useState(
        defaultMaxPriceDifferencePercentage,
    );

    useEffect(() => {
        setRangeLowTick(position.bidTick);
    }, [position.bidTick]);

    useEffect(() => {
        setRangeHighTick(position.askTick);
    }, [position.askTick]);

    useEffect(() => {
        if (!initializationComplete && isAdvancedModeActive) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
                lookupChain(position.chainId).gridSize,
            );

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            setRangeLowTick(pinnedDisplayPrices.pinnedLowTick);
            setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

            const highTickDiff = pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick;
            const lowTickDiff = pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            denominationsInBase
                ? setMaxPriceDifferencePercentage(-lowGeometricDifferencePercentage)
                : setMaxPriceDifferencePercentage(highGeometricDifferencePercentage);

            denominationsInBase
                ? setMinPriceDifferencePercentage(-highGeometricDifferencePercentage)
                : setMinPriceDifferencePercentage(lowGeometricDifferencePercentage);

            // console.log({ pinnedDisplayPrices });

            const rangeLowBoundDisplayField = document.getElementById(
                'edit-base-price-input-quantity',
            ) as HTMLInputElement;

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const rangeHighBoundDisplayField = document.getElementById(
                    'edit-quote-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                    setInitializationComplete(true);
                } else {
                    // console.log('high bound field not found');
                }
            } else {
                // console.log('low bound field not found');
            }
        }
    }, [
        currentPoolPriceTick,
        rangeLowTick,
        rangeHighTick,
        initializationComplete,
        isAdvancedModeActive,
        denominationsInBase,
        baseTokenDecimals,
        quoteTokenDecimals,
    ]);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(false);

    const lowBoundOnBlur = () => setRangeLowBoundFieldBlurred(true);

    // const rangeLowBoundDisplayPrice = 1;
    // const rangeHighBoundDisplayPrice = 1;

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(false);
    const highBoundOnBlur = () => setRangeHighBoundFieldBlurred(true);

    useEffect(() => {
        // console.log('low bound blurred');
        if (rangeLowBoundFieldBlurred) {
            const rangeLowBoundDisplayField = document.getElementById(
                'edit-base-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                // rangeLowBoundDisplayField.value = pinnedMinPriceDisplayTruncated.toString();
                if (rangeLowBoundDisplayField.value !== pinnedMinPriceDisplayTruncated) {
                    const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                        denominationsInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        rangeLowBoundDisplayField.value,
                        pinnedMaxPriceDisplayTruncated,
                        lookupChain(position.chainId).gridSize,
                    );

                    !denominationsInBase
                        ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                        : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);
                }
            }
            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundFieldBlurred]);

    useEffect(() => {
        // console.log('high bound blurred');
        if (rangeHighBoundFieldBlurred) {
            const rangeHighBoundDisplayField = document.getElementById(
                'edit-quote-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                if (rangeHighBoundDisplayField.value !== pinnedMaxPriceDisplayTruncated) {
                    const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                        denominationsInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        pinnedMinPriceDisplayTruncated,
                        rangeHighBoundDisplayField.value,
                        lookupChain(position.chainId).gridSize,
                    );

                    denominationsInBase
                        ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                        : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);
                }
            }
            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundFieldBlurred]);

    const { positionHash } = useParams();

    const baseTokenOfPosition = position.base;
    const quoteTokenOfPosition = position.quote;
    const userLocalStorage = localStorage.getItem('user');
    const tokens = userLocalStorage ? JSON.parse(userLocalStorage).tokens : null;

    const baseTokenImageURL = tokens.find(
        (token: TokenIF) => token.address.toLowerCase() === baseTokenOfPosition.toLowerCase(),
    ).logoURI;

    const quoteTokenImageURL = tokens.find(
        (token: TokenIF) => token.address.toLowerCase() === quoteTokenOfPosition.toLowerCase(),
    ).logoURI;

    const lowPriceNonDisplay = tickToPrice(position.bidTick);
    const highPriceNonDisplay = tickToPrice(position.askTick);

    const lowPriceDisplayInQuote = toDisplayPrice(
        lowPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const highPriceDisplayInQuote = toDisplayPrice(
        highPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const lowPriceDisplayInBase = 1 / highPriceDisplayInQuote;
    const highPriceDisplayInBase = 1 / lowPriceDisplayInQuote;

    const lowPriceDisplay = denominationsInBase ? lowPriceDisplayInBase : lowPriceDisplayInQuote;
    const highPriceDisplay = denominationsInBase ? highPriceDisplayInBase : highPriceDisplayInQuote;

    const lowPriceDisplayTruncated =
        lowPriceDisplay < 2
            ? truncateDecimals(lowPriceDisplay, 4)
            : truncateDecimals(lowPriceDisplay, 2);

    const highPriceDisplayTruncated =
        highPriceDisplay < 2
            ? truncateDecimals(highPriceDisplay, 4)
            : truncateDecimals(highPriceDisplay, 2);

    // useEffect(() => {
    //     console.log({ lowPriceDisplayTruncated });
    // }, [lowPriceDisplayTruncated]);

    // useEffect(() => {
    //     console.log({ highPriceDisplayTruncated });
    // }, [highPriceDisplayTruncated]);

    const confirmEditModal = isModalOpen ? (
        <Modal onClose={closeModal} title='Edit Position'>
            <ConfirmEditModal
                onClose={closeModal}
                position={position}
                currentPoolPriceDisplay={currentPoolPriceDisplay}
                denominationsInBase={denominationsInBase}
                baseTokenImageURL={baseTokenImageURL}
                quoteTokenImageURL={quoteTokenImageURL}
                pinnedMinPriceDisplayTruncated={pinnedMinPriceDisplayTruncated}
                pinnedMaxPriceDisplayTruncated={pinnedMaxPriceDisplayTruncated}
                lowPriceDisplayTruncated={lowPriceDisplayTruncated}
                highPriceDisplayTruncated={highPriceDisplayTruncated}
            />
        </Modal>
    ) : null;

    // Props for <EditMinMaxPrice/> React element
    const editMinMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: denominationsInBase,
        highBoundOnBlur: highBoundOnBlur,
        lowBoundOnBlur: lowBoundOnBlur,
        rangeLowTick: rangeLowTick,
        rangeHighTick: rangeHighTick,
        setRangeLowTick: setRangeLowTick,
        setRangeHighTick: setRangeHighTick,
        minPrice: position?.lowRangeDisplayInBase,
        maxPrice: position?.highRangeDisplayInBase,
        chainId: position.chainId,
    };
    // Props for <CurrencyDisplayContainer/> React element

    const currencyDisplayContainerProps = {
        quoteTokenSymbol: position.quoteSymbol,
        baseTokenSymbol: position.baseSymbol,
        baseTokenImageURL: baseTokenImageURL,
        quoteTokenImageURL: quoteTokenImageURL,
        tokenAQtyDisplay: position.tokenAQtyDisplay,
        tokenBQtyDisplay: position.tokenBQtyDisplay,
    };

    const editPriceInfoProps = {
        currentPoolPriceDisplay: currentPoolPriceDisplay,
        denominationsInBase: denominationsInBase,
        quoteTokenSymbol: position.quoteSymbol,
        baseTokenSymbol: position.baseSymbol,
        tokenAQtyDisplay: position.tokenAQtyDisplay,
        tokenBQtyDisplay: position.tokenBQtyDisplay,
        ambient: position.positionType === 'ambient',
        lowTick: position.bidTick,
        highTick: position.askTick,
        lowRangeDisplay: position.lowRangeDisplayInBase,
        highRangeDisplay: position.highRangeDisplayInBase,
        pinnedMinPriceDisplayTruncated: pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated: pinnedMaxPriceDisplayTruncated,
        lowPriceDisplayTruncated: lowPriceDisplayTruncated,
        highPriceDisplayTruncated: highPriceDisplayTruncated,
    };

    // const editDenominationSwitchProps = {
    //     denominationsInBase: denominationsInBase,
    //     // setDenominationsInBase: dispatch(toggleDidUserFlipDenom),
    //     quoteTokenSymbol: position.quoteSymbol,
    //     baseTokenSymbol: position.baseSymbol,
    // };

    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            <div className={styles.edit_content}>
                <CurrencyDisplayContainer {...currencyDisplayContainerProps} />
                <Divider />
                {/* <EditDenominationSwitch {...editDenominationSwitchProps} /> */}
                <DenominationSwitch />
                {position.positionType === 'concentrated' && (
                    <EditMinMaxPrice {...editMinMaxPriceProps} />
                )}
                <EditPriceInfo {...editPriceInfoProps} />
                <EditButton onClickFn={openModal} />
            </div>
            {confirmEditModal}
        </div>
    );
}
