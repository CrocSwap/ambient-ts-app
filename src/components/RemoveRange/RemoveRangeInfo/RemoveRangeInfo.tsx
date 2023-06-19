import styles from './RemoveRangeInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';

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

    const liqBaseDisplay =
        posLiqBaseDecimalCorrected !== undefined
            ? posLiqBaseDecimalCorrected !== 0
                ? posLiqBaseDecimalCorrected < 2
                    ? posLiqBaseDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : posLiqBaseDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                : '0'
            : undefined;

    const liqQuoteDisplay =
        posLiqQuoteDecimalCorrected !== undefined
            ? posLiqQuoteDecimalCorrected !== 0
                ? posLiqQuoteDecimalCorrected < 2
                    ? posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                : '0'
            : undefined;

    const feeLiqBaseDisplay =
        feeLiqBaseDecimalCorrected !== undefined
            ? feeLiqBaseDecimalCorrected !== 0
                ? feeLiqBaseDecimalCorrected < 2
                    ? feeLiqBaseDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : feeLiqBaseDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                : '0'
            : undefined;

    const feeLiqQuoteDisplay =
        feeLiqQuoteDecimalCorrected !== undefined
            ? feeLiqQuoteDecimalCorrected !== 0
                ? feeLiqQuoteDecimalCorrected < 2
                    ? feeLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : feeLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                : '0'
            : undefined;

    const baseRemovalString =
        baseRemovalNum !== 0
            ? baseRemovalNum < 2
                ? baseRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : baseRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : '0';

    const quoteRemovalString =
        quoteRemovalNum !== 0
            ? quoteRemovalNum < 2
                ? quoteRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : quoteRemovalNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : '0';

    const rewardsEarnedSection = !isAmbient ? (
        <div>
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
        </div>
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
