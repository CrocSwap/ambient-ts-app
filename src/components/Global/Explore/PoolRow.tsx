import TokenIcon from '../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    getUnicodeCharacter,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import { TokenIF } from '../../../ambient-utils/types';
import {
    PoolNameWrapper,
    TradeButton,
    TableRow,
    TableCell,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useMemo } from 'react';
import styles from './PoolRow.module.css';
import { GrLineChart } from 'react-icons/gr';
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

    const mobileScrenView = useMediaQuery('(max-width: 640px)');

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

    console.log(pool);

    const splitPoolDisplay = (
        <>
            {pool?.base?.symbol} <br />
            {pool?.quote?.symbol}
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
                : pool.priceChangeStr}
        </p>
    );

    const desktopView = useMediaQuery('(min-width: 768px)');
    const buttonDisplay = (
        <div className={styles.tradeIcon}
        onClick={() =>
            goToMarket(pool.base.address, pool.quote.address)
        }
        >
            <GrLineChart size={18} />
        </div>
    );

    const ResponsiveRow: React.FC = () => {
        const displayItems = [
            mobileScrenView
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
                element: <div>{tvlDisplay}</div>,
                
            },
            {
                element: <div> {buttonDisplay}</div>,
              
                classname: styles.tradeButton,
            },
        ];

        return (
            <div className={styles.gridContainer}>
                {displayItems
                    .filter((item) => item !== null) // Filter out null values
                    .map((item, idx) => (
                        <div
                            key={idx}
                            className={`${styles.gridItem} ${item.classname}`}
                        >
                            {item?.element} {/* Safely access element */}
                        </div>
                    ))}
            </div>
        );
    };
    const yes = true;

    if (yes) return <ResponsiveRow />;

    // --------------------------------------------------------------------------------------

    return (
        <TableRow
            onClick={(event: React.MouseEvent) => {
                goToMarket(pool.base.address, pool.quote.address);
                event?.stopPropagation();
            }}

            // onMouseEnter={() => setIsHovered(true)}
            // onMouseLeave={() => setIsHovered(false)}
        >
            <TableCell>
                <FlexContainer alignItems='center'>
                    <FlexContainer
                        alignItems='center'
                        gap={4}
                        style={{ flexShrink: 0 }}
                    >
                        <TokenIcon
                            token={firstToken}
                            src={uriToHttp(firstToken.logoURI)}
                            alt={firstToken.symbol}
                            size={mobileScrenView ? 's' : '2xl'}
                        />
                        <TokenIcon
                            token={secondToken}
                            src={uriToHttp(secondToken.logoURI)}
                            alt={secondToken.symbol}
                            size={mobileScrenView ? 's' : '2xl'}
                        />
                    </FlexContainer>
                    <PoolNameWrapper>{pool.name}</PoolNameWrapper>
                </FlexContainer>
            </TableCell>
            <TableCell hidden sm left>
                <p style={{ textTransform: 'none' }}>{pool.name}</p>
            </TableCell>
            <TableCell hidden lg>
                <p>
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
            </TableCell>
            <TableCell>
                <p>{pool.volumeStr || '...'}</p>
            </TableCell>
            <TableCell>
                <p>{aprString}</p>
            </TableCell>
            <TableCell>
                <p>{!pool.tvl || pool.tvl < 0 ? '...' : pool.tvlStr}</p>
            </TableCell>
            <TableCell hidden lg>
                <p
                    style={{
                        color:
                            pool.priceChangeStr.includes('No') ||
                            !pool.priceChangeStr
                                ? 'var(--text1)'
                                : pool.priceChangeStr.startsWith('-')
                                  ? 'var(--negative)'
                                  : 'var(--positive)',
                    }}
                >
                    {!pool.priceChangeStr || pool.priceChangeStr.includes('NaN')
                        ? '...'
                        : pool.priceChangeStr}
                </p>
            </TableCell>
            <TableCell hidden sm>
                <FlexContainer
                    fullHeight
                    alignItems='center'
                    justifyContent='flex-end'
                >
                    <TradeButton
                        onClick={() =>
                            goToMarket(pool.base.address, pool.quote.address)
                        }
                    >
                        Trade
                    </TradeButton>
                </FlexContainer>
            </TableCell>
        </TableRow>
    );
}
