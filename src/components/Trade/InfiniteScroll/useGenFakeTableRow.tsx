/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext } from 'react';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../../../ambient-utils/types/limitOrder';
import {
    AppStateContext,
    CachedDataContext,
    ChainDataContext,
    CrocEnvContext,
    TokenContext,
    TradeDataContext,
} from '../../../contexts';
import { fetchPoolLimitOrders } from '../../../ambient-utils/api/fetchPoolLimitOrders';
import { fetchPoolPositions } from '../../../ambient-utils/api/fetchPoolPositions';
import { PositionIF } from '../../../ambient-utils/types/position';
import { TransactionByType } from '../../../contexts/ReceiptContext';
import { getLimitOrderData } from '../../../ambient-utils/dataLayer/functions/getLimitOrderData';
import {
    baseTokenForConcLiq,
    bigIntToFloat,
    quoteTokenForConcLiq,
    tickToPrice,
} from '@crocswap-libs/sdk';
import { RecentlyUpdatedPositionIF } from './InfiniteScroll';
import { getPositionHash } from '../../../ambient-utils/dataLayer/functions/getPositionHash';

const useGenFakeTableRow = () => {
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);

    const {
        activeNetwork: { chainId, poolIndex, GCGO_URL },
    } = useContext(AppStateContext);

    const {
        tokens: { tokenUniv: tokenList },
    } = useContext(TokenContext);

    const genFakeLimitOrder = async (
        pendingTx: TransactionByType,
    ): Promise<RecentlyUpdatedPositionIF> => {
        if (!crocEnv || !pendingTx.txDetails)
            return {} as RecentlyUpdatedPositionIF;

        const pos = crocEnv.positions(
            pendingTx.txDetails.quoteAddress,
            pendingTx.txDetails.baseAddress,
            pendingTx.userAddress,
        );

        const poolPriceNonDisplay = await cachedQuerySpotPrice(
            crocEnv,
            pendingTx.txDetails.baseAddress,
            pendingTx.txDetails.quoteAddress,
            chainId,
            lastBlockNumber,
        );

        const position = await pos.queryKnockoutLivePos(
            pendingTx.txAction === 'Buy',
            pendingTx.txDetails.lowTick || 0,
            pendingTx.txDetails.highTick || 0,
            // lastBlockNumber
        );
        if (!pendingTx.txDetails) {
            return {} as RecentlyUpdatedPositionIF;
        }

        const liqBigInt = position.liq;
        const liqNum = bigIntToFloat(liqBigInt);

        const highTickPrice = tickToPrice(pendingTx.txDetails.highTick || 0);

        const usdValue = pendingTx.txDetails.isBid
            ? (1 / poolPriceNonDisplay) *
              parseFloat(pendingTx.txDetails.initialTokenQty || '1')
            : (1 / highTickPrice) *
              parseFloat(pendingTx.txDetails.initialTokenQty || '1');

        const positionLiqBase = bigIntToFloat(
            baseTokenForConcLiq(
                poolPriceNonDisplay,
                liqBigInt,
                tickToPrice(pendingTx.txDetails.lowTick || 0),
                tickToPrice(pendingTx.txDetails.highTick || 0),
            ),
        );
        const positionLiqQuote = bigIntToFloat(
            quoteTokenForConcLiq(
                poolPriceNonDisplay,
                liqBigInt,
                tickToPrice(pendingTx.txDetails.lowTick || 0),
                tickToPrice(pendingTx.txDetails.highTick || 0),
            ),
        );

        const positionHash = getPositionHash(undefined, {
            isPositionTypeAmbient: false,
            user: pendingTx.userAddress,
            baseAddress: pendingTx.txDetails.baseAddress,
            quoteAddress: pendingTx.txDetails.quoteAddress,
            poolIdx: pendingTx.txDetails.poolIdx,
            bidTick: pendingTx.txDetails.lowTick || 0,
            askTick: pendingTx.txDetails.highTick || 0,
        });

        const mockServerOrder: LimitOrderServerIF = {
            chainId: chainId,
            limitOrderId: positionHash,
            pivotTime: 0,
            askTick: pendingTx.txDetails.highTick || 0,
            bidTick: pendingTx.txDetails.lowTick || 0,
            isBid: pendingTx.txAction === 'Buy',
            poolIdx: poolIndex,
            base: pendingTx.txDetails.baseAddress,
            quote: pendingTx.txDetails.quoteAddress,
            user: pendingTx.userAddress,
            concLiq: liqNum,
            rewardLiq: 0,
            claimableLiq: 0,
            crossTime: 0,
            latestUpdateTime: Math.floor(Date.now() / 1000),
        };

        const limitOrderData = await getLimitOrderData(
            mockServerOrder,
            tokenList,
            crocEnv,
            provider,
            chainId,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            cachedTokenDetails,
            cachedEnsResolve,
        );

        const totalValueUSD = limitOrderData.totalValueUSD;

        const onChainOrder: LimitOrderIF = {
            positionLiq: liqNum,
            positionLiqBase: positionLiqBase,
            positionLiqQuote: positionLiqQuote,
            totalValueUSD:
                usdValue + (totalValueUSD ? totalValueUSD : 0) || totalValueUSD
                    ? totalValueUSD
                    : 0,
            base: pendingTx.txDetails.baseAddress,
            quote: pendingTx.txDetails.quoteAddress,
            baseDecimals: pendingTx.txDetails.baseTokenDecimals || 0,
            quoteDecimals: pendingTx.txDetails.quoteTokenDecimals || 0,
            baseSymbol: pendingTx.txDetails.baseSymbol || '',
            quoteSymbol: pendingTx.txDetails.quoteSymbol || '',
            baseName: limitOrderData.baseName,
            quoteName: limitOrderData.quoteName,
            poolIdx: limitOrderData.poolIdx,
            bidTick: limitOrderData.bidTick,
            user: limitOrderData.user,
            askTick: limitOrderData.askTick,
            isBid: limitOrderData.isBid,
            timeFirstMint: limitOrderData.timeFirstMint,
            latestUpdateTime: limitOrderData.latestUpdateTime,
            concLiq: limitOrderData.concLiq,
            rewardLiq: limitOrderData.rewardLiq,
            id: limitOrderData.id,

            limitOrderId: limitOrderData.limitOrderId,
            positionHash: limitOrderData.positionHash,
            pivotTime: limitOrderData.pivotTime,
            crossTime: limitOrderData.crossTime,
            curentPoolPriceDisplayNum: limitOrderData.curentPoolPriceDisplayNum,
            askTickInvPriceDecimalCorrected:
                limitOrderData.askTickInvPriceDecimalCorrected,
            askTickPriceDecimalCorrected:
                limitOrderData.askTickPriceDecimalCorrected,
            bidTickInvPriceDecimalCorrected:
                limitOrderData.bidTickInvPriceDecimalCorrected,
            bidTickPriceDecimalCorrected:
                limitOrderData.bidTickPriceDecimalCorrected,
            originalPositionLiqBase: limitOrderData.originalPositionLiqBase,
            originalPositionLiqQuote: limitOrderData.originalPositionLiqQuote,
            expectedPositionLiqBase: limitOrderData.expectedPositionLiqBase,
            expectedPositionLiqQuote: limitOrderData.expectedPositionLiqQuote,
            positionLiqBaseDecimalCorrected:
                limitOrderData.positionLiqBaseDecimalCorrected,
            positionLiqQuoteDecimalCorrected:
                limitOrderData.positionLiqQuoteDecimalCorrected,
            originalPositionLiqBaseDecimalCorrected:
                limitOrderData.originalPositionLiqBaseDecimalCorrected,
            originalPositionLiqQuoteDecimalCorrected:
                limitOrderData.originalPositionLiqQuoteDecimalCorrected,
            expectedPositionLiqBaseDecimalCorrected:
                limitOrderData.expectedPositionLiqBaseDecimalCorrected,
            expectedPositionLiqQuoteDecimalCorrected:
                limitOrderData.expectedPositionLiqQuoteDecimalCorrected,
            claimableLiq: limitOrderData.claimableLiq,
            claimableLiqPivotTimes: limitOrderData.claimableLiqPivotTimes,
            claimableLiqBase: limitOrderData.claimableLiqBase,
            claimableLiqQuote: limitOrderData.claimableLiqQuote,
            claimableLiqBaseDecimalCorrected:
                limitOrderData.claimableLiqBaseDecimalCorrected,
            claimableLiqQuoteDecimalCorrected:
                limitOrderData.claimableLiqQuoteDecimalCorrected,
            baseTokenLogoURI: limitOrderData.baseTokenLogoURI,
            quoteTokenLogoURI: limitOrderData.quoteTokenLogoURI,
            limitPrice: limitOrderData.limitPrice,
            invLimitPrice: limitOrderData.invLimitPrice,
            limitPriceDecimalCorrected:
                limitOrderData.limitPriceDecimalCorrected,
            invLimitPriceDecimalCorrected:
                limitOrderData.invLimitPriceDecimalCorrected,
            baseUsdPrice: limitOrderData.baseUsdPrice,
            quoteUsdPrice: limitOrderData.quoteUsdPrice,
            isBaseTokenMoneynessGreaterOrEqual:
                limitOrderData.isBaseTokenMoneynessGreaterOrEqual,
            ensResolution: limitOrderData.ensResolution,
            chainId: limitOrderData.chainId,
        };

        return {
            positionHash: positionHash,
            timestamp: Date.now(),
            position: onChainOrder,
            type: pendingTx.txType,
            action: pendingTx.txAction || '',
        };
    };

    const genFakePosition = async (
        pendingTx: TransactionByType,
    ): Promise<RecentlyUpdatedPositionIF> => {
        return new Promise((resolve) => {
            if (!crocEnv || !provider) resolve({} as RecentlyUpdatedPositionIF);
        });
    };

    return {
        genFakeLimitOrder,
        genFakePosition,
    };
};

export default useGenFakeTableRow;
