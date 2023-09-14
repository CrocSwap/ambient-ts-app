import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import Spinner from '../../../Spinner/Spinner';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { useContext } from 'react';
import { tokenListURIs } from '../../../../../utils/data/tokenListURIs';
import { USDC } from '../../../../../utils/tokens/exports';
import { ZERO_ADDRESS } from '../../../../../constants';

interface propsIF {
    chainId: string;
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Exchange(props: propsIF) {
    const {
        chainId,
        connectedAccountActive,
        resolvedAddressTokens,
        cachedFetchTokenPrice,
    } = props;

    const { tokens } = useContext(TokenContext);

    const { nativeToken, erc20Tokens } = useAppSelector(
        (state) => state.userData.tokens,
    );
    const connectedUserTokens = [nativeToken]
        .concat(erc20Tokens)
        .filter((token) => token);

    const tokensToRender = connectedAccountActive
        ? connectedUserTokens
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
                    // declare an output variable
                    let priority: number;
                    // canonical token addresses to assign probability
                    const addresses = {
                        nativeToken: ZERO_ADDRESS,
                        USDC: USDC[
                            chainId.toLowerCase() as keyof typeof USDC
                        ].toLowerCase(),
                    };
                    // logic router to assign numerical priority to output
                    // unlisted tokens get priority 0
                    switch (tkn.address.toLowerCase()) {
                        // native token
                        case addresses.nativeToken:
                            priority = 1000;
                            break;
                        // USDCoin (uses address for current chain)
                        case addresses.USDC:
                            priority = 900;
                            break;
                        // all non-privileged tokens
                        default:
                            priority = 0;
                    }
                    // return numerical priority of the token
                    return priority;
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
