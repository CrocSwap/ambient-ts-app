// START: Import React and Dongles
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';

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

    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const extraInfoData = [
        {
            title: 'Expected Token A Deposit',
            tooltipTitle: 'Expected Token A Deposit',
            data: '0.000001',
        },
        {
            title: 'Expected Token B Deposit',
            tooltipTitle: 'Expected Token B Deposit',
            data: '0.000000000000387302',
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
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {initGasPriceinDollars || '…'}
                    {/* {truncatedGasInGwei ? `${truncatedGasInGwei} gwei` : '…'} */}
                </div>
                <div className={styles.token_amount}>
                    {`${initialPrice || '...'} ${tokenPair.dataTokenB.symbol} per ${
                        tokenPair.dataTokenA.symbol
                    }`}
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {extraDetailsOrNull}
        </>
    );
}
