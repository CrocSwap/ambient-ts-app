import styles from './RemoveOrderInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
// import { formatAmountOld } from '../../../utils/numbers';

interface IRemoveOrderInfoProps {
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
    removalPercentage: number;
    positionLiquidity: string | undefined;
    baseRemovalString: string;
    quoteRemovalString: string;
}

export default function RemoveOrderInfo(props: IRemoveOrderInfoProps) {
    const {
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
        baseRemovalString,
        quoteRemovalString,
        // positionLiqTotalUSD,
        // positionLiquidity,
    } = props;

    const baseCurrentQtyRow =
        baseDisplay !== '0' ? (
            <Row>
                <span>Token Quantity</span>
                <div className={styles.align_center}>
                    <p className={styles.info_text}>{baseDisplay}</p>
                    <img src={baseTokenLogoURI} alt='' width='15px' />
                </div>
            </Row>
        ) : null;

    const baseReturnQtyRow =
        baseRemovalString !== '0.00' ? (
            <Row>
                <span>Return Quantity</span>
                <div className={styles.align_center}>
                    <p className={styles.info_text}>{baseRemovalString}</p>
                    <img src={baseTokenLogoURI} alt='' width='15px' />
                </div>
            </Row>
        ) : null;

    const quoteCurrentQtyRow =
        quoteDisplay !== '0' ? (
            <Row>
                <span>Current Quantity</span>
                <div className={styles.align_center}>
                    <p className={styles.info_text}>{quoteDisplay}</p>
                    <img src={quoteTokenLogoURI} alt='' width='15px' />
                </div>
            </Row>
        ) : null;

    const quoteReturnQtyRow =
        quoteRemovalString !== '0.00' ? (
            <Row>
                <span>Return Quantity</span>
                <div className={styles.align_center}>
                    <p className={styles.info_text}>{quoteRemovalString}</p>
                    <img src={quoteTokenLogoURI} alt='' width='15px' />
                </div>
            </Row>
        ) : null;

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                {/* ----------------------VALUE------------------------ */}
                <Row>
                    <span>Total Value</span>
                    <div className={styles.token_price}>{'$' + usdValue}</div>
                </Row>
                <DividerDark />

                {/* ----------------------------LIQUIDITY------------------------------ */}
                <div className={styles.info_container}>
                    {baseCurrentQtyRow}
                    {quoteCurrentQtyRow}
                </div>
                <DividerDark />

                {/* ---------------------------REMOVAL SUMMARY--------------------------------- */}
                {baseReturnQtyRow}
                {quoteReturnQtyRow}
                {/* <Row>
                    <span> Return Quantity</span>
                    <div className={styles.token_price}>
                        4,200.00
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row> */}
            </div>
        </div>
    );
}
