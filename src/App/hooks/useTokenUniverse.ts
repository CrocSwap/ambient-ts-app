import { useState } from 'react';

export const useTokenUniverse = (chain: string) => {
    console.log(`ran useTokenUniverse() hook on chain: ${chain}`);

    const [tokens, setTokens] = useState();

    false && setTokens(tokens);

    return tokens;
}