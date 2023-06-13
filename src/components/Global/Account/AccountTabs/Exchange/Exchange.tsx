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

interface propsIF {
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

    const { nativeToken, erc20Tokens } = useAppSelector(
        (state) => state.userData.tokens,
    );
    const connectedUserTokens = [nativeToken]
        .concat(erc20Tokens)
        .filter((token) => token);

    const spinnerElement = <Spinner size={100} bg='var(--dark1)' centered />;

    const ItemContent = () => {
        if (connectedAccountActive) {
            if (connectedUserTokens && connectedUserTokens.length > 0) {
                return sequenceTokens(connectedUserTokens as TokenIF[]).map(
                    (item, idx) => (
                        <ExchangeCard
                            key={idx}
                            token={item}
                            cachedFetchTokenPrice={cachedFetchTokenPrice}
                        />
                    ),
                );
            }
        }
        if (resolvedAddressTokens && resolvedAddressTokens[0]) {
            return sequenceTokens(resolvedAddressTokens as TokenIF[]).map(
                (item, idx) => (
                    <ExchangeCard
                        key={idx}
                        token={item}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ),
            );
        }
        if (resolvedAddressTokens && !resolvedAddressTokens[0]) {
            return;
        }
        return spinnerElement;
    };

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

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent()}</div>
        </div>
    );
}
