import styles from './PriceInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
import graphImage from '../../../assets/images/Temporary/chart.svg';

interface IPriceInfoProps {
    lowRangeDisplay: string;
    highRangeDisplay: string;
    baseLiquidityDisplay: string | undefined;
    quoteLiquidityDisplay: string | undefined;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
}

export default function PriceInfo(props: IPriceInfoProps) {
    const {
        lowRangeDisplay,
        highRangeDisplay,
        baseLiquidityDisplay,
        quoteLiquidityDisplay,
        baseFeesDisplay,
        quoteFeesDisplay,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
    } = props;
    const removePositionInfo = (
        <div className={styles.remove_position_info}>
            <Row>
                <span>Pooled {baseTokenSymbol}</span>
                <div className={styles.token_price}>
                    {baseLiquidityDisplay}
                    <img src={baseTokenLogoURI} alt='' />
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>Pooled {quoteTokenSymbol}</span>
                <div className={styles.token_price}>
                    {quoteLiquidityDisplay}
                    <img src={quoteTokenLogoURI} alt='' />
                </div>
            </Row>
            {/*  */}
            <DividerDark />
            <Row>
                <span>{baseTokenSymbol} Fees Earned</span>
                <div className={styles.token_price}>
                    {baseFeesDisplay}
                    <img src={baseTokenLogoURI} alt='' />
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>{quoteTokenSymbol} Fees Earned</span>
                <div className={styles.token_price}>
                    {quoteFeesDisplay}
                    <img src={quoteTokenLogoURI} alt='' />
                </div>
            </Row>
        </div>
    );
    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {removePositionInfo}
                <div className={styles.graph_image_container}>
                    <img src={graphImage} alt='chart' />
                </div>
            </div>
            <div className={styles.min_max_price}>
                <div className={styles.min_max_content}>
                    Min Price
                    <span className={styles.min_price}>{lowRangeDisplay ?? 0}</span>
                </div>
                <div className={styles.min_max_content}>
                    Max Price
                    <span className={styles.max_price}>{highRangeDisplay ?? 'Infinity'}</span>
                </div>
            </div>
        </div>
    );
}
