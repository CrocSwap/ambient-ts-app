// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './ExtraInfo.module.css';
// import truncateDecimals from '../../../utils/data/truncateDecimals';
// import makePriceDisplay from './makePriceDisplay';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { CrocImpact } from '@crocswap-libs/sdk';
// import DenominationSwitch from '../DenominationSwitch/DenominationSwitch';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';

// interface for props in this file
interface propsIF {
    tokenPair: TokenPairIF;
    priceImpact: CrocImpact | undefined;
    poolPriceDisplay: number;
    slippageTolerance: number;
    liquidityProviderFee: number;
    quoteTokenIsBuy: boolean;
    swapGasPriceinDollars: string | undefined;
    didUserFlipDenom: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    isOnTradeRoute?: boolean;
    displayEffectivePriceString: string;
    account: string | undefined;
}

// central react functional component
export default function ExtraInfo(props: propsIF) {
    const {
        priceImpact,
        displayEffectivePriceString,
        poolPriceDisplay,
        slippageTolerance,
        liquidityProviderFee,
        swapGasPriceinDollars,
        isOnTradeRoute,
        account,
    } = props;

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(
        isOnTradeRoute ? false : false,
    );

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const displayPriceWithDenom = isDenomBase
        ? 1 / poolPriceDisplay
        : poolPriceDisplay;

    const displayPriceString =
        displayPriceWithDenom === Infinity || displayPriceWithDenom === 0
            ? '…'
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

    const priceImpactString = !priceImpactNum
        ? '…'
        : priceImpactNum >= 100
        ? priceImpactNum.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
          })
        : priceImpactNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

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
            data: `${liquidityProviderFee * 100} %`,
            placement: 'bottom',
        },
    ];

    const extraInfoData = [
        {
            title: 'Effective Conversion Rate',
            tooltipTitle: 'After Price Impact and Provider Fee',
            data: isDenomBase
                ? `${displayEffectivePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${displayEffectivePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            placement: 'bottom',
        },
        {
            title: 'Price Impact',
            tooltipTitle:
                'Difference Between Current (Spot) Price and Final Price',
            // eslint-disable-next-line no-irregular-whitespace
            data: `${priceImpactString} %`,
            placement: 'bottom',
        },
    ];

    if (
        [
            '0xe09de95d2a8a73aa4bfa6f118cd1dcb3c64910dc',
            '0xa86dabfbb529a4c8186bdd52bd226ac81757e090',
        ].includes(account?.toLowerCase() ?? '')
    ) {
        extraInfoData.push({
            title: 'Final Price',
            tooltipTitle: 'Expected Price After Swap',
            data: isDenomBase
                ? `${finalPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                : `${finalPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`,
            placement: 'bottom',
        });
    }
    const extraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) =>
                item ? (
                    <div className={styles.extra_row} key={idx}>
                        <div className={styles.align_center}>
                            <div>{item.title}</div>
                            <TooltipComponent
                                title={item.tooltipTitle}
                                placement={item.placement as 'bottom'}
                            />
                        </div>
                        <div
                            className={styles.data}
                            style={{
                                color:
                                    item.title === 'Price Impact' &&
                                    priceImpactNum
                                        ? Math.abs(priceImpactNum) > 2
                                            ? '#f6385b'
                                            : '#15be67'
                                        : '#bdbdbd',
                            }}
                        >
                            {item.data}
                        </div>
                    </div>
                ) : null,
            )}
        </div>
    );
    const feesAndSlippageDetails = (
        <div className={styles.extra_details}>
            {feesAndSlippageData.map((item, idx) =>
                item ? (
                    <div className={styles.extra_row} key={idx}>
                        <div className={styles.align_center}>
                            <div>{item.title}</div>
                            <TooltipComponent
                                title={item.tooltipTitle}
                                placement={item.placement as 'bottom'}
                            />
                        </div>
                        <div
                            className={styles.data}
                            style={{
                                color:
                                    item.title === 'Price Impact' &&
                                    priceImpactNum
                                        ? Math.abs(priceImpactNum) > 2
                                            ? '#f6385b'
                                            : '#15be67'
                                        : '#bdbdbd',
                            }}
                        >
                            {item.data}
                        </div>
                    </div>
                ) : null,
            )}
        </div>
    );
    const dropDownOrNull = priceImpact ? (
        <div style={{ cursor: 'pointer' }}>
            <RiArrowDownSLine size={20} />
        </div>
    ) : null;
    const dispatch = useAppDispatch();

    // const updateShowExtraDetails = () => {
    //     if (
    //         !showExtraDetails &&
    //         priceImpact?.percentChange &&
    //         Math.abs(priceImpact?.percentChange) > 0.02
    //     ) {
    //         setShowExtraDetails(true);
    //     } else if (
    //         showExtraDetails &&
    //         (!priceImpact ||
    //             (priceImpact?.percentChange && Math.abs(priceImpact?.percentChange) <= 0.02)) &&
    //         !hasUserChosenToDisplayExtraInfo
    //     ) {
    //         setShowExtraDetails(false);
    //     }
    // };

    // useEffect(() => {
    //     updateShowExtraDetails();
    // }, [priceImpact?.percentChange]);

    const extraDetailsDropdown = (
        <div
            className={styles.extra_info_content}
            onClick={
                priceImpact
                    ? () => {
                          setShowExtraDetails(!showExtraDetails);
                      }
                    : undefined
            }
        >
            <div className={styles.gas_pump}>
                <FaGasPump size={12} />{' '}
                {swapGasPriceinDollars ? swapGasPriceinDollars : '…'}
                {/* {truncatedGasInGwei ? `${truncatedGasInGwei} gwei` : '…'} */}
            </div>
            <div
                className={styles.token_amount}
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {isDenomBase
                    ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
                    : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`}
            </div>
            {/* <DenominationSwitch /> */}

            {dropDownOrNull}
        </div>
    );
    // const extraDetailsNoDropdown = (
    //     <div className={styles.extra_info_content} style={{ cursor: 'default' }}>
    //         <div className={styles.gas_pump}>
    //             <FaGasPump size={15} /> {swapGasPriceinDollars ? swapGasPriceinDollars : '…'}
    //         </div>
    //         <div className={styles.token_amount}>
    //             {isDenomBase
    //                 ? `1 ${baseTokenSymbol} ≈ ${displayPriceString} ${quoteTokenSymbol}`
    //                 : `1 ${quoteTokenSymbol} ≈ ${displayPriceString} ${baseTokenSymbol}`}
    //         </div>
    //         <DenominationSwitch />

    //     </div>
    // );
    // const extraDetailsNoDropDownOrNull = !priceImpact ? extraDetailsNoDropdown : null;
    // const extraDetailsDropDownOrNull = priceImpact ? extraDetailsDropdown : null;
    const extraDetailsOrNull =
        showExtraDetails && priceImpact ? extraInfoDetails : null;
    const feesAndSlippageOrNull =
        showExtraDetails && priceImpact ? feesAndSlippageDetails : null;

    return (
        <>
            {/* {extraDetailsNoDropDownOrNull} */}
            {extraDetailsDropdown}
            {/* {dropDownOrNull} */}
            {extraDetailsOrNull}
            {feesAndSlippageOrNull}
        </>
    );
}
