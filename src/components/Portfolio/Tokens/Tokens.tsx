import { useEffect, useState } from 'react';
import styles from './Tokens.module.css';
import TokensHeader from './TokensHeader/TokensHeader';
import TokenCard from '../Tokens/TokenCard/TokenCard';
import { TokenIF } from '../../../utils/interfaces/exports';

interface propsIF {
    chainId: string;
}

export default function Tokens(props: propsIF) {
    const { chainId } = props;
    false && chainId;

    const [tokenSource, setTokenSource] = useState('imported');
    false && setTokenSource('');
    const [tokensInDOM, setTokensInDOM] = useState<TokenIF[]>([]);
    useEffect(() => {
        let tokens: TokenIF[];
        switch (tokenSource) {
            case 'imported':
                tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
                break;
            default:
                tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
        }
        console.log(tokens);
        setTokensInDOM(tokens);
    }, [tokenSource]);

    return (
        <div className={styles.container}>
            <div className={styles.listPicker}>
                <select
                    name='lists'
                    onChange={(e) => console.log(e.target.value)}
                >
                    <option value='imported'>My Tokens</option>
                    <option value='ambient'>Ambient</option>
                </select>
            </div>
            <TokensHeader />
            <ol className={styles.item_container}>
            {
                tokensInDOM.map((tkn) =>
                    <TokenCard
                        key={JSON.stringify(tkn)}
                        token={tkn}
                        chainId={chainId}
                    />
                )
            }
            </ol>
        </div>
    );
}