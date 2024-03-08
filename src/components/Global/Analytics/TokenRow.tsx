// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { TableRow, TableCell } from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';

interface propsIF {
    token: dexTokenData;
}

export default function TokenRow(props: propsIF) {
    const { token } = props;
    if (!token.tokenMeta) return null;

    const mobileScrenView = useMediaQuery('(max-width: 500px)');

    return (
        <TableRow onClick={() => null}>
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
        </TableRow>
        // <li className={styles.token_row}>
        //     <TokenIcon token={token.tokenMeta} />
        // </li>
    );
}
