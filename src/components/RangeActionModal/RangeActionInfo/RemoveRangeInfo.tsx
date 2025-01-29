import { useContext } from 'react';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { TokenContext } from '../../../contexts/TokenContext';
import DividerDark from '../../Global/DividerDark/DividerDark';
import Row from '../../Global/Row/Row';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './RangeActionInfo.module.css';

interface propsIF {
    baseTokenAddress: string;
    quoteTokenAddress: string;
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
    fiatRemovalVal: string;
    isAmbient: boolean;
}

export default function RemoveRangeInfo(props: propsIF) {
    const {
        baseTokenAddress,
        quoteTokenAddress,
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
        fiatRemovalVal,
        isAmbient,
    } = props;

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

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
                <span>Earned {baseTokenSymbol}</span>
                <div className={styles.token_price}>
                    {feeLiqBaseDisplay !== undefined ? feeLiqBaseDisplay : '…'}
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
                    {feeLiqQuoteDisplay !== undefined
                        ? feeLiqQuoteDisplay
                        : '…'}
                    <TokenIcon
                        token={quoteToken}
                        src={uriToHttp(quoteTokenLogoURI)}
                        alt={quoteTokenSymbol}
                        size='xs'
                    />
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
                        <TokenIcon
                            token={baseToken}
                            src={uriToHttp(baseTokenLogoURI)}
                            alt={baseTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
                <Row>
                    <span>Pooled {quoteTokenSymbol}</span>
                    <div className={styles.token_price}>
                        {liqQuoteDisplay !== undefined ? liqQuoteDisplay : '…'}
                        <TokenIcon
                            token={quoteToken}
                            src={uriToHttp(quoteTokenLogoURI)}
                            alt={quoteTokenSymbol}
                            size='xs'
                        />
                    </div>
                </Row>
                {rewardsEarnedSection}
                <DividerDark />
                <Row>
                    <span>{baseTokenSymbol} Removal Summary</span>
                    <div className={styles.token_price}>
                        {baseRemovalString ?? '…'}
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
                        {quoteRemovalString ?? '…'}
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
                        {fiatRemovalVal ?? '…'}
                        <TokenIcon size='xs' empty />
                    </div>
                </Row>
            </div>
        </div>
    );
}
