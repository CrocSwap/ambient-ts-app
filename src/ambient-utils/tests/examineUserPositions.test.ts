import { fetchDecoratedUserPositions } from '../api/fetchUserPositions';
import { fetchBlockNumber } from '../api/fetchBlockNumber';
import { ethers } from 'ethers'; // Signer
// import { SpotPriceFn } from '../dataLayer';
// import { TokenPriceFn } from '../api/fetchTokenPrice';
import { FetchContractDetailsFn } from '../api/fetchContractDetails';
import { FetchAddrFn } from '../api/fetchAddress';
import { tokenListURIs } from '../constants/tokenListURIs';
import fetchTokenList from '../api/fetchTokenList';
import { CrocEnv } from '@crocswap-libs/sdk';
import { GCGO_ETHEREUM_URL } from '../constants/gcgo';

// import fetchTokenPrice from '../dataLayer/functions';
// import querySpotPrice from '../dataLayer/functions';
// import fetchContractDetails from '../dataLayer/functions';
// import fetchEnsAddress from '../dataLayer/functions';

import { querySpotPrice } from '../dataLayer';
import { fetchTokenPrice, fetchContractDetails, fetchEnsAddress } from '../api';

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
    // / Dream situation

    const tokenURI = tokenListURIs['ambient'];
    // const tokenUniv1 =  await readFile('./public/'+tokenURI);
    // console.log(tokenUniv1);
    let tokenUniv = await readFile('./public/' + tokenURI)
        .then((fileContents) => JSON.parse(fileContents))
        .then((response) => ({
            ...response,
            uri: './public/' + tokenURI,
            dateRetrieved: new Date().toISOString(),
            isUserImported: false,
        }));
    tokenUniv = tokenUniv.tokens;
    // console.log(tokenURI);
    // const tokenUniv = await fetchTokenList('file://public/'+tokenURI);
    console.log(tokenUniv);
    // / ///// Present
    const infuraUrl =
        'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_KEY;
    console.log(infuraUrl);
    const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
    const userAddress = '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1';
    const chainId = '0x1';
    const urlTarget = 'user_positions';
    const lastBlockNumber = await fetchBlockNumber(infuraUrl);

    const crocEnv = new CrocEnv(
        provider,
        undefined, // signer
    );

    console.log('functions');
    console.log({ fetchTokenPrice });
    console.log({ querySpotPrice });
    console.log({ fetchContractDetails });
    console.log({ fetchEnsAddress });
    try {
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

        console.log('FINISHING ---------------- ' + urlTarget);
        console.log('FINISHING ---------------- ' + urlTarget);
        console.log('FINISHING ---------------- ' + urlTarget);
        console.log('FINISHING ---------------- ' + urlTarget);
        console.log({ updatedLedger });
    } catch (error) {
        console.log('JG. ENCOUNTERED USER POSITION ERR' + urlTarget);
        console.error(error);
    }

    console.debug('fetching user limit orders ' + urlTarget);
};

describe('Test fetchUserPositions', () => {
    describe('practiceTest', () => {
        test('Given \'Hello World!\', return \'Hello World!\'', async () => {
            await fetchData();
            const received = 'Hello World!';
            const expected = 'Hello World!';
            expect(received).toBe(expected);
        });
    });
});
