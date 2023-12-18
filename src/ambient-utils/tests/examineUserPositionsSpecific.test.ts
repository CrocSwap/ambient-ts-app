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

const fetchDataForChain = async (recordType, userAddress, chainId) => {
    const sess = await createNetworkSession({ chainId: chainId });
    const updatedLedger = await fetchRecords({
        recordType: recordType,
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
    jest.setTimeout(30000);
    describe('userPositions', () => {
        test('ensure some positions exist', async () => {
            if (
                !process.env.NETWORK_ACCESS ||
                process.env.NETWORK_ACCESS === 'false'
            ) {
                console.log('Skipping test due to lack of network access');
                return;
            }

            // const userAddress = '0x648a62958D11Ea1De1F73ff3F5ecb9FBEE1bBa01';
            // let chainId = '0x5';
            const userChains = [
                {
                    userAddress: '0x648a62958D11Ea1De1F73ff3F5ecb9FBEE1bBa01',
                    chainId: '0x5',
                },
                {
                    userAddress: '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1',
                    chainId: '0x1',
                },
            ];
            const recordTypes = [RecordType.Position, RecordType.LimitOrder];

            for (const userChain of userChains) {
                for (const recordType of recordTypes) {
                    const userRecords = await fetchRecords({
                        recordType: recordType,
                        user: userChain.userAddress,
                        chainId: userChain.chainId,
                    });
                    expect(userRecords.length).toBeGreaterThan(0);
                    const userPositions = await fetchDataForChain(
                        recordType,
                        userChain.userAddress,
                        userChain.chainId,
                    );
                    expect(userPositions.length).toBeGreaterThan(0);
                }
            }
        });
    });
});
