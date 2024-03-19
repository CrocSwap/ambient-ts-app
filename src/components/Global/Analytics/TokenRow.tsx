// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import {
    TableRow,
    TableCell,
    TradeButton,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { GCServerPoolIF, PoolIF, TokenIF } from '../../../ambient-utils/types';

interface propsIF {
    token: dexTokenData;
    tokenMeta: TokenIF;
    samplePool: PoolIF | undefined;
    backupPool: GCServerPoolIF | undefined;
    goToMarket: (tknA: string, tknB: string) => void;
    smallScreen: boolean;
}

export default function TokenRow(props: propsIF) {
    const {
        token,
        tokenMeta,
        samplePool,
        goToMarket,
        smallScreen,
        backupPool,
    } = props;

    const mobileScrenView: boolean = useMediaQuery('(max-width: 640px)');

    return (
        <TableRow
            onClick={() => {
                // due to gatekeeping in parent, at least one of these pools
                // ... will be a defined value passed through props
                if (samplePool) {
                    goToMarket(
                        samplePool.base.address,
                        samplePool.quote.address,
                    );
                } else if (backupPool) {
                    goToMarket(backupPool.base, backupPool.quote);
                }
            }}
        >
            <TableCell>
                <FlexContainer
                    alignItems='center'
                    justifyContent='flex-start'
                    gap={8}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '12px',
                            textTransform: 'none',
                        }}
                    >
                        <TokenIcon
                            token={tokenMeta}
                            src={uriToHttp(tokenMeta.logoURI ?? '')}
                            alt={tokenMeta.symbol ?? ''}
                            size={mobileScrenView ? 's' : '2xl'}
                        />
                        <p>{tokenMeta.symbol}</p>
                    </div>
                </FlexContainer>
            </TableCell>
            {smallScreen || (
                <TableCell left>
                    <p style={{ textTransform: 'none' }}>{tokenMeta.name}</p>
                </TableCell>
            )}
            <TableCell>
                <p>{token.normalized?.dexVolNorm.display}</p>
            </TableCell>
            <TableCell>
                <p style={{ textTransform: 'none' }}>
                    {token.normalized?.dexTvlNorm.display}
                </p>
            </TableCell>
            {smallScreen || (
                <TableCell>
                    <p>{token.normalized?.dexFeesNorm.display}</p>
                </TableCell>
            )}
            <TableCell>
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
