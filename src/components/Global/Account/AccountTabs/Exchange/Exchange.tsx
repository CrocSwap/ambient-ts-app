import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { tokenMethodsIF } from '../../../../../App/hooks/useTokens';
import Spinner from '../../../Spinner/Spinner';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';

interface propsIF {
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    tokens: tokenMethodsIF;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function Exchange(props: propsIF) {
    const {
        connectedAccountActive,
        resolvedAddressTokens,
        tokens,
        cachedFetchTokenPrice,
    } = props;

    const { nativeToken, erc20Tokens } = useAppSelector(
        (state) => state.userData.tokens,
    );
    const connectedUserTokens = [nativeToken]
        .concat(erc20Tokens)
        .filter((token) => token);

    const ItemContent = connectedAccountActive ? (
        connectedUserTokens && connectedUserTokens.length > 0 ? (
            connectedUserTokens.map((item, idx) => (
                <ExchangeCard
                    key={idx}
                    token={item}
                    tokens={tokens}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                />
            ))
        ) : (
            <Spinner size={100} bg='var(--dark1)' centered />
        )
    ) : resolvedAddressTokens && resolvedAddressTokens[0] ? (
        resolvedAddressTokens.map((item, idx) => (
            <ExchangeCard
                key={idx}
                token={item}
                tokens={tokens}
                cachedFetchTokenPrice={cachedFetchTokenPrice}
            />
        ))
    ) : (
        <Spinner size={100} bg='var(--dark1)' centered />
    );

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
