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

    const [activeTokens, setActiveTokens] = useState('imported');
    false && setActiveTokens('');
    const [tkns, setTkns] = useState<TokenIF[]>([]);
    useEffect(() => {
        let tokens: TokenIF[];
        switch (activeTokens) {
            case 'imported':
                tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
                break;
            default:
                tokens = JSON.parse(localStorage.getItem('user') as string).tokens;
        }
        console.log(tokens);
        setTkns(tokens);
    }, [activeTokens]);

    return (
        <div className={styles.container}>
            <TokensHeader />
            <ol className={styles.item_container}>
            {
                tkns.map((tkn) =>
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