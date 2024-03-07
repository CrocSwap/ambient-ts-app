// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
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
                        />
                        <p>{token.tokenMeta?.symbol}</p>
                    </div>
                    <p>({token.tokenMeta?.name})</p>
                </FlexContainer>
            </TableCell>
            <TableCell>
                <p style={{ textTransform: 'none' }}>{token.dexTvl}</p>
            </TableCell>
            <TableCell>
                <p>{token.dexFees}</p>
            </TableCell>
            <TableCell>
                <p>{token.dexVolume}</p>
            </TableCell>
        </TableRow>
        // <li className={styles.token_row}>
        //     <TokenIcon token={token.tokenMeta} />
        // </li>
    );
}
