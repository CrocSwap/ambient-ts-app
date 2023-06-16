// START: Import React and Dongles
import { Dispatch, SetStateAction, useState } from 'react';
// import { FaGasPump } from 'react-icons/fa';
// import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './InitPoolExtraInfo.module.css';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { formatAmountOld } from '../../../utils/numbers';

interface InitPriceExtraInfoProps {
    initGasPriceinDollars: string | undefined;
    initialPrice: number | undefined;
    isDenomBase: boolean;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    setIsDenomBase: Dispatch<SetStateAction<boolean>>;
    invertInitialPrice?: () => void;
}

export default function InitPoolExtraInfo(props: InitPriceExtraInfoProps) {
    const {
        initialPrice,
        isDenomBase,
        initGasPriceinDollars,
        baseToken,
        quoteToken,
        invertInitialPrice,
        setIsDenomBase,
    } = props;

    const [showExtraDetails] = useState<boolean>(true);
    // const [showExtraDetails, setShowExtraDetails] = useState<boolean>(true);

    const initialPriceLocaleString = initialPrice
        ? initialPrice < 0.0001
            ? initialPrice.toExponential(2)
            : initialPrice < 2
            ? initialPrice.toPrecision(3)
            : initialPrice >= 100000
            ? formatAmountOld(initialPrice)
            : initialPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '...';

    const priceDisplayString = isDenomBase
        ? `1 ${baseToken.symbol} = ${initialPriceLocaleString} ${quoteToken.symbol}`
        : `1 ${quoteToken.symbol} = ${initialPriceLocaleString} ${baseToken.symbol}`;

    const priceDisplayDiv = (
        <div
            onClick={() => {
                invertInitialPrice ? invertInitialPrice() : null;
                setIsDenomBase(!isDenomBase);
            }}
            style={{ cursor: 'pointer' }}
        >
            {priceDisplayString}
        </div>
    );

    const extraInfoData = [
        {
            title: 'Price',
            tooltipTitle:
                'The initial price at which liquidity positions can be minted.',
            // data: `${initialPrice || '...'} ${tokenPair.dataTokenB.symbol} per ${
            //     tokenPair.dataTokenA.symbol
            // }`,
            data: priceDisplayDiv,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: `This is a dynamically updated rate to reward ${baseToken.symbol} / ${quoteToken.symbol} liquidity providers.`,
            data: 'Dynamic',
        },
        {
            title: 'Network Fee',
            tooltipTitle:
                'Estimated network fee (i.e. gas cost) to initialize pool',
            data: `${initGasPriceinDollars}`,
        },

        // {
        //     title: 'Effective Conversion Rate',
        //     tooltipTitle: 'Conversion Rate After Swap Impact and Fees',
        //     data: 'I am example data',
        // },
        // {
        //     title: 'Slippage Tolerance',
        //     tooltipTitle: 'slippage tolerance explanation',
        //     data: 'I am example data',
        // },
        // {
        //     title: 'Liquidity Provider Fee',
        //     tooltipTitle: 'liquidity provider fee explanation',
        //     data: 'I am example data',
        // },
    ];

    const extraInfoDetails = (
        <div className={styles.extra_details}>
            {extraInfoData.map((item, idx) => (
                <div className={styles.extra_row} key={idx}>
                    <div className={styles.align_center}>
                        <div>{item.title}</div>
                        <TooltipComponent title={item.tooltipTitle} />
                    </div>
                    <div className={styles.data}>{item.data}</div>
                </div>
            ))}
        </div>
    );

    const extraDetailsOrNull = showExtraDetails ? extraInfoDetails : null;

    return (
        <>
            {/* <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            > */}
            {/* <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {initGasPriceinDollars || '…'} */}
            {/* {truncatedGasInGwei ? `${truncatedGasInGwei} gwei` : '…'} */}
            {/* </div> */}
            {/* <div className={styles.token_amount}>
                    {`${initialPrice || '...'} ${tokenPair.dataTokenB.symbol} per ${
                        tokenPair.dataTokenA.symbol
                    }`}
                    <RiArrowDownSLine size={27} />{' '}
                </div> */}
            {/* </div> */}
            {extraDetailsOrNull}
        </>
    );
}
