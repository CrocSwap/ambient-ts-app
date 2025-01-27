import {
    getFormattedNumber,
    getUnicodeCharacter,
    uriToHttp,
} from '../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../ambient-utils/types';
import { PoolDataIF } from '../../../../contexts/ExploreContext';
import TokenIcon from '../../TokenIcon/TokenIcon';

import { useMemo } from 'react';
import { GrLineChart } from 'react-icons/gr';
import { FlexContainer } from '../../../../styled/Common';
import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import styles from './PoolRow.module.css';
interface propsIF {
    pool: PoolDataIF;
    goToMarket: (tknA: string, tknB: string) => void;
    isExploreDollarizationEnabled: boolean;
}

0;
export default function PoolRow(props: propsIF) {
    const { pool, goToMarket, isExploreDollarizationEnabled } = props;

    // const [isHovered, setIsHovered] = useState(false);

    const [firstToken, secondToken]: [TokenIF, TokenIF] =
        pool.moneyness.base < pool.moneyness.quote
            ? [pool.base, pool.quote]
            : [pool.quote, pool.base];

    const baseTokenCharacter = pool.base.symbol
        ? getUnicodeCharacter(pool.base.symbol)
        : '';
    const quoteTokenCharacter = pool.quote.symbol
        ? getUnicodeCharacter(pool.quote.symbol)
        : '';

    const characterToDisplay = useMemo(
        () =>
            pool.moneyness.base < pool.moneyness.quote
                ? quoteTokenCharacter
                : baseTokenCharacter,
        [pool],
    );

    const desktopView = useMediaQuery('(min-width: 768px)');

    const aprString =
        pool.apr && pool.apr > 0.01
            ? getFormattedNumber({
                  value: pool.apr,
                  isPercentage: true,
              }) + '%'
            : '...';

    const tokenIconsDisplay = (
        <FlexContainer alignItems='center' gap={4} style={{ flexShrink: 0 }}>
            <TokenIcon
                token={firstToken}
                src={uriToHttp(firstToken.logoURI)}
                alt={firstToken.symbol}
                size={'2xl'}
            />
            <TokenIcon
                token={secondToken}
                src={uriToHttp(secondToken.logoURI)}
                alt={secondToken.symbol}
                size={'2xl'}
            />
        </FlexContainer>
    );

    const splitPoolDisplay = (
        <>
            {pool?.base?.symbol + ' /'} <br /> {pool?.quote?.symbol}
        </>
    );

    const poolNameDisplay = <>{pool.name}</>;

    const priceDisplay = (
        <p style={{ color: 'var(--accent1)' }}>
            {isExploreDollarizationEnabled
                ? pool.usdPriceMoneynessBased !== 0
                    ? getFormattedNumber({
                          value: pool.usdPriceMoneynessBased,
                          prefix: '$',
                      })
                    : '...'
                : pool.displayPrice
                  ? characterToDisplay + pool.displayPrice
                  : '...'}
        </p>
    );

    const poolVolumeDisplay = <p>{pool.volumeStr || '...'}</p>;

    const aprDisplay = <p>{aprString}</p>;

    const tvlDisplay = <p>{!pool.tvl || pool.tvl < 0 ? '...' : pool.tvlStr}</p>;

    const priceChangeDisplay = (
        <p
            style={{
                color:
                    pool.priceChangeStr.includes('No') || !pool.priceChangeStr
                        ? 'var(--text1)'
                        : pool.priceChangeStr.startsWith('-')
                          ? 'var(--negative)'
                          : 'var(--positive)',
            }}
        >
            {!pool.priceChangeStr || pool.priceChangeStr.includes('NaN')
                ? '...'
                : !desktopView && pool.priceChangeStr.includes('No')
                  ? 'None'
                  : pool.priceChangeStr}
        </p>
    );

    const buttonDisplay = (
        <div
            className={styles.tradeIcon}
            onClick={(event: React.MouseEvent) => {
                goToMarket(pool.base.address, pool.quote.address);
                event?.stopPropagation();
            }}
        >
            <GrLineChart size={18} />
        </div>
    );

    const displayItems = [
        !desktopView
            ? null
            : {
                  element: (
                      <div className={styles.tokenIcon}>
                          {tokenIconsDisplay}
                      </div>
                  ),
              },
        {
            element: desktopView ? (
                <div>{poolNameDisplay}</div>
            ) : (
                splitPoolDisplay
            ),

            classname: styles.poolName,
        },
        {
            element: <div>{priceDisplay}</div>,
        },

        {
            element: <div>{tvlDisplay}</div>,
        },
        {
            element: <div>{poolVolumeDisplay}</div>,
        },
        desktopView
            ? {
                  element: <div>{aprDisplay}</div>,
              }
            : null,
        {
            element: <div>{priceChangeDisplay}</div>,
        },
        {
            element: <div> {buttonDisplay}</div>,

            classname: styles.tradeButton,
        },
    ];

    return (
        <div
            className={styles.gridContainer}
            onClick={(event: React.MouseEvent) => {
                goToMarket(pool.base.address, pool.quote.address);
                event?.stopPropagation();
            }}
        >
            {displayItems
                .filter((item) => item !== null) // Filter out null values
                .map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.gridItem} ${item?.classname}`}
                    >
                        {item?.element}
                    </div>
                ))}
        </div>
    );
}
