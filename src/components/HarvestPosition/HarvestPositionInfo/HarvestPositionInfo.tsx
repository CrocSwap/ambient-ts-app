import styles from './HarvestPositionInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
import { getFormattedTokenBalance } from '../../../App/functions/getFormattedTokenBalance';
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
        feeLiqBaseDecimalCorrected,
        feeLiqQuoteDecimalCorrected,
        baseRemovalNum,
        quoteRemovalNum,
    } = props;

    const feeLiqBaseDisplay = getFormattedTokenBalance({
        balance: feeLiqBaseDecimalCorrected,
    });

    const feeLiqQuoteDisplay = getFormattedTokenBalance({
        balance: feeLiqQuoteDecimalCorrected,
    });

    const baseRemovalString = getFormattedTokenBalance({
        balance: baseRemovalNum,
    });

    const quoteRemovalString = getFormattedTokenBalance({
        balance: quoteRemovalNum,
    });

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <Row>
                    <span>{baseTokenSymbol} Rewards Earned</span>
                    <div className={styles.token_price}>
                        {feeLiqBaseDisplay !== undefined
                            ? feeLiqBaseDisplay
                            : '…'}
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
