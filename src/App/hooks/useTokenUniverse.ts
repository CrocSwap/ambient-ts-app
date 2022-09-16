import { useEffect, useState } from 'react';

export const useTokenUniverse = (chain: string) => {
    console.log(`ran useTokenUniverse() hook on chain: ${chain}`);

    const [tokens, setTokens] = useState();

    useEffect(() => console.log(tokens), tokens);
    useEffect(() => setTokens(tokens), []);
}