import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import { formatAmountOld } from '../../../utils/numbers';

interface IHarvestPositionInfoProps {
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseHarvestNum: number | undefined;
    quoteHarvestNum: number | undefined;
}

export default function HarvestPositionInfo(props: IHarvestPositionInfoProps) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseHarvestNum,
        quoteHarvestNum,
    } = props;

    const baseHarvestString =
        baseHarvestNum !== undefined
            ? baseHarvestNum === 0
                ? '0.00'
                : baseHarvestNum < 0.0001
                ? baseHarvestNum.toExponential(2)
                : baseHarvestNum < 2
                ? baseHarvestNum.toPrecision(3)
                : baseHarvestNum >= 10000
                ? formatAmountOld(baseHarvestNum, 2)
                : baseHarvestNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : undefined;

    const quoteHarvestString =
        quoteHarvestNum !== undefined
            ? quoteHarvestNum === 0
                ? '0.00'
                : quoteHarvestNum < 0.0001
                ? quoteHarvestNum.toExponential(2)
                : quoteHarvestNum < 2
                ? quoteHarvestNum.toPrecision(3)
                : quoteHarvestNum >= 10000
                ? formatAmountOld(quoteHarvestNum, 2)
                : quoteHarvestNum.toLocaleString(undefined, {
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
                        {baseHarvestString !== undefined
                            ? baseHarvestString
                            : '…'}
                        <img src={baseTokenLogoURI} alt='' />
                    </div>
                </Row>
                <Row>
                    <span>{quoteTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {quoteHarvestString !== undefined
                            ? quoteHarvestString
                            : '…'}
                        <img src={quoteTokenLogoURI} alt='' />
                    </div>
                </Row>
            </div>
        </div>
    );
}
