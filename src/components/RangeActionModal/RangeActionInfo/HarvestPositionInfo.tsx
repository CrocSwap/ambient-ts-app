import { useContext } from 'react';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { TokenContext } from '../../../contexts/TokenContext';
import Row from '../../Global/Row/Row';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './RangeActionInfo.module.css';

interface propsIF {
    baseHarvestNum: number | undefined;
    quoteHarvestNum: number | undefined;
    fiatHarvestVal: string | undefined;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function HarvestPositionInfo(props: propsIF) {
    const {
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseHarvestNum,
        quoteHarvestNum,
        baseTokenAddress,
        quoteTokenAddress,
        fiatHarvestVal,
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
                    <span>Earned {baseTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {baseHarvestString ?? '…'}
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseTokenLogoURI)}
                            alt={baseTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
                <Row>
                    <span>Earned {quoteTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {quoteHarvestString ?? '…'}
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteTokenLogoURI)}
                            alt={quoteTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
                <Row>
                    <span>Removal Value</span>
                    <div className={styles.token_price}>
                        {fiatHarvestVal ?? '…'}
                        <TokenIcon size='xs' empty />
                    </div>
                </Row>
            </div>
        </div>
    );
}
