import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

interface IRemoveRangeInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    posLiqBaseDecimalCorrected: number | undefined;
    posLiqQuoteDecimalCorrected: number | undefined;
    feeLiqBaseDecimalCorrected: number | undefined;
    feeLiqQuoteDecimalCorrected: number | undefined;
    removalPercentage: number;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    isAmbient: boolean;
}

export default function RemoveRangeInfo(props: IRemoveRangeInfoProps) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        feeLiqBaseDecimalCorrected,
        feeLiqQuoteDecimalCorrected,
        baseRemovalNum,
        quoteRemovalNum,
        isAmbient,
    } = props;

    const liqBaseDisplay = getFormattedNumber({
        value: posLiqBaseDecimalCorrected,
    });
    const liqQuoteDisplay = getFormattedNumber({
        value: posLiqQuoteDecimalCorrected,
    });
    const feeLiqBaseDisplay = getFormattedNumber({
        value: feeLiqBaseDecimalCorrected,
    });
    const feeLiqQuoteDisplay = getFormattedNumber({
        value: feeLiqQuoteDecimalCorrected,
    });
    const baseRemovalString = getFormattedNumber({
        value: baseRemovalNum,
    });
    const quoteRemovalString = getFormattedNumber({
        value: quoteRemovalNum,
    });

    const rewardsEarnedSection = !isAmbient ? (
        <>
            <DividerDark />
            <Row>
                <span>{baseTokenSymbol} Rewards Earned</span>
                <div className={styles.token_price}>
                    {feeLiqBaseDisplay !== undefined ? feeLiqBaseDisplay : '…'}
                    <img src={baseTokenLogoURI} alt='' />
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>{quoteTokenSymbol} Rewards Earned</span>
                <div className={styles.token_price}>
                    {feeLiqQuoteDisplay !== undefined
                        ? feeLiqQuoteDisplay
                        : '…'}
                    <img src={quoteTokenLogoURI} alt='' />
                </div>
            </Row>
        </>
    ) : (
        <div>
            <DividerDark />

            <div className={styles.ambi_info_text}>
                Ambient position rewards are compounded back into the original
                position and are included in the amounts above.
            </div>
        </div>
    );

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <Row>
                    <span>Pooled {baseTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {liqBaseDisplay !== undefined ? liqBaseDisplay : '…'}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                {/*  */}
                <Row>
                    <span>Pooled {quoteTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {liqQuoteDisplay !== undefined ? liqQuoteDisplay : '…'}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
                {/*  */}
                {rewardsEarnedSection}
                <DividerDark />
                <Row>
                    <span>{baseTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {baseRemovalString !== undefined
                            ? baseRemovalString
                            : '…'}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                <Row>
                    <span>{quoteTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {quoteRemovalString !== undefined
                            ? quoteRemovalString
                            : '…'}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
            </div>
        </div>
    );
}
