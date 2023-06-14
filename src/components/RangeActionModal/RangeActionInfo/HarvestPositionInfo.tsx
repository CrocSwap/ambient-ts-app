import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
// import { formatAmountOld } from '../../../utils/numbers';

interface IHarvestPositionInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseRemovalNum: number;
    quoteRemovalNum: number;
    posLiqBaseDecimalCorrected: number | undefined;
    posLiqQuoteDecimalCorrected: number | undefined;
    feeLiqBaseDecimalCorrected: number | undefined;
    feeLiqQuoteDecimalCorrected: number | undefined;
    removalPercentage: number;
}

export default function HarvestPositionInfo(props: IHarvestPositionInfoProps) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        // posLiqBaseDecimalCorrected,
        // posLiqQuoteDecimalCorrected,
        feeLiqBaseDecimalCorrected,
        feeLiqQuoteDecimalCorrected,
        // removalPercentage,
        baseRemovalNum,
        quoteRemovalNum,
    } = props;

    // Temp Values
    // const baseTokenSymbol = 'ETH';
    // const quoteTokenSymbol = 'USDC';

    // const baseTokenLogoURI =
    //     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/580px-Ethereum-icon-purple.svg.png';

    // const quoteTokenLogoURI = 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';

    // const posLiqBaseDecimalCorrected = 0.2343;
    // const posLiqQuoteDecimalCorrected = 213.34;

    // const feeLiqBaseDecimalCorrected = 1;

    // const feeLiqQuoteDecimalCorrected = 21;

    // const removalPercentage = 23;

    // const liqBaseDisplay = posLiqBaseDecimalCorrected
    //     ? posLiqBaseDecimalCorrected < 2
    //         ? posLiqBaseDecimalCorrected.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 6,
    //           })
    //         : posLiqBaseDecimalCorrected.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //     : undefined;
    // const liqQuoteDisplay = posLiqQuoteDecimalCorrected
    //     ? posLiqQuoteDecimalCorrected < 2
    //         ? posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 6,
    //           })
    //         : posLiqQuoteDecimalCorrected.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //     : undefined;
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
        : undefined;
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
        : undefined;

    const baseRemovalString = baseRemovalNum
        ? baseRemovalNum < 2
            ? baseRemovalNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : baseRemovalNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const quoteRemovalString = quoteRemovalNum
        ? quoteRemovalNum < 2
            ? quoteRemovalNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : quoteRemovalNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
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
