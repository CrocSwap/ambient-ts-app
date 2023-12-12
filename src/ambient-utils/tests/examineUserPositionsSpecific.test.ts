import { fetchDecoratedUserPositions } from '../api/fetchUserPositions';
import { fetchBlockNumber } from '../api/fetchBlockNumber';
import { ethers } from 'ethers';
import { FetchContractDetailsFn } from '../api/fetchContractDetails';
import { FetchAddrFn } from '../api/fetchAddress';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_ETHEREUM_URL } from '../constants/gcgo';
import { querySpotPrice } from '../dataLayer';
import { fetchTokenPrice, fetchContractDetails, fetchEnsAddress } from '../api';
import tokenUniverseData from '../testing-only-ambient-token-list.json';
import { PositionIF } from '../types';

const fetchData = async () => {
    const tokenUniv = tokenUniverseData.tokens;

    const infuraUrl =
        'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY;
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const userAddress = '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1';
    const chainId = '0x1';
    const urlTarget = 'user_positions';
    const lastBlockNumber = await fetchBlockNumber(infuraUrl);
    const signer = undefined;
    const crocEnv = new CrocEnv(provider, signer);
    const updatedLedger = await fetchDecoratedUserPositions<PositionIF>({
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

describe('Test fetchUserPositions Specific', () => {
    jest.setTimeout(10000); // Set timeout to 10000 ms (10 seconds)
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
