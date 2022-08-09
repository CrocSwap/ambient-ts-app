import { Dispatch, SetStateAction } from 'react';
import { PoolIF, TokenIF } from '../../../utils/interfaces/exports';

export default function clickStar(
    token: TokenIF,
    chain: string,
    poolId: number,
    setFavePools: Dispatch<SetStateAction<PoolIF[]>>,
) {
    // native token address is always 0x0[...] on every chain
    const nativeTokenAddress = '0x0000000000000000000000000000000000000000';
    // goerli address for USDC
    const usdcAddress = '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C';
    // get the user object from local storage
    const user = JSON.parse(localStorage.getItem('user') as string);

    // if user clicked the native token, the other token is USDC
    // if user clicked any other token, the other is the native
    const otherAddress = token.address === nativeTokenAddress ? usdcAddress : nativeTokenAddress;

    // bool determining if relevant pool is already in the favorites list
    const isPoolInFavorites = user.favePools.some(
        (pool: PoolIF) =>
            pool.tokens.includes(token.address) &&
            pool.tokens.includes(otherAddress) &&
            pool.chainId === chain,
    );

    // function to add relevant pool to the favorites list
    const addPoolToFavorites = () => {
        const pool: PoolIF = {
            tokens: [],
            poolId: poolId,
            chainId: chain,
        };
        switch (token.address) {
            case nativeTokenAddress:
            case usdcAddress:
                pool.tokens.push(nativeTokenAddress);
                pool.tokens.push(usdcAddress);
                break;
            default:
                pool.tokens.push(nativeTokenAddress);
                pool.tokens.push(token.address);
        }
        user.favePools.push(pool);
    };

    // function to remove relevant pool from the favorites list
    const removePoolFromFavorites = () => {
        const newFavePools = user.favePools.filter(
            (pool: PoolIF) =>
                !pool.tokens.includes(token.address) ||
                !pool.tokens.includes(otherAddress) ||
                pool.chainId !== chain ||
                pool.poolId !== poolId,
        );
        user.favePools = newFavePools;
    };

    // add or remove the relevant pool from the favorites array depending on
    // ... whether or not it is already there
    isPoolInFavorites ? removePoolFromFavorites() : addPoolToFavorites();

    setFavePools(user.favePools);

    // send updated user object to local storage
    localStorage.setItem('user', JSON.stringify(user));
}
