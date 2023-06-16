// START: Import React and Dongles
import { memo, useContext, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './ExtraInfo.module.css';
// import truncateDecimals from '../../../utils/data/truncateDecimals';
// import makePriceDisplay from './makePriceDisplay';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { CrocImpact } from '@crocswap-libs/sdk';
// import DenominationSwitch from '../DenominationSwitch/DenominationSwitch';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { PoolContext } from '../../../contexts/PoolContext';
import { getPriceImpactString } from '../../../App/functions/swap/getPriceImpactString';
import { getDisplayableEffectivePriceString } from '../../../App/functions/swap/getDisplayableEffectivePriceString';

// interface for props in this file
interface propsIF {
    priceImpact: CrocImpact | undefined;
    slippageTolerance: number;
    liquidityProviderFeeString: string;
    swapGasPriceinDollars: string | undefined;
    isOnTradeRoute?: boolean;
    effectivePriceWithDenom: number | undefined;
    isQtyEntered: boolean;
}

// central react functional component
function ExtraInfo(props: propsIF) {
    const {
        priceImpact,
        effectivePriceWithDenom,
        slippageTolerance,
        liquidityProviderFeeString,
        swapGasPriceinDollars,
        isQtyEntered,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
            : displayPriceWithDenom < 0.0001
            ? displayPriceWithDenom.toExponential(2)
            : displayPriceWithDenom < 2
            ? displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : displayPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const finalPriceWithDenom = !isDenomBase
        ? 1 / (priceImpact?.finalPrice || 1)
        : priceImpact?.finalPrice || 1;

    const finalPriceString =
        finalPriceWithDenom === Infinity || finalPriceWithDenom === 1
            ? '…'
            : finalPriceWithDenom < 0.0001
            ? finalPriceWithDenom.toExponential(2)
            : finalPriceWithDenom < 2
            ? finalPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : finalPriceWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const priceImpactNum = !priceImpact?.percentChange
        ? undefined
        : Math.abs(priceImpact.percentChange) * 100;

    const feesAndSlippageData = [
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'This can be changed in settings.',
            // eslint-disable-next-line no-irregular-whitespace
            data: `${slippageTolerance} %`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${baseTokenSymbol} / ${quoteTokenSymbol} liquidity providers.`,
            // eslint-disable-next-line no-irregular-whitespace
            data: `${liquidityProviderFeeString} %`,
            placement: 'bottom',
        },
    ];

    const extraInfoData = [
        {
            title: 'Conversion Rate',
            tooltipTitle: 'After Price Impact and Provider Fee',
            data: isDenomBase
                ? `${getDisplayableEffectivePriceString(
                      effectivePriceWithDenom,
                  )} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${getDisplayableEffectivePriceString(
                      effectivePriceWithDenom,
                  )} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            placement: 'bottom',
        },
        {
            title: 'Price Impact',
            tooltipTitle:
                'Difference Between Current (Spot) Price and Final Price',
            // eslint-disable-next-line no-irregular-whitespace
            data: `${getPriceImpactString(priceImpactNum)} %`,
            placement: 'bottom',
        },
        {
            title: 'Final Price',
            tooltipTitle: 'Expected Price After Swap',
            data: isDenomBase
                ? `${finalPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${finalPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            placement: 'bottom',
        },
    ];

    const extraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) =>
                item ? (
                    <div
                        className={styles.extra_row}
                        key={idx}
                        tabIndex={0}
                        aria-label={`${item.title} is ${item.data}`}
                    >
                        <div className={styles.align_center}>
                            <div>{item.title}</div>
                            <TooltipComponent
                                title={item.tooltipTitle}
                                placement={item.placement as 'bottom'}
                            />
                        </div>
                        <div className={styles.data}>{item.data}</div>
                    </div>
                ) : null,
            )}
            {feesAndSlippageData.map((item, idx) =>
                item ? (
                    <div
                        className={styles.extra_row}
                        key={idx}
                        tabIndex={0}
                        aria-label={`${item.title} is ${item.data}`}
                    >
                        <div className={styles.align_center}>
                            <div>{item.title}</div>
                            <TooltipComponent
                                title={item.tooltipTitle}
                                placement={item.placement as 'bottom'}
                            />
                        </div>
                        <div className={styles.data}>{item.data}</div>
                    </div>
                ) : null,
            )}
        </div>
    );

    const dropDownOrNull =
        priceImpact && isQtyEntered ? (
            <div style={{ cursor: 'pointer', marginTop: '4px' }}>
                {!showExtraDetails && <RiArrowDownSLine size={22} />}
                {showExtraDetails && <RiArrowUpSLine size={22} />}
            </div>
        ) : null;

    const dispatch = useAppDispatch();

    const conversionRateDisplay = isDenomBase
        ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
        : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`;

    const gasCostAriaLabel = `Gas cost is ${swapGasPriceinDollars}. Conversion rate is ${conversionRateDisplay} `;
    const extraDetailsDropdown = (
        <button
            className={`${styles.extra_info_content} ${
                priceImpact && styles.extra_info_content_active
            }`}
            onClick={
                priceImpact
                    ? () => {
                          setShowExtraDetails(!showExtraDetails);
                      }
                    : undefined
            }
            tabIndex={0}
            aria-label={gasCostAriaLabel}
        >
            <div className={styles.gas_pump}>
                <FaGasPump size={12} />{' '}
                {swapGasPriceinDollars ? swapGasPriceinDollars : '…'}
            </div>
            <div
                className={styles.token_amount}
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {conversionRateDisplay}
            </div>

            {dropDownOrNull}
        </button>
    );

    const extraDetailsOrNull =
        showExtraDetails && isQtyEntered && priceImpact
            ? extraInfoDetails
            : null;

    return (
        <div className={styles.main_container}>
            {extraDetailsDropdown}
            {extraDetailsOrNull}
        </div>
    );
}

export default memo(ExtraInfo);
