import styles from './RangeActionInfo.module.css';
import Row from '../../Global/Row/Row';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

interface IHarvestPositionInfoProps {
    baseHarvestNum: number | undefined;
    quoteHarvestNum: number | undefined;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function HarvestPositionInfo(props: IHarvestPositionInfoProps) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseHarvestNum,
        quoteHarvestNum,
        baseTokenAddress,
        quoteTokenAddress,
    } = props;

    const baseHarvestString = getFormattedNumber({ value: baseHarvestNum });
    const quoteHarvestString = getFormattedNumber({ value: quoteHarvestNum });

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <Row>
                    <span>{baseTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {baseHarvestString !== undefined
                            ? baseHarvestString
                            : '…'}
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseTokenLogoURI)}
                            alt={baseTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
                <Row>
                    <span>{quoteTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {quoteHarvestString !== undefined
                            ? quoteHarvestString
                            : '…'}
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteTokenLogoURI)}
                            alt={quoteTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
            </div>
        </div>
    );
}
