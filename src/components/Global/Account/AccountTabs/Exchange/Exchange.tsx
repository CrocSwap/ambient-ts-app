import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import Spinner from '../../../Spinner/Spinner';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { useContext } from 'react';
import { tokenListURIs } from '../../../../../utils/data/tokenListURIs';
import { ZERO_ADDRESS } from '../../../../../constants';
import { TokenBalanceContext } from '../../../../../contexts/TokenBalanceContext';
import { isUsdcToken } from '../../../../../utils/data/stablePairs';

interface propsIF {
    chainId: string;
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Exchange(props: propsIF) {
    const {
        connectedAccountActive,
        resolvedAddressTokens,
        cachedFetchTokenPrice,
    } = props;

    const { tokens } = useContext(TokenContext);
    const { tokenBalances } = useContext(TokenBalanceContext);

    const tokensToRender = connectedAccountActive
        ? tokenBalances
        : resolvedAddressTokens;

    function sequenceTokens(tkns: TokenIF[]) {
        const tokensWithOrigins: TokenIF[] = tkns.map((tkn: TokenIF) => {
            return {
                ...tkn,
                listedBy: tokens.getTokenByAddress(tkn.address)?.listedBy ?? [
                    'unknown',
                ],
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

    return (
        <div className={styles.container}>
            <ExchangeHeader />
            <div className={styles.item_container}>
                {tokensToRender &&
                tokensToRender.length > 0 &&
                tokensToRender[0] !== undefined ? (
                    // values can be `undefined` but this fn will filter them out
                    sequenceTokens(tokensToRender as TokenIF[]).map((token) => (
                        <ExchangeCard
                            key={JSON.stringify(token)}
                            token={token}
                            cachedFetchTokenPrice={cachedFetchTokenPrice}
                        />
                    ))
                ) : (
                    <Spinner size={100} bg='var(--dark1)' centered />
                )}
            </div>
        </div>
    );
}
