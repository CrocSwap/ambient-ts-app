import styles from './RemoveOrderInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
// import { formatAmount } from '../../../utils/numbers';

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
    quoteDisplayFrontend: string;
    positionLiqTotalUSD: number | undefined;
    // feeLiqBaseDecimalCorrected: number | undefined;
    // feeLiqQuoteDecimalCorrected: number | undefined;
    removalPercentage: number;
    positionLiquidity: string | undefined;
    // baseRemovalNum: number;
    // quoteRemovalNum: number;
}

export default function RemoveOrderInfo(props: IRemoveOrderInfoProps) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        usdValue,
        bidTick,
        askTick,

        baseDisplayFrontend,
        quoteDisplayFrontend,
        positionLiqTotalUSD,
        positionLiquidity,
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
                {/* -----------------TICK----------------------------------- */}
                <Row>
                    <span>Bid Tick</span>
                    <div className={styles.info_text}>{bidTick}</div>
                </Row>

                <Row>
                    <span>Ask Tick</span>
                    <div className={styles.info_text}>{askTick}</div>
                </Row>
                <DividerDark />
                {/* ----------------------------LIQUIDITY------------------------------ */}
                <div className={styles.info_container}>
                    <p>Liquidity</p>
                    <Row>
                        <div className={styles.align_center}>
                            <img src={baseTokenLogoURI} alt='' width='15px' />
                            {baseTokenSymbol}
                        </div>

                        <div className={styles.info_text}>{baseDisplayFrontend}</div>
                    </Row>
                    {/*  */}
                    <Row>
                        <div className={styles.align_center}>
                            <img src={quoteTokenLogoURI} alt='' width='15px' />
                            {quoteTokenSymbol}
                        </div>
                        <div className={styles.info_text}>{quoteDisplayFrontend}</div>
                    </Row>
                    {/*  */}

                    <Row>
                        <span> Total Liquidity</span>
                        <div className={styles.info_text}>
                            {positionLiqTotalUSD ? positionLiqTotalUSD.toFixed(2) : '...'}
                        </div>
                    </Row>
                    <Row>
                        <span> Liquidity Wei </span>
                        <div className={styles.info_text}>
                            {positionLiquidity ? parseFloat(positionLiquidity).toFixed(2) : '...'}
                        </div>
                    </Row>
                </div>
                <DividerDark />

                {/* ---------------------------REMOVAL SUMMARY--------------------------------- */}
                <Row>
                    <span>{baseTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {'baseRemovalString' !== undefined ? ' baseRemovalString' : '…'}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                <Row>
                    <span>{quoteTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {'quoteRemovalString' !== undefined ? 'quoteRemovalString' : '…'}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
            </div>
        </div>
    );
}
