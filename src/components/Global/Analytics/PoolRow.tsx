import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { PoolDataIF } from '../../../contexts/ExploreContext';
import styled, { css } from 'styled-components';

interface propsIF {
    pool: PoolDataIF;
    goToMarket: (tknA: string, tknB: string) => void;
}
interface TableCellProps {
    hidden?: boolean;
    sm?: boolean;
    lg?: boolean;
    xl?: boolean;
    left?: boolean;
}
// Media queries
const media = {
    sm: '(min-width: 640px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
};
// Styles for media queries
const mediaStyles = {
    sm: css`
        @media ${media.sm} {
            display: table-cell;
        }
    `,
    lg: css`
        @media ${media.lg} {
            display: table-cell;
        }
    `,
    xl: css`
        @media ${media.xl} {
            display: table-cell;
        }
    `,
};
const FlexCenter = styled.div`
    display: flex;
    align-items: center;
`;

const TableRow = styled.tr`
    height: 40px;
    cursor: pointer;
    margin-bottom: 2px;
    &:hover {
        background-color: var(--dark2);
    }
    position: relative;
 ]
`;

// const Overlay = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background-color: var(--dark2); /* Replace with your desired color */
//   opacity:1; /* Adjust the opacity as desired */
// z-index: 2;
//   display: block;

// `;
const TableCell = styled.td<TableCellProps>`
    white-space: nowrap;
    color: var(--text1);

    text-align: ${({ left }) => (left ? 'left' : 'right')};

    ${({ hidden }) =>
        hidden &&
        css`
            display: none;
        `}

    ${({ sm }) => sm && mediaStyles.sm}
${({ lg }) => lg && mediaStyles.lg}
${({ xl }) => xl && mediaStyles.xl}
`;

const PoolNameWrapper = styled.p`
    margin-left: 1rem;

    @media (min-width: 640px) {
        display: none;
    }
`;

const TokenWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
`;

const FlexEnd = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
`;

const TradeButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--dark1);
    border: 1px solid var(--dark3);
    border-radius: 999px;
    cursor: pointer;
    width: 48px;
    height: 25px;

    &:hover {
        color: var(--accent1);
        border-color: var(--accent1);
    }
`;
export default function PoolRow(props: propsIF) {
    const { pool, goToMarket } = props;

    const [firstLogoURI, secondLogoURI]: [string, string] =
        pool.moneyness.base < pool.moneyness.quote
            ? [pool.base.logoURI, pool.quote.logoURI]
            : [pool.quote.logoURI, pool.base.logoURI];

    return (
        <TableRow
            onClick={() => goToMarket(pool.base.address, pool.quote.address)}
        >
            {/* <Overlay/> */}
            <TableCell>
                <FlexCenter>
                    <TokenWrapper>
                        <TokenIcon
                            src={uriToHttp(firstLogoURI)}
                            alt={'logo for token'}
                            size='2xl'
                        />
                        <TokenIcon
                            src={uriToHttp(secondLogoURI)}
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
            <TableCell hidden sm>
                <p>{!pool.tvl ? '...' : pool.tvlStr}</p>
            </TableCell>
            <TableCell hidden xl>
                <p
                    style={{
                        color:
                            Number(pool.apy) > 0
                                ? 'var(--positive)'
                                : 'var(--negative)',
                    }}
                >
                    {pool.apyStr + '%'}
                </p>
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
            <TableCell>
                <FlexEnd>
                    <TradeButton>
                        <span
                            style={{
                                padding: '0.25rem 0.5rem',
                                color: 'var(--text1)',
                            }}
                        >
                            Trade
                        </span>
                    </TradeButton>
                </FlexEnd>
            </TableCell>
        </TableRow>
    );
}
