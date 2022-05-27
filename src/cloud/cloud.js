// import { logger } from 'ethers';

// import Moralis from 'moralis/types';

/* eslint-disable no-undef */
Moralis.Cloud.define(
    'helloWorld',
    async (request) => {
        const rate = request.params.displayConversionRate;
        const returnVal = (parseFloat(rate) * 0.97).toString();
        return returnVal;
    },
    {
        fields: ['displayConversionRate'],
    },
);

Moralis.Cloud.define(
    'getContractEthDiff',
    async (request) => {
        // get a web3 instance for a specific chain
        const web3 = Moralis.web3ByChain('0x2a'); // kovan
        const BN = web3.utils.BN;
        const txHash = request.params.txHash;

        const logger = Moralis.Cloud.getLogger();

        return await Moralis.Cloud.httpRequest({
            method: 'POST',
            url: 'https://eth-kovan.alchemyapi.io/v2/O4suRhDMBOsT3ZmuvTwisvUpjvszeA6D',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'trace_replayTransaction',
                params: [txHash, ['trace', 'stateDiff']],
                id: '1',
            }),
        }).then(function (httpResponse) {
            // logger.info(httpResponse.text);
            if (httpResponse) {
                const jsonObj = JSON.parse(httpResponse.text);

                if (!jsonObj?.result) {
                    logger.info('result unknown: ' + JSON.stringify(jsonObj));
                    return '-unknown';
                }

                if (
                    jsonObj?.result?.stateDiff['0x5d42d6046927dee12b9b4a235be0cecd55d0e0fb']
                        .balance['*'] === undefined
                ) {
                    return 0;
                }

                const oldHexValue =
                    jsonObj?.result?.stateDiff['0x5d42d6046927dee12b9b4a235be0cecd55d0e0fb']
                        .balance['*']['from'];

                const newHexValue =
                    jsonObj?.result?.stateDiff['0x5d42d6046927dee12b9b4a235be0cecd55d0e0fb']
                        .balance['*']['to'];

                const oldValueDisplayString = Moralis.Cloud.units({
                    method: 'fromWei',
                    value: oldHexValue,
                });
                const newValueDisplayString = Moralis.Cloud.units({
                    method: 'fromWei',
                    value: newHexValue,
                });

                const diffInWei = new BN(newValueDisplayString)
                    .sub(new BN(oldValueDisplayString))
                    .toString();
                // const newValueBigNum = new BN(newHexValue);

                const diffDisplay = Moralis.Cloud.units({
                    method: 'fromWei',
                    value: diffInWei,
                });

                return diffDisplay;
            }
        });
    },
    {
        fields: ['txHash'],
    },
);

Moralis.Cloud.afterSave('EthTransactions', (request) => {
    const query = new Moralis.Query('UserPosition');
    // const logger = Moralis.Cloud.getLogger();

    query
        .equalTo('txHash', request.object.get('hash'))
        .first()
        .then(function (userPosition) {
            // logger.info('request: ' + JSON.stringify(request));
            // logger.info('userPosition: ' + JSON.stringify(userPosition));
            if (userPosition?.get('burnPending') === true) {
                userPosition?.set('burnPending', false);
                userPosition?.save();
            }
            return;
        })
        .catch(function (error) {
            console.error('Got an error ' + error.code + ' : ' + error.message);
        });
});

Moralis.Cloud.job('log current kovan block number', () => {
    const web3 = Moralis.ethersByChain('0x2a');
    var url = 'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/kovan';
    var customHttpProvider = new web3.ethers.providers.JsonRpcProvider(url);
    customHttpProvider.getBlockNumber().then((result) => {
        logger.info('Current block number on kovan: ' + result);
    });
});

//  Moralis.Cloud.afterSave('EthTransactions', async (request) => {
//    const confirmed = request.object.get('confirmed');
//    if (confirmed) {
//      // do something
//    } else {
//      // handle unconfirmed case
//    }
//  });

// Moralis.Cloud.job('resetBurnPending', (request) => {
//   // params: passed in the job call
//   // headers: from the request that triggered the job
//   // log: the Moralis Server logger passed in the request
//   // message: a function to update the status message of the job object
//   const { params, headers, log, message } = request;
//   message('I just started');
//   return doSomethingVeryLong(request);
// });
