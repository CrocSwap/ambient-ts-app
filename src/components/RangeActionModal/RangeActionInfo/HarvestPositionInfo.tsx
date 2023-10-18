import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';

interface IHarvestPositionInfoProps {
    baseHarvestNum: number | undefined;
    quoteHarvestNum: number | undefined;
}

export default function HarvestPositionInfo(props: IHarvestPositionInfoProps) {
    const { baseHarvestNum, quoteHarvestNum } = props;

    const baseHarvestString = getFormattedNumber({ value: baseHarvestNum });
    const quoteHarvestString = getFormattedNumber({ value: quoteHarvestNum });
    const tradeData = useAppSelector((state) => state.tradeData);
    const baseToken = tradeData.baseToken;
    const quoteToken = tradeData.quoteToken;

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <Row>
                    <span>{baseToken.symbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {baseHarvestString !== undefined
                            ? baseHarvestString
                            : '…'}
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseToken.logoURI)}
                            alt={baseToken.symbol}
                            size='xs'
                        />
                    </div>
                </Row>
                <Row>
                    <span>{quoteToken.symbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {quoteHarvestString !== undefined
                            ? quoteHarvestString
                            : '…'}
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteToken.logoURI)}
                            alt={quoteToken.symbol}
                            size='xs'
                        />
                    </div>
                </Row>
            </div>
        </div>
    );
}
