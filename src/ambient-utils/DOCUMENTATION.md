## Config

Functions used to configure the `@crocswap-libs/ambient-utils` package.

### `initAmbientUtils.ts`

This is where you can add your own INFURA_API_KEY to get access to those functions. Sample usage:
```
import { initAmbientUtils } from '@crocswap-libs/ambient-utils';

... 

initAmbientUtils({INFURA_API_KEY: 'your_infura_api_key});
```

## Types

Various type definitions and interfaces used through the ambient app. 

## Constants

## API

## Data Layer

types/
    token/
        TokenPairIF.ts
        TokenMethodsIF.ts
        TokenListIF.ts
        TokenIF.ts
        index.ts
    transaction/
        index.ts
        TransactionIF.ts
        TransactionServerIF.ts
    TradeTableDataRow.ts
    NetworkIF.ts
    position/
        PositionIF.ts
        PositionServerIF.ts
        index.ts
    GCServerPoolIF.ts
    limitOrder/
        LimitModalAction.ts
        LimitOrderServerIF.ts
        LimitOrderIF.ts
        index.ts
    index.ts
    chainType.ts
    candleData/
        CandleDataServerIF.ts
        CandleDomainIF.ts
        CandlesByPoolAndDurationIF.ts
        CandleScaleIF.ts
        CandleDataIF.ts
        index.ts
    fetchBatch.ts
    pool/
        PoolIF.ts
        RangeModalAction.ts
        PoolStatIF.ts
        index.ts
    liquidityData/
        LiquidityDataIF.ts
        index.ts
        LiquidityRangeIF.ts
constants/
    slippage.ts
    tokenUnicodeCharMap.ts
    defaultTokens.ts
    blacklist.ts
    tokenListURIs.ts
    gasEstimates.ts
    ambient-token-list.json
    tokenListSchema.json
    testnet-token-list.json
    networks/
        scrollSepolia.ts
        ethereumGoerli.ts
        ethereumMainnet.ts
        arbitrumGoerli.ts
        scrollMainnet.ts
        index.ts
        TopPool.ts
        createNetworkSession.ts
    index.ts
    gcgo.ts
PUBLISH.md
tests/
    parallel/
        calculateSecondaryDepositQty.test.ts
        examineUserPositionsSpecific.test.ts
        examineUserPositionsSimple.test.ts
    sequential/
        transactions/
            range.test.ts
            limit.test.ts
            swap.test.ts
    config.ts
README.md
package.json
api/
    fetchPoolRecentChanges.ts
    fetchPoolList.ts
    fetchUserPositions.ts
    fetchBlockNumber.ts
    fetchContractDetails.ts
    fetchDepositBalances.ts
    fetchCandleSeries.ts
    fetchTokenUniverse.ts
    fetchWithFallbacks.ts
    fetchPoolLiquidity.ts
    fetchTokenPrice.ts
    fetchTimeout.ts
    fetchAprEst.ts
    fetchTokenList.ts
    index.ts
    fetchUserRecentChanges.ts
    fetchAddress.ts
    fetchBatch.ts
    fetchTokenBalances.ts
    fetchBlockTime.ts
index.ts
.git
dataLayer/
    transactions/
        limit.ts
        range.ts
        swap.ts
        index.ts
        getTxReceipt.ts
    functions/
        querySpotPrice.ts
        getPrecisionOfInput.ts
        getLimitOrderData.ts
        rangeFunctions.ts
        openInNewTab.ts
        getPositionData.ts
        validateChain.ts
        getLimitPrice.ts
        isJsonString.ts
        getLocalStorageItem.ts
        getTransactionData.ts
        getSymbols.ts
        memoizePromiseFn.ts
        regex/
            exponentialNumRegEx.ts
            chainIdRegEx.ts
            index.ts
            decimalNumRegEx.ts
            contractAddrRegEx.ts
        calculateSecondaryDepositQty.ts
        getTxType.ts
        stablePairs.ts
        trimString.ts
        lookupChainId.ts
        getPoolStats.ts
        getReceiptTxHashes.ts
        uriToHttp.ts
        sortTokens.ts
        chainNumToString.ts
        removeLeadingZeros.ts
        truncateDecimals.ts
        index.ts
        defaultTopPools.ts
        tokenMap.ts
        chains.ts
        getUnicodeCharacter.ts
        validateAddress.ts
        getPriceImpactString.ts
        getElapsedTime.ts
        getFormattedNumber.ts
        removeWrappedNative.ts
        getMoneynessRank.ts
    index.ts
