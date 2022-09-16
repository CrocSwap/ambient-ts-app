import { useState } from 'react';

export const useTokenUniverse = (chain: string) => {
    const [tokens, setTokens] = useState();

    chain && false && setTokens(tokens);

    return tokens;
};
