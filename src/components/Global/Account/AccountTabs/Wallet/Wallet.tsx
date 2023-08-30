import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import Spinner from '../../../Spinner/Spinner';
import { useContext } from 'react';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { tokenListURIs } from '../../../../../utils/data/tokenListURIs';
import { ZERO_ADDRESS } from '../../../../../constants';
import { USDC } from '../../../../../utils/tokens/exports';

interface propsIF {
    chainId: string;
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Wallet(props: propsIF) {
    const {
        chainId,
        connectedAccountActive,
        resolvedAddressTokens,
        cachedFetchTokenPrice,
    } = props;

    const { tokens } = useContext(TokenContext);

    const { erc20Tokens } = useAppSelector((state) => state.userData.tokens);
    const connectedUserTokens: Array<TokenIF | undefined> = (
        erc20Tokens ?? []
    ).filter((token) => token);

    const userTokens: Array<TokenIF | undefined> = connectedAccountActive
        ? connectedUserTokens
        : resolvedAddressTokens;

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

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div className={styles.container}>
            <WalletHeader />
            <div className={styles.item_container}>
                {userTokens && userTokens.length > 0 ? (
                    // values can be `undefined` but this fn will filter them out
                    sequenceTokens(userTokens as TokenIF[]).map((token) => (
                        <WalletCard
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
