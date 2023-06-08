import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import Spinner from '../../../Spinner/Spinner';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';

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
                return connectedUserTokens.map((item, idx) => (
                    <ExchangeCard
                        key={idx}
                        token={item}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                    />
                ));
            }
        }
        if (resolvedAddressTokens && resolvedAddressTokens[0]) {
            return resolvedAddressTokens.map((item, idx) => (
                <ExchangeCard
                    key={idx}
                    token={item}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                />
            ));
        }
        if (resolvedAddressTokens && !resolvedAddressTokens[0]) {
            return;
        }
        return spinnerElement;
    };

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
