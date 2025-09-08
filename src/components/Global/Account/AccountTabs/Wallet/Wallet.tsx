import { toDisplayQty } from '@crocswap-libs/sdk';
import { useContext, useEffect, useMemo, useState } from 'react';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import {
    ZERO_ADDRESS,
    tokenListURIs,
} from '../../../../../ambient-utils/constants';
import {
    getFormattedNumber,
    isUsdcToken,
} from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import { TokenBalanceContext } from '../../../../../contexts/TokenBalanceContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import Spinner from '../../../Spinner/Spinner';
import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';

interface propsIF {
    chainId: string;
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Wallet(props: propsIF) {
    const { connectedAccountActive, resolvedAddressTokens } = props;

    const { tokens } = useContext(TokenContext);

    const { tokenBalances } = useContext(TokenBalanceContext);

    const tokensToRender = useMemo(
        () => (connectedAccountActive ? tokenBalances : resolvedAddressTokens),
        [connectedAccountActive, tokenBalances, resolvedAddressTokens],
    );

    function sequenceTokens(tkns: TokenIF[]): TokenIF[] {
        const tokensWithOrigins: TokenIF[] = tkns
            // remove `undefined` values from the array
            .filter((tkn: TokenIF) => !!tkn)
            // patch in data showing where the token data originated
            .map((tkn: TokenIF) => {
                return {
                    ...tkn,
                    listedBy: tokens.getTokenByAddress(tkn.address)
                        ?.listedBy ?? ['unknown'],
                };
            });
        const sequencedTokens: TokenIF[] = tokensWithOrigins
            .sort((a: TokenIF, b: TokenIF) => {
                // output value
                let rank: number;
                // decision tree to determine sort order
                // sort ambient-listed token higher if only one is listed by us
                // otherwise sort by number of lists featuring the token overall
                if (isOnAmbientList(a) && isOnAmbientList(b)) {
                    rank = comparePopularity();
                } else if (isOnAmbientList(a)) {
                    rank = -1;
                } else if (isOnAmbientList(b)) {
                    rank = 1;
                } else {
                    rank = comparePopularity();
                }
                // fn to determine if a given token is on the ambient list
                function isOnAmbientList(t: TokenIF): boolean {
                    return !!t.listedBy?.includes(tokenListURIs.ambient);
                }
                // fn to determine which of the two tokens is more popular
                function comparePopularity(): number {
                    const getPopularity = (tkn: TokenIF): number =>
                        tkn.listedBy?.length ?? 1;
                    return getPopularity(b) - getPopularity(a);
                }
                // return the output variable
                return rank;
            })
            // promote privileged tokens to the top of the list
            .sort((a: TokenIF, b: TokenIF) => {
                // fn to numerically prioritize a token (high = important)
                const getPriority = (tkn: TokenIF): number => {
                    if (tkn.address === ZERO_ADDRESS) {
                        return 1000;
                    } else if (isUsdcToken(tkn.address)) {
                        return 900;
                    } else {
                        return 0;
                    }
                };
                // sort tokens by relative priority level
                return getPriority(b) - getPriority(a);
            });
        return sequencedTokens;
    }

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    const [tokenValues, setTokenValues] = useState<
        {
            token: TokenIF;
            balanceValue: number;
            walletBalanceTruncated: string;
        }[]
    >([]);

    useEffect(() => {
        async function fetchTokenValues() {
            if (!tokensToRender || tokensToRender.length === 0) {
                setTokenValues([]);
                return;
            }
            const values = await Promise.all(
                sequenceTokens(tokensToRender as TokenIF[]).map(
                    async (token) => {
                        let price = 0;
                        try {
                            const priceObj = await props.cachedFetchTokenPrice(
                                token.address,
                                props.chainId,
                            );
                            price = priceObj?.usdPrice ?? 0;
                        } catch {}

                        const walletBalanceDisplay = token.walletBalance
                            ? toDisplayQty(token.walletBalance, token.decimals)
                            : undefined;
                        const walletBalanceDisplayNum = walletBalanceDisplay
                            ? parseFloat(walletBalanceDisplay)
                            : 0;
                        const balanceValue = price * walletBalanceDisplayNum;
                        const walletBalanceTruncated = walletBalanceDisplayNum
                            ? getFormattedNumber({
                                  value: walletBalanceDisplayNum,
                              })
                            : '0';
                        return { token, balanceValue, walletBalanceTruncated };
                    },
                ),
            );
            setTokenValues(values);
        }
        fetchTokenValues();
    }, [tokensToRender, props.cachedFetchTokenPrice, props.chainId]);

    return (
        <div className={styles.container}>
            <WalletHeader />
            <div className={`${styles.item_container} custom_scroll_ambient`}>
                {tokenValues.length > 0 ? (
                    tokenValues.map(
                        ({ token, balanceValue, walletBalanceTruncated }) => (
                            <WalletCard
                                key={token.address}
                                token={token}
                                balanceValue={balanceValue}
                                walletBalanceTruncated={walletBalanceTruncated}
                            />
                        ),
                    )
                ) : (
                    <Spinner size={100} bg='var(--dark1)' centered />
                )}
            </div>
        </div>
    );
}
