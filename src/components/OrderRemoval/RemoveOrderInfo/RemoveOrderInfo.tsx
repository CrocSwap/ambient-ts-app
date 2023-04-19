import styles from './RemoveOrderInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';

interface IRemoveOrderInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    usdValue: string;

    baseDisplayFrontend: string;
    baseDisplay: string;
    quoteDisplay: string;
    quoteDisplayFrontend: string;
    removalPercentage: number;
    positionLiquidity: string | undefined;
    baseRemovalString: string;
    quoteRemovalString: string;
}

export default function RemoveOrderInfo(props: IRemoveOrderInfoProps) {
    const {
        baseTokenLogoURI,
        quoteTokenLogoURI,
        usdValue,
        baseDisplay,
        quoteDisplay,
        baseRemovalString,
        quoteRemovalString,
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
            </div>
        </div>
    );
}
