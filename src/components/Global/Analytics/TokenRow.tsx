// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import {
    TableRow,
    TableCell,
    TradeButton,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { PoolIF, TokenIF } from '../../../ambient-utils/types';
import { useContext } from 'react';
import { PoolContext } from '../../../contexts/PoolContext';
import { getDefaultPairForChain } from '../../../ambient-utils/constants';
import styles from './TokenRow.module.css';

interface propsIF {
    token: dexTokenData;
    samplePool: PoolIF | undefined;
    goToMarket: (tknA: string, tknB: string) => void;
    chainId: string;
}

export default function TokenRow(props: propsIF) {
    const { token, samplePool, goToMarket, chainId } = props;
    if (!token.tokenMeta) return null;

    const mobileScrenView = useMediaQuery('(max-width: 500px)');

    const { findPool } = useContext(PoolContext);
    const defaultTokensForChain: [TokenIF, TokenIF] =
        getDefaultPairForChain(chainId);
    const p1: PoolIF | undefined = findPool(
        token.tokenAddr,
        defaultTokensForChain[0],
    );
    const p2: PoolIF | undefined = findPool(
        token.tokenAddr,
        defaultTokensForChain[1],
    );
    console.log(p1, p2);

    return (
        <TableRow className={styles.token_row}>
            <TableCell>
                <FlexContainer
                    alignItems='center'
                    justifyContent='space-between'
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <TokenIcon
                            token={token.tokenMeta}
                            src={uriToHttp(token.tokenMeta?.logoURI ?? '')}
                            alt={token.tokenMeta?.logoURI ?? ''}
                            size={mobileScrenView ? 's' : '2xl'}
                            empty={
                                !(
                                    !!token.tokenMeta?.logoURI &&
                                    !!token.tokenMeta.symbol
                                )
                            }
                        />
                        <p>{token.tokenMeta?.symbol}</p>
                    </div>
                    <p>({token.tokenMeta?.name})</p>
                </FlexContainer>
            </TableCell>
            <TableCell>
                <p style={{ textTransform: 'none' }}>
                    {getFormattedNumber({
                        value:
                            token.dexTvl /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                        isTvl: true,
                    })}
                </p>
            </TableCell>
            <TableCell>
                <p>
                    {getFormattedNumber({
                        value:
                            token.dexFees /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                    })}
                </p>
            </TableCell>
            <TableCell>
                <p>
                    {getFormattedNumber({
                        value:
                            token.dexVolume /
                            Math.pow(10, token.tokenMeta.decimals),
                        prefix: '$',
                    })}
                </p>
            </TableCell>
            <TableCell>
                {samplePool && (
                    <FlexContainer
                        fullHeight
                        alignItems='center'
                        justifyContent='flex-end'
                    >
                        <TradeButton
                            onClick={() =>
                                goToMarket(
                                    samplePool.base.address,
                                    samplePool.quote.address,
                                )
                            }
                        >
                            Trade
                        </TradeButton>
                    </FlexContainer>
                )}
            </TableCell>
        </TableRow>
        // <li className={styles.token_row}>
        //     <TokenIcon token={token.tokenMeta} />
        // </li>
    );
}
