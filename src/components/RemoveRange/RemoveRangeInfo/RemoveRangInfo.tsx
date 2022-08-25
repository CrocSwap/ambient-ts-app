import styles from './RemoveRangeInfo.module.css';
import Row from '../../Global/Row/Row';
import Divider from '../../Global/Divider/Divider';
// import { formatAmount } from '../../../utils/numbers';

interface IRemoveRangeInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    posLiqBaseDecimalCorrected: number | undefined;
    posLiqQuoteDecimalCorrected: number | undefined;
    feeLiqBaseDecimalCorrected: number | undefined;
    feeLiqQuoteDecimalCorrected: number | undefined;
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
    } = props;

    const liqBaseDisplay = posLiqBaseDecimalCorrected
        ? posLiqBaseDecimalCorrected < 2
            ? posLiqBaseDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : posLiqBaseDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : // ? formatAmount(posLiqBaseDecimalCorrected)
          '0.00';
    const liqQuoteDisplay = posLiqQuoteDecimalCorrected
        ? posLiqQuoteDecimalCorrected < 2
            ? posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : // ? formatAmount(posLiqQuoteDecimalCorrected)
          '0.00';
    const feeLiqBaseDisplay = feeLiqBaseDecimalCorrected
        ? feeLiqBaseDecimalCorrected < 2
            ? feeLiqBaseDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : feeLiqBaseDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : // ? formatAmount(feeLiqBaseDecimalCorrected)
          '0.00';
    const feeLiqQuoteDisplay = feeLiqQuoteDecimalCorrected
        ? feeLiqQuoteDecimalCorrected < 2
            ? feeLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : feeLiqQuoteDecimalCorrected.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : '0.00';

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <Row>
                    <span>Pooled {baseTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {liqBaseDisplay}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                {/*  */}
                <Row>
                    <span>Pooled {quoteTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {liqQuoteDisplay}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
                {/*  */}
                <Divider />
                <Row>
                    <span>{baseTokenSymbol} Fees Earned</span>
                    <div className={styles.token_price}>
                        {feeLiqBaseDisplay}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                {/*  */}
                <Row>
                    <span>{quoteTokenSymbol} Fees Earned</span>
                    <div className={styles.token_price}>
                        {feeLiqQuoteDisplay}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
            </div>
        </div>
    );
}
