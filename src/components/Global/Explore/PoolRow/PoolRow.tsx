import {
    getFormattedNumber,
    getUnicodeCharacter,
    uriToHttp,
} from '../../../../ambient-utils/dataLayer';
import { PoolIF, TokenIF } from '../../../../ambient-utils/types';
import TokenIcon from '../../TokenIcon/TokenIcon';

import { useMemo } from 'react';
import { GrLineChart } from 'react-icons/gr';
import { FlexContainer } from '../../../../styled/Common';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './PoolRow.module.css';
interface propsIF {
    pool: PoolIF;
    goToMarket: (tknA: string, tknB: string) => void;
    isExploreDollarizationEnabled: boolean;
}

0;
export default function PoolRow(props: propsIF) {
    const { pool, goToMarket, isExploreDollarizationEnabled } = props;

    // const [isHovered, setIsHovered] = useState(false);

    const [firstToken, secondToken]: [TokenIF, TokenIF] =
        pool.isBaseTokenMoneynessGreaterOrEqual
            ? [pool.quote, pool.base]
            : [pool.base, pool.quote];

    if (pool.quote.symbol === 'WBTC' || pool.base.symbol === 'WBTC') {
        console.log({ firstToken, secondToken, pool });
    }

    const baseTokenCharacter = pool.base.symbol
        ? getUnicodeCharacter(pool.base.symbol)
        : '';
    const quoteTokenCharacter = pool.quote.symbol
        ? getUnicodeCharacter(pool.quote.symbol)
        : '';

    const characterToDisplay = useMemo(
        () =>
            !pool.isBaseTokenMoneynessGreaterOrEqual
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
                  ? characterToDisplay + pool.displayPriceString
                  : '...'}
        </p>
    );

    // format volume, use empty string as backup value
    const volumeDisplayString: string = pool.volumeChange24h
        ? getFormattedNumber({
              value: pool.volumeChange24h,
              prefix: '$',
          })
        : '';

    const poolVolumeDisplay = <p>{volumeDisplayString || '...'}</p>;

    const aprDisplay = <p>{aprString}</p>;

    // format TVL, use empty string as backup value
    const tvlDisplayString: string = pool.tvlTotalUsd
        ? getFormattedNumber({
              value: pool.tvlTotalUsd,
              isTvl: true,
              prefix: '$',
          })
        : '';

    const tvlDisplay = (
        <p>
            {!pool.tvlTotalUsd || pool.tvlTotalUsd < 0
                ? '...'
                : tvlDisplayString}
        </p>
    );

    console.log(pool.priceChangePercent);

    const priceChangeDisplay = (
        <p
            style={{
                color:
                    !pool.priceChangePercent ||
                    pool.priceChangePercent.includes('No')
                        ? 'var(--text1)'
                        : pool.priceChangePercent.startsWith('-')
                          ? 'var(--negative)'
                          : 'var(--positive)',
            }}
        >
            {!pool.priceChangePercent || pool.priceChangePercent.includes('NaN')
                ? '...'
                : !desktopView && pool.priceChangePercent.includes('No')
                  ? 'None'
                  : pool.priceChangePercent}
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
