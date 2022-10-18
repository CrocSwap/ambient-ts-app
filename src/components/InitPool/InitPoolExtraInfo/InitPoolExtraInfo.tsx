// START: Import React and Dongles
import { useState } from 'react';
// import { FaGasPump } from 'react-icons/fa';
// import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './InitPoolExtraInfo.module.css';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import { TokenPairIF } from '../../../utils/interfaces/TokenPairIF';

interface InitPriceExtraInfoProps {
    initGasPriceinDollars: string | undefined;
    initialPrice: number;
    tokenPair: TokenPairIF;
}

export default function InitPoolExtraInfo(props: InitPriceExtraInfoProps) {
    const { initialPrice, initGasPriceinDollars, tokenPair } = props;

    const [showExtraDetails] = useState<boolean>(true);
    // const [showExtraDetails, setShowExtraDetails] = useState<boolean>(true);

    const initialPriceLocaleString = initialPrice
        ? initialPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const extraInfoData = [
        {
            title: 'Price',
            tooltipTitle: 'The initial price at which liquidity positions can be minted.',
            // data: `${initialPrice || '...'} ${tokenPair.dataTokenB.symbol} per ${
            //     tokenPair.dataTokenA.symbol
            // }`,
            data: `1 ${tokenPair.dataTokenA.symbol} = ${initialPriceLocaleString} ${tokenPair.dataTokenB.symbol}`,
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: '',
            data: 'Dynamic',
        },
        {
            title: 'Network Fee',
            tooltipTitle: 'Estimated network fee (i.e. gas cost) to initialize pool',
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
