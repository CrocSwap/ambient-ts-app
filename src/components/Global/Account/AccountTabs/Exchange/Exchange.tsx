import { toDisplayQty } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import { UserDataContext } from '../../../../../contexts';
import { TokenBalanceContext } from '../../../../../contexts/TokenBalanceContext';
import Spinner from '../../../Spinner/Spinner';
import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';

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

    const { setTotalExchangeBalanceValue } = useContext(UserDataContext);
    const { tokenBalances } = useContext(TokenBalanceContext);

    const tokensToRender = connectedAccountActive
        ? tokenBalances
        : resolvedAddressTokens;

    const [tokenValues, setTokenValues] = useState<
        { token: TokenIF; balanceValue: number; dexBalanceTruncated: string }[]
    >([]);

    useEffect(() => {
        async function fetchTokenValues() {
            if (!tokensToRender || tokensToRender.length === 0) {
                setTokenValues([]);
                return;
            }
            const values = await Promise.all(
                (tokensToRender as TokenIF[]).map(async (token) => {
                    // Fetch price
                    let price = 0;
                    try {
                        const priceObj = await cachedFetchTokenPrice(
                            token.address,
                            props.chainId,
                        );
                        price = priceObj?.usdPrice ?? 0;
                    } catch {}
                    // Calculate display balance
                    const dexBalanceDisplay = token.dexBalance
                        ? toDisplayQty(token.dexBalance, token.decimals)
                        : undefined;
                    const dexBalanceDisplayNum = dexBalanceDisplay
                        ? parseFloat(dexBalanceDisplay)
                        : 0;
                    const balanceValue = price * dexBalanceDisplayNum;
                    const dexBalanceTruncated = dexBalanceDisplayNum
                        ? getFormattedNumber({ value: dexBalanceDisplayNum })
                        : '0';
                    return { token, balanceValue, dexBalanceTruncated };
                }),
            );
            setTokenValues(values);
        }
        fetchTokenValues();
    }, [JSON.stringify(tokensToRender)]);

    return (
        <div className={styles.container}>
            <ExchangeHeader />
            <div className={styles.item_container}>
                {tokenValues.length > 0 ? (
                    tokenValues.map(
                        ({ token, balanceValue, dexBalanceTruncated }) => (
                            <ExchangeCard
                                key={token.address}
                                token={token}
                                balanceValue={balanceValue}
                                dexBalanceTruncated={dexBalanceTruncated}
                                cachedFetchTokenPrice={cachedFetchTokenPrice}
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
