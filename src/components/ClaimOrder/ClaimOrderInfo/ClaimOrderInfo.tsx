import styles from './ClaimOrderInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
// import { formatAmount } from '../../../utils/numbers';

interface IClaimOrderInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    posLiqBaseDecimalCorrected: number | undefined;
    posLiqQuoteDecimalCorrected: number | undefined;
    usdValue: string;
    bidTick: number | undefined;
    askTick: number | undefined;
    baseDisplayFrontend: string;
    baseDisplay: string;
    quoteDisplay: string;
    quoteDisplayFrontend: string;
    positionLiqTotalUSD: number | undefined;
    // feeLiqBaseDecimalCorrected: number | undefined;
    // feeLiqQuoteDecimalCorrected: number | undefined;
    claimPercentage: number;
    positionLiquidity: string | undefined;
    baseClaimString: string;
    quoteClaimString: string;
    pivotTime: number;
}

export default function ClaimOrderInfo(props: IClaimOrderInfoProps) {
    const {
        pivotTime,
        // baseTokenSymbol,
        // quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        usdValue,
        baseDisplay,
        quoteDisplay,
        // bidTick,
        // askTick,

        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        // baseRemovalString,
        // quoteRemovalString,
        // positionLiqTotalUSD,
        // positionLiquidity,
    } = props;

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                {/* ----------------------VALUE------------------------ */}
                <Row>
                    <span>Total Value</span>
                    <div className={styles.token_price}>{usdValue}</div>
                </Row>
                <DividerDark />

                {/* ----------------------------LIQUIDITY------------------------------ */}
                <div className={styles.info_container}>
                    <Row>
                        <span>Token Quantity</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>{baseDisplay}</p>
                            <img src={baseTokenLogoURI} alt='' width='15px' />
                        </div>
                    </Row>
                    {/*  */}
                    <Row>
                        <span>Limit Order Price</span>
                        <div className={styles.align_center}>
                            <div className={styles.info_text}>{quoteDisplay}</div>
                            <img src={quoteTokenLogoURI} alt='' width='15px' />
                        </div>
                    </Row>
                    {/*  */}
                </div>
                <DividerDark />

                {/* ---------------------------REMOVAL SUMMARY--------------------------------- */}

                <Row>
                    <span>Fill Time</span>
                    <div className={styles.token_price}>{pivotTime}</div>
                </Row>
                <Row>
                    <span> Claimable Amount</span>
                    <div className={styles.token_price}>
                        4,200.00
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
            </div>
        </div>
    );
}
