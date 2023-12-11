import { ethers } from 'ethers';
import { tokenListURIs } from '../../constants/tokenListURIs';
import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_ETHEREUM_URL } from '../../constants/gcgo';
import { querySpotPrice } from '../../dataLayer';
import {
    fetchTokenPrice,
    fetchContractDetails,
    fetchEnsAddress,
    fetchBlockNumber,
    fetchDecoratedUserPositions,
} from '../../api';

const readFile = async (filePath: string): Promise<string> => {
    if (
        typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node
    ) {
        const fs = await import('fs/promises');
        return fs.readFile(filePath, 'utf8');
    }
    throw new Error('Local file access is not supported in this environment');
};

const fetchData = async () => {
    const tokenURI = tokenListURIs['ambient'];
    let tokenUniv = await readFile('./public/' + tokenURI)
        .then((fileContents) => JSON.parse(fileContents))
        .then((response) => ({
            ...response,
            uri: './public/' + tokenURI,
            dateRetrieved: new Date().toISOString(),
            isUserImported: false,
        }));
    tokenUniv = tokenUniv.tokens;
    const infuraUrl =
        'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY;
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const userAddress = '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1';
    const chainId = '0x1';
    const urlTarget = 'user_positions';
    const lastBlockNumber = await fetchBlockNumber(infuraUrl);
    const signer = undefined;
    const crocEnv = new CrocEnv(provider, signer);
    const updatedLedger = await fetchDecoratedUserPositions({
        urlTarget: urlTarget,
        user: userAddress,
        chainId: chainId,
        gcUrl: GCGO_ETHEREUM_URL,
        provider,
        lastBlockNumber,
        tokenUniv: tokenUniv,
        crocEnv,
        cachedFetchTokenPrice: fetchTokenPrice,
        cachedQuerySpotPrice: querySpotPrice,
        cachedTokenDetails: fetchContractDetails,
        cachedEnsResolve: fetchEnsAddress,
    });
    return updatedLedger;
};

describe('Test fetchUserPositions', () => {
    describe('userPositions', () => {
        test('ensure some positions exist', async () => {
            const userPositions = await fetchData();
            expect(userPositions.length).toBeGreaterThan(0);
        });
    });
});
