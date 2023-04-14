// START: Import Local Files
import { capitalConcFactor, CrocEnv, tickToPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Dispatch, SetStateAction, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { getPinnedPriceValuesFromTicks } from '../../../../pages/Trade/Range/rangeFunctions';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
// import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
// import DividerDark from '../../../Global/DividerDark/DividerDark';
import styles from './RepositionPriceInfo.module.css';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import AprExplanation from '../../../Global/Informational/AprExplanation';

// import truncateDecimals from '../../../../utils/data/truncateDecimals';
// import makeCurrentPrice from './makeCurrentPrice';
// import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
// interface IRepositionPriceInfoPropsIF {
//     tokenPair: TokenPairIF;
//     spotPriceDisplay: string;
//     maxPriceDisplay: string;
//     minPriceDisplay: string;
//     aprPercentage: number;
//     didUserFlipDenom: boolean;
//     poolPriceCharacter: string;
// }

interface IRepositionPriceInfoProps {
    crocEnv: CrocEnv | undefined;
    position: PositionIF;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    isConfirmModal?: boolean;

    minPriceDisplay: string;
    maxPriceDisplay: string;

    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;

    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    rangeGasPriceinDollars: string | undefined;

    repoSlippage: SlippageMethodsIF;
    isPairStable: boolean;

    poolPriceDisplay: number | undefined;

    isDenomBase: boolean;

    currentMinPrice: string;
    currentMaxPrice: string;

    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
}

// todo : take a look at RangePriceInfo.tsx. Should follow a similar approach.
// central react functional component
export default function RepositionPriceInfo(props: IRepositionPriceInfoProps) {
    const {
        position,
        ambientApy,
        currentPoolPriceDisplay,
        currentPoolPriceTick,
        rangeWidthPercentage,

        isConfirmModal,
        minPriceDisplay,
        maxPriceDisplay,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        rangeGasPriceinDollars,

        repoSlippage,

        currentMinPrice,
        currentMaxPrice,
        openGlobalPopup,
        // isPairStable
    } = props;

    const baseSymbol = position?.baseSymbol;
    const quoteSymbol = position?.quoteSymbol;

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData?.isDenomBase;
    const liquidityFee = tradeData?.liquidityFee;

    const lowTick = currentPoolPriceTick - rangeWidthPercentage * 100;
    const highTick = currentPoolPriceTick + rangeWidthPercentage * 100;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        position?.baseDecimals || 18,
        position?.quoteDecimals || 18,
        lowTick,
        highTick,
        lookupChain(position.chainId).gridSize,
    );

    const pinnedLowTick = pinnedDisplayPrices.pinnedLowTick;
    const pinnedHighTick = pinnedDisplayPrices.pinnedHighTick;
    // eslint-disable-next-line
    const dispatch = useAppDispatch();

    const baseTokenCharacter = position?.baseSymbol
        ? getUnicodeCharacter(position?.baseSymbol)
        : '';
    const quoteTokenCharacter = position?.quoteSymbol
        ? getUnicodeCharacter(position?.quoteSymbol)
        : '';
    // eslint-disable-next-line
    const poolPriceCharacter = isDenomBase
        ? quoteTokenCharacter
        : baseTokenCharacter;

    let aprPercentage = ambientApy;

    if (ambientApy) {
        const concFactor = capitalConcFactor(
            tickToPrice(currentPoolPriceTick),
            tickToPrice(pinnedLowTick),
            tickToPrice(pinnedHighTick),
        );
        aprPercentage = ambientApy * concFactor;
    }

    const aprPercentageString = aprPercentage
        ? ` ${aprPercentage.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })}%`
        : '…';

    // -----------------------------END OF TEMPORARY PLACE HOLDERS--------------

    // JSX frag for estimated APR of position
    interface RowDisplayPropsIF {
        item1: string | number;
        item2: string | number;
        item3: string | number;
    }
    function RowDisplay(props: RowDisplayPropsIF) {
        const { item1, item2, item3 } = props;

        return (
            <div className={styles.row_display}>
                <p>{item1 ? item1 : ''}</p>
                <p>{item2 ? item2 : ''}</p>
                <p>{item3 ? item3 : ''}</p>
            </div>
        );
    }

    const apr = (
        <div className={styles.apr_display}>
            <p>
                Est. APR{' '}
                <AiOutlineQuestionCircle
                    size={14}
                    onClick={() =>
                        openGlobalPopup(
                            <AprExplanation />,

                            'Estimated APR',
                            'right',
                        )
                    }
                />
            </p>
            <p>{aprPercentageString}</p>
        </div>
    );

    const feesAndSlippageData = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            // eslint-disable-next-line no-irregular-whitespace
            data: `${repoSlippage.volatile} %`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${baseSymbol} / ${quoteSymbol} liquidity providers.`,
            // eslint-disable-next-line no-irregular-whitespace
            data: `${liquidityFee * 100} %`,
            placement: 'bottom',
        },
    ];

    const [showExtraDetails, setShowExtraDetails] = useState(false);
    const priceImpact = true;

    const dropDownOrNull = priceImpact ? (
        <p style={{ cursor: 'pointer', marginTop: '4px' }}>
            {!showExtraDetails && <RiArrowDownSLine size={22} />}
            {showExtraDetails && <RiArrowUpSLine size={22} />}
        </p>
    ) : null;

    const conversionRateDisplay = isDenomBase
        ? `1 ${baseSymbol} ≈ ${currentPoolPriceDisplay} ${quoteSymbol}`
        : `1 ${quoteSymbol} ≈ ${currentPoolPriceDisplay} ${baseSymbol}`;

    const gasCostAriaLabel = `Gas cost is ${rangeGasPriceinDollars}. Conversion rate is ${conversionRateDisplay} `;

    const gasPriceDropdown = (
        <section className={styles.gas_pump_dropdown}>
            <button onClick={() => setShowExtraDetails(!showExtraDetails)}>
                <p aria-label={gasCostAriaLabel}>
                    <FaGasPump size={15} />
                    {rangeGasPriceinDollars ? rangeGasPriceinDollars : '…'}
                </p>
                <p>{conversionRateDisplay}</p>
                {dropDownOrNull}
            </button>

            {showExtraDetails && (
                <div className={styles.dropdown_content}>
                    {feesAndSlippageData.map((item, idx) =>
                        item ? (
                            <div
                                className={styles.extra_row}
                                key={idx}
                                tabIndex={0}
                                aria-label={`${item.title} is ${item.data}`}
                            >
                                <div className={styles.align_center}>
                                    <p>{item.title}</p>
                                    <TooltipComponent
                                        title={item.tooltipTitle}
                                        placement={item.placement as 'bottom'}
                                    />
                                </div>
                                <p className={styles.data}>{item.data}</p>
                            </div>
                        ) : null,
                    )}
                </div>
            )}
        </section>
    );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {!isConfirmModal ? apr : null}
                <aside className={styles.divider} />

                <RowDisplay item1='' item2='Current' item3='Est. New' />
                <aside className={styles.divider} />

                <RowDisplay
                    item1={position?.baseSymbol}
                    item2={currentBaseQtyDisplayTruncated}
                    item3={newBaseQtyDisplay}
                />
                <RowDisplay
                    item1={position?.quoteSymbol}
                    item2={currentQuoteQtyDisplayTruncated}
                    item3={newQuoteQtyDisplay}
                />
                <aside className={styles.divider} />

                <RowDisplay
                    item1='Min Price'
                    item2={currentMinPrice}
                    item3={rangeWidthPercentage === 100 ? '0' : minPriceDisplay}
                />
                <RowDisplay
                    item1='Max Price'
                    item2={currentMaxPrice}
                    item3={rangeWidthPercentage === 100 ? '∞' : maxPriceDisplay}
                />
            </div>
            {gasPriceDropdown}
        </div>
    );
}
