import styles from './PriceInfo.module.css';

import Apy from '../../Global/Tabs/Apy/Apy';
import DividerDark from '../../Global/DividerDark/DividerDark';
import { useLocation } from 'react-router-dom';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';

interface propsIF {
    usdValue: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    isAmbient: boolean;
    isDenomBase: boolean;
    positionApy: number | undefined;
    minRangeDenomByMoneyness: string;
    maxRangeDenomByMoneyness: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function PriceInfo(props: propsIF) {
    const {
        usdValue,
        lowRangeDisplay,
        highRangeDisplay,
        baseCollateralDisplay,
        quoteCollateralDisplay,
        baseFeesDisplay,
        quoteFeesDisplay,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
        isAmbient,
        isDenomBase,
        positionApy,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        baseTokenAddress,
        quoteTokenAddress,
    } = props;

    const { pathname } = useLocation();

    const isOnTradeRoute = pathname.includes('trade');
    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);
    const baseTokenLogoDisplay = (
        <TokenIcon
            token={baseToken}
            src={baseTokenLogoURI}
            alt={baseTokenSymbol}
            size='xs'
        />
    );
    const quoteTokenLogoDisplay = (
        <TokenIcon
            token={quoteToken}
            src={quoteTokenLogoURI}
            alt={quoteTokenSymbol}
            size='xs'
        />
    );

    const totalValue = (
        <div className={styles.value_content}>
            <p>Total Value:</p>
            <p>{usdValue}</p>
        </div>
    );

    const earnedContent = isAmbient ? (
        <div className={styles.ambi_info_text}>
            Ambient position rewards are compounded back into the original
            position and are included in the amounts above.
        </div>
    ) : (
        <section>
            <div>
                <p>{`Earned ${baseTokenSymbol}`}</p>
                <p>
                    {baseFeesDisplay === undefined ? '…' : baseFeesDisplay}
                    {baseTokenLogoDisplay}
                </p>
            </div>

            <div>
                <p>{`Earned ${quoteTokenSymbol}`}</p>
                <p>
                    {quoteFeesDisplay === undefined ? '…' : quoteFeesDisplay}
                    {quoteTokenLogoDisplay}
                </p>
            </div>
        </section>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Range Min:</p>
                <h2 className={styles.low_range}>
                    {isAmbient
                        ? '0'
                        : isOnTradeRoute
                        ? lowRangeDisplay
                        : minRangeDenomByMoneyness}
                </h2>
            </section>

            <section>
                <p>Range Max:</p>
                <h2 className={styles.high_range}>
                    {isAmbient
                        ? '∞'
                        : isOnTradeRoute
                        ? highRangeDisplay
                        : maxRangeDenomByMoneyness}
                </h2>
            </section>
        </div>
    );

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                <TokenIcon
                    token={baseToken}
                    src={baseTokenLogoURI}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    token={quoteToken}
                    src={quoteTokenLogoURI}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
            </div>
            <p>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {totalValue}
                <div className={styles.earned_container}>
                    <section>
                        <div>
                            <p>{`Pooled ${baseTokenSymbol}`}</p>
                            <p>
                                {baseCollateralDisplay === undefined
                                    ? '…'
                                    : baseCollateralDisplay}
                                {baseTokenLogoDisplay}
                            </p>
                        </div>

                        <div>
                            <p>{`Pooled ${quoteTokenSymbol}`}</p>
                            <p>
                                {quoteCollateralDisplay === undefined
                                    ? '…'
                                    : quoteCollateralDisplay}
                                {quoteTokenLogoDisplay}
                            </p>
                        </div>
                    </section>
                    <DividerDark />
                    {earnedContent}
                </div>

                {priceStatusContent}
                <Apy
                    amount={positionApy || undefined}
                    fs='48px'
                    lh='60px'
                    center
                    showTitle
                />
            </div>
        </div>
    );
}
