import TokenIcon from '../TokenIcon/TokenIcon';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
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

interface propsIF {
    pool: PoolDataIF;
    goToMarket: (tknA: string, tknB: string) => void;
}

export default function PoolRow(props: propsIF) {
    const { pool, goToMarket } = props;

    const [firstToken, secondToken]: [TokenIF, TokenIF] =
        pool.moneyness.base < pool.moneyness.quote
            ? [pool.base, pool.quote]
            : [pool.quote, pool.base];

    const mobileScrenView = useMediaQuery('(max-width: 500px)');

    return (
        <TableRow
            onClick={() => goToMarket(pool.base.address, pool.quote.address)}
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
            <TableCell hidden sm>
                <p>{pool.displayPrice ?? '...'}</p>
            </TableCell>
            <TableCell>
                <p>{pool.volumeStr || '...'}</p>
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
                    <TradeButton>Trade</TradeButton>
                </FlexContainer>
            </TableCell>
        </TableRow>
    );
}
