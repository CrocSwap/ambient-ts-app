import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import { formatAmountOld } from '../../../utils/numbers';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

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

    const baseHarvestString = getFormattedNumber({ value: baseHarvestNum });
    const quoteHarvestString = getFormattedNumber({ value: quoteHarvestNum });

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
