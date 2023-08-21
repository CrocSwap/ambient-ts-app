import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import {
    TableCell,
    PoolNameWrapper,
    TokenWrapper,
    FlexCenter,
    TableRow,
    FlexEnd,
    TradeButton,
} from './Analytics.styles';
import { TokenIF } from '../../../utils/interfaces/exports';

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

    return (
        <TableRow
            onClick={() => goToMarket(pool.base.address, pool.quote.address)}
        >
            <TableCell>
                <FlexCenter>
                    <TokenWrapper>
                        <TokenIcon
                            token={firstToken}
                            src={uriToHttp(firstToken.logoURI)}
                            alt={'logo for token'}
                            size='2xl'
                        />
                        <TokenIcon
                            token={secondToken}
                            src={uriToHttp(secondToken.logoURI)}
                            alt={'logo for token'}
                            size='2xl'
                        />
                    </TokenWrapper>
                    <PoolNameWrapper>{pool.name}</PoolNameWrapper>
                </FlexCenter>
            </TableCell>
            <TableCell hidden sm left>
                <p>{pool.name}</p>
            </TableCell>
            <TableCell hidden sm>
                <p>{pool.displayPrice ?? '...'}</p>
            </TableCell>
            <TableCell>
                <p>{!pool.tvl ? '...' : pool.tvlStr}</p>
            </TableCell>
            <TableCell>
                <p>{pool.volumeStr || '...'}</p>
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
                <FlexEnd>
                    <TradeButton>Trade</TradeButton>
                </FlexEnd>
            </TableCell>
        </TableRow>
    );
}
