import { useEffect, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    pool: TempPoolIF;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export default function PoolLI(props: propsIF) {
    const { pool, getTokenByAddress } = props;

    const [baseToken, setBaseToken] = useState<TokenIF|null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF|null>();

    useEffect(() => {
        const { ackTokens } = JSON.parse(localStorage.getItem('user') as string);
        const findTokenData = (addr:string, chn:string): TokenIF => {
            const tokenFromMap = getTokenByAddress(addr.toLowerCase(), chn);
            const tokenFromAckList = ackTokens.find(
                (ackToken: TokenIF) => (
                    ackToken.chainId === parseInt(chn) &&
                    ackToken.address.toLowerCase() === addr.toLowerCase()
                )
            );
            const outputToken = tokenFromMap ?? tokenFromAckList;
            return outputToken;
        }
        const baseTokenDataObj = findTokenData(pool.base, pool.chainId);
        const quoteTokenDataObj = findTokenData(pool.quote, pool.chainId);
        baseTokenDataObj && setBaseToken(baseTokenDataObj);
        quoteTokenDataObj && setQuoteToken(quoteTokenDataObj);
    }, []);

    return (
        <div
            // className={styles.card_container}
        >
            <div>{baseToken?.symbol ?? '--'} + {quoteToken?.symbol ?? '--'}</div>
            <div>Price</div>
            <div>Gain</div>
        </div>
    );
}