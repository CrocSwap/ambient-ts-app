import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { PoolDataIF } from '../../../contexts/AnalyticsContext';
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
const TableCell = styled.td<TableCellProps>`
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    white-space: nowrap;

    ${({ hidden }) =>
        hidden &&
        css`
            display: none;
        `}

    ${({ sm }) => sm && mediaStyles.sm}
${({ lg }) => lg && mediaStyles.lg}
${({ xl }) => xl && mediaStyles.xl}
`;

export default function PoolRow(props: propsIF) {
    const { pool, goToMarket } = props;

    return (
        <tr
            className='hover:bg-dark2 cursor-pointer  '
            onClick={() => goToMarket(pool.base.address, pool.quote.address)}
        >
            <TableCell>
                <div className='flex items-center'>
                    <div className='flex-shrink-0 flex items-center'>
                        <TokenIcon
                            src={uriToHttp(pool.base.logoURI)}
                            alt={'logo for token: ' + pool.base.name}
                            size='2xl'
                        />
                        <TokenIcon
                            src={uriToHttp(pool.quote.logoURI)}
                            alt={'logo for token: ' + pool.quote.name}
                            size='2xl'
                        />
                    </div>
                    <div className='ml-4  sm:hidden '>
                        <div className='text-text1'>{pool.name}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell hidden sm>
                <div className=' text-text1'>{pool.name}</div>
            </TableCell>
            <TableCell hidden sm>
                <div className=' text-accent5'>{pool.displayPrice}</div>
            </TableCell>
            <TableCell hidden sm>
                <div className=' text-text1'>
                    {!pool.tvl || pool.tvl.includes('NaN') ? '' : pool.tvl}
                </div>
            </TableCell>
            <TableCell hidden xl>
                <div
                    className={`text-text1 ${
                        Number(pool.apy) > 0 ? 'text-positive' : 'text-negative'
                    }`}
                >
                    {pool.apy}
                </div>
            </TableCell>
            <TableCell>
                <div className=' text-text1'>{pool.volume}</div>
            </TableCell>
            <TableCell hidden lg>
                <div
                    className={`text-text1 ${
                        pool.priceChange.startsWith('-')
                            ? 'text-negative'
                            : 'text-positive'
                    }`}
                >
                    {pool.priceChange}
                </div>
            </TableCell>
            <TableCell>
                <div className='flex items-center justify-end h-full'>
                    <button
                        className='flex items-center justify-center text-bg-dark1 border-dark3 border rounded-full hover:text-accent1 hover:border-accent1'
                        style={{
                            width: '48px',
                            height: '25px',
                        }}
                    >
                        <span className='px-2 py-1'>Trade</span>
                    </button>
                </div>
            </TableCell>
        </tr>
    );
}
