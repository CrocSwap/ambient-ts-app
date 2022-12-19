import styles from './PriceInfo.module.css';
import Row from '../../Global/Row/Row';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import Divider from '../../Global/Divider/Divider';
import { motion } from 'framer-motion';
import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';

type ItemIF = {
    slug: string;
    name: string;
    checked: boolean;
};
interface IPriceInfoProps {
    usdValue: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;

    isDenomBase: boolean;

    controlItems: ItemIF[];
}

export default function PriceInfo(props: IPriceInfoProps) {
    const dispatch = useAppDispatch();
    const {
        usdValue,
        lowRangeDisplay,
        highRangeDisplay,
        baseCollateralDisplay,
        quoteCollateralDisplay,
        baseFeesDisplay,
        quoteFeesDisplay,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,

        isDenomBase,

        controlItems,
    } = props;
    const collateralContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Pooled {baseTokenSymbol}</span>
                <div className={styles.info_text}>
                    {baseCollateralDisplay || '…'}
                    {baseTokenLogoURI ? (
                        <img src={baseTokenLogoURI} alt={baseTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>Pooled {quoteTokenSymbol}</span>
                <div className={styles.info_text}>
                    {quoteCollateralDisplay || '…'}
                    {/* <img src={quoteTokenLogoURI} alt='' /> */}
                    {quoteTokenLogoURI ? (
                        <img src={quoteTokenLogoURI} alt={quoteTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
            {/*  */}
            <Divider />
            {/* <div className={styles.divider}></div> */}
            <Row>
                <span> Earned {baseTokenSymbol}</span>
                <div className={styles.info_text}>
                    {baseFeesDisplay || '…'}
                    {baseTokenLogoURI ? (
                        <img src={baseTokenLogoURI} alt={baseTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>Earned {quoteTokenSymbol} </span>
                <div className={styles.info_text}>
                    {quoteFeesDisplay || '…'}
                    {quoteTokenLogoURI ? (
                        <img src={quoteTokenLogoURI} alt={quoteTokenSymbol} />
                    ) : (
                        <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='15px' />
                    )}
                </div>
            </Row>
        </motion.div>
    );

    // const timesContent = (
    //     <motion.div
    //         layout
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         exit={{ opacity: 0 }}
    //         className={styles.info_container}
    //     >
    //         <Row>
    //             <span>Open Time</span>
    //             <div className={styles.info_text}>25/08/22</div>
    //         </Row>

    //         <Row>
    //             <span>Close Time</span>
    //             <div className={styles.info_text}>30/08/22</div>
    //         </Row>
    //     </motion.div>
    // );

    const totalValueContent = (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.info_container}
        >
            <Row>
                <span>Total Value</span>
                <div className={styles.info_text}>{usdValue}</div>
            </Row>
        </motion.div>
    );

    const tokenPairDetails = (
        <div
            className={styles.token_pair_details_container}
            onClick={() => {
                dispatch(toggleDidUserFlipDenom());
            }}
        >
            <div className={styles.token_pair_images}>
                {baseTokenLogoURI ? (
                    <img src={baseTokenLogoURI} alt={baseTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='30px' />
                )}

                {quoteTokenLogoURI ? (
                    <img src={quoteTokenLogoURI} alt={quoteTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='30px' />
                )}
            </div>
            <p>
                {' '}
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    const minMaxPriceDipslay = (
        <div className={styles.min_max_price}>
            <div className={styles.min_max_content}>
                Min Price
                <span className={styles.min_price}>{lowRangeDisplay ?? 0}</span>
            </div>
            <div className={styles.min_max_content}>
                Current Price
                <span className={styles.min_price}>{0.0}</span>
            </div>
            <div className={styles.min_max_content}>
                Max Price
                <span className={styles.max_price}>{highRangeDisplay ?? 'Infinity'}</span>
            </div>
        </div>
    );
    // console.log(controlItems);

    return (
        <div className={styles.main_container}>
            {/* <div className={styles.price_info_container}> */}
            {tokenPairDetails}
            {controlItems[1].checked && totalValueContent}
            {/* {controlItems[0].checked && timesContent} */}
            {controlItems[0].checked && collateralContent}
            {minMaxPriceDipslay}

            {/* <div className={styles.graph_image_container}>
                    <img src={graphImage} alt='chart' />
                </div> */}
            {/* </div> */}
        </div>
    );
}
