import { useContext } from 'react';
import { ZERO_ADDRESS } from '../../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts';
import { TokenContext } from '../../../../../contexts/TokenContext';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import TokenIcon from '../../../TokenIcon/TokenIcon';
import styles from './WalletCard.module.css';

interface propsIF {
    token: TokenIF;
    balanceValue: number;
    walletBalanceTruncated: string;
}

export default function WalletCard(props: propsIF) {
    const { token, balanceValue, walletBalanceTruncated } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const isMobile = useMediaQuery('(max-width: 800px)');

    const tokenFromMap = token?.address
        ? getTokenByAddress(token.address)
        : null;

    const iconAndSymbolWithTooltip = (
        <DefaultTooltip
            title={`${tokenFromMap?.symbol}: ${tokenFromMap?.address}`}
            disableHoverListener={tokenFromMap?.address === ZERO_ADDRESS}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.token_icon}>
                <TokenIcon
                    token={token}
                    src={uriToHttp(token.logoURI)}
                    alt={token.symbol ?? '?'}
                    size='2xl'
                />
                <p className={styles.token_key}>{token.symbol ?? '?'}</p>
            </div>
        </DefaultTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info}>
            {iconAndSymbolWithTooltip}
            {!isMobile && (
                <p>
                    {tokenFromMap?.name
                        ? tokenFromMap?.name
                        : token?.name
                          ? token?.name
                          : '???'}
                </p>
            )}
        </div>
    );

    if (
        !token ||
        !tokenFromMap ||
        (token?.address !== ZERO_ADDRESS &&
            (!token.walletBalance || token.walletBalance === '0'))
    )
        return <></>;

    return (
        <div className={styles.wallet_row}>
            {tokenInfo}
            <p className={styles.value}>
                {balanceValue
                    ? getFormattedNumber({
                          value: balanceValue,
                          prefix: '$',
                      })
                    : '...'}
            </p>
            <p className={styles.amount}>{walletBalanceTruncated}</p>
        </div>
    );
}
