import { Dispatch, SetStateAction, useContext, useState } from 'react';

import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { AppStateContext } from '../../../contexts';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import styles from './InitPoolExtraInfo.module.css';

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
        setIsDenomBase,
    } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const [showExtraDetails] = useState<boolean>(true);
    // const [showExtraDetails, setShowExtraDetails] = useState<boolean>(true);

    const initialPriceLocaleString = getFormattedNumber({
        value: initialPrice,
    });

    const priceDisplayString = isDenomBase
        ? `1 ${baseToken.symbol} = ${initialPriceLocaleString} ${quoteToken.symbol}`
        : `1 ${quoteToken.symbol} = ${initialPriceLocaleString} ${baseToken.symbol}`;

    const priceDisplayDiv = (
        <div
            onClick={() => {
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
            tooltipTitle: `This is a dynamically updated rate to reward ${
                isDenomBase ? baseToken.symbol : quoteToken.symbol
            } / ${
                isDenomBase ? quoteToken.symbol : baseToken.symbol
            } liquidity providers.`,
            data: 'Dynamic',
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
            {(chainId === '0x1'
                ? extraInfoData.concat({
                      title: 'Network Fee',
                      tooltipTitle:
                          'Estimated network fee (i.e. gas cost) to initialize pool',
                      data: `${
                          initGasPriceinDollars ? initGasPriceinDollars : '...'
                      }`,
                  })
                : extraInfoData
            ).map((item, idx) => (
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
        <div style={{ padding: '0 40px', width: '100%' }}>
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
        </div>
    );
}
