import { useEffect, useState } from 'react';
import styles from './Tokens.module.css';
import TokensHeader from './TokensHeader/TokensHeader';
import TokenCard from '../Tokens/TokenCard/TokenCard';
import { TokenIF, TokenListIF } from '../../../utils/interfaces/exports';

interface propsIF {
    chainId: string;
}

export default function Tokens(props: propsIF) {
    const { chainId } = props;

    const [tokenLists, setTokenLists] = useState<TokenListIF[]>();
    const [importedTokens, setImportedTokens] = useState<TokenIF[]|null>(null);
    importedTokens ?? setImportedTokens(
        JSON.parse(localStorage.getItem('user') as string).tokens
    );

    const [tokenSource, setTokenSource] = useState('imported');
    const [tokensInDOM, setTokensInDOM] = useState<TokenIF[]>([]);

    useEffect(() => {
        if (tokenSource === 'imported') {
            const tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
            setTokensInDOM(tokens);
        } else {
            setTokensInDOM(
                tokenLists?.find((list) => list.name === tokenSource)?.tokens as TokenIF[]
            );
        }
    }, [tokenSource]);

    useEffect(() => {
        setTokenLists(JSON.parse(localStorage.getItem('allTokenLists') as string));
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.listPicker}>
                <select
                    name='lists'
                    onChange={(e) => setTokenSource(e.target.value)}
                >
                    <option value='imported'>My Tokens</option>
                    {
                        tokenLists?.map((list) => (
                            <option
                                key={JSON.stringify(list)}
                                value={list.name}
                            >
                                {list.name}
                            </option>
                        ))
                    }
                </select>
            </div>
            <TokensHeader />
            <ol className={styles.item_container}>
            {
                tokensInDOM.map((tkn, idx) =>
                    <TokenCard
                        key={JSON.stringify(tkn) + idx}
                        token={tkn}
                        chainId={chainId}
                    />
                )
            }
            </ol>
        </div>
    );
}