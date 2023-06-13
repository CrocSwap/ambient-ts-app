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

interface propsIF {
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Wallet(props: propsIF) {
    const {
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

    const userTokens = connectedAccountActive
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
        const sequencedTokens: TokenIF[] = tokensWithOrigins.sort(
            (a: TokenIF, b: TokenIF) => {
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
                    const popularityTokenA: number = getPopularity(a);
                    const popularityTokenB: number = getPopularity(b);
                    return popularityTokenB - popularityTokenA;
                }
                // return the output variable
                return rank;
            },
        );
        return sequencedTokens;
    }

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <WalletHeader />
            <div className={styles.item_container}>
                {userTokens && userTokens.length > 0 ? (
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
