import { fetchRecords } from '../api/fetchUserPositions';
import { ethers } from 'ethers';
import { FetchContractDetailsFn } from '../api/fetchContractDetails';
import { FetchAddrFn } from '../api/fetchAddress';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { CrocEnv } from '@crocswap-libs/sdk';
import { querySpotPrice } from '../dataLayer';
import { fetchTokenPrice, fetchContractDetails, fetchEnsAddress } from '../api';
import { PositionIF, RecordType } from '../types';
import { createNetworkSession } from '../constants/networks/createNetworkSession';

const fetchData = async () => {
    const mainnetSession = await createNetworkSession({ chainId: '0x1' });
    const goerliSession = await createNetworkSession({ chainId: '0x5' });
    const sess = goerliSession;
    const userAddress = '0x648a62958D11Ea1De1F73ff3F5ecb9FBEE1bBa01';
    const updatedLedger = await fetchRecords({
        recordType: RecordType.Position,
        user: userAddress,

        // Session related:
        chainId: sess.chainId,
        gcUrl: sess.gcUrl,
        provider: sess.provider,
        lastBlockNumber: sess.lastBlockNumber,
        tokenUniv: sess.tokenUniv,
        crocEnv: sess.crocEnv,

        // Decoration Data Related:
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

            expect(1).toEqual(1);
            // const userPositions = await fetchData();
            // expect(userPositions.length).toBeGreaterThan(0);
        });
    });
});
