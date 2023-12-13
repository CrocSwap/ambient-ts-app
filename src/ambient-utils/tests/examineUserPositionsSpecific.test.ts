import { fetchRecords } from '../api/fetchUserPositions';
import { fetchBlockNumber } from '../api/fetchBlockNumber';
import { ethers } from 'ethers';
import { FetchContractDetailsFn } from '../api/fetchContractDetails';
import { FetchAddrFn } from '../api/fetchAddress';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_ETHEREUM_URL, GCGO_TESTNET_URL } from '../constants/gcgo';
import { querySpotPrice } from '../dataLayer';
import { fetchTokenPrice, fetchContractDetails, fetchEnsAddress } from '../api';
import tokenUniverseMainnet from '../testing-only-ambient-token-list.json';
import tokenUniverseTestnet from '../testing-only-testnet-token-list.json';
import { PositionIF } from '../types';

const createSession = async (chainId, gcUrl, tokenUniverse, infuraUrl) => {
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const signer = undefined;
    console.log(infuraUrl);
    return {
        tokenUniv: tokenUniverse.tokens,
        infuraUrl: infuraUrl,
        provider: new ethers.providers.JsonRpcProvider(infuraUrl),
        chainId: chainId,
        lastBlockNumber: await fetchBlockNumber(infuraUrl),
        signer: undefined,
        gcUrl: gcUrl,
        crocEnv: new CrocEnv(provider, signer),
    };
};
const fetchData = async () => {
    const mainnetSession = await createSession(
        '0x1',
        GCGO_ETHEREUM_URL,
        tokenUniverseMainnet,
        'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY,
    );
    const goerliSession = await createSession(
        '0x5',
        GCGO_TESTNET_URL,
        tokenUniverseTestnet,
        'https://goerli.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY,
    );

    const sess = goerliSession;
    const userAddress = '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1';
    const updatedLedger = await fetchRecords({
        recordType: PositionIF,
        user: userAddress,
        chainId: sess.chainId,
        gcUrl: sess.gcUrl,
        provider: sess.provider,
        lastBlockNumber: sess.lastBlockNumber,
        tokenUniv: sess.tokenUniv,
        crocEnv: sess.crocEnv,
        cachedFetchTokenPrice: fetchTokenPrice,
        cachedQuerySpotPrice: querySpotPrice,
        cachedTokenDetails: fetchContractDetails,
        cachedEnsResolve: fetchEnsAddress,
    });
    return updatedLedger;
};

describe('Test fetchUserPositions Specific', () => {
    jest.setTimeout(10000);
    describe('userPositions', () => {
        test('ensure some positions exist', async () => {
            if (
                !process.env.NETWORK_ACCESS ||
                process.env.NETWORK_ACCESS === 'false'
            ) {
                console.log('Skipping test due to lack of network access');
                return;
            }
            const userPositions = await fetchData();
            expect(userPositions.length).toBeGreaterThan(0);
        });
    });
});
