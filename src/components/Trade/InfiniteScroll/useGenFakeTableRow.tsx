/* eslint-disable no-irregular-whitespace */

import {
    baseTokenForConcLiq,
    bigIntToFloat,
    priceToTick,
    quoteTokenForConcLiq,
    tickToPrice,
} from '@crocswap-libs/sdk';
import { useContext } from 'react';
import { getLimitOrderData } from '../../../ambient-utils/dataLayer/functions/getLimitOrderData';
import {
    LimitOrderIF,
    LimitOrderServerIF,
} from '../../../ambient-utils/types/limitOrder';
import {
    PositionIF,
    PositionServerIF,
} from '../../../ambient-utils/types/position';
import {
    AppStateContext,
    CachedDataContext,
    ChainDataContext,
    CrocEnvContext,
    TokenContext,
} from '../../../contexts';
import { TransactionByType } from '../../../contexts/ReceiptContext';

import { getPositionData } from '../../../ambient-utils/dataLayer/functions/getPositionData';
import { getPositionHash } from '../../../ambient-utils/dataLayer/functions/getPositionHash';
import { RecentlyUpdatedPositionIF } from '../../../contexts/GraphDataContext';

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
        activeNetwork: { chainId, poolIndex },
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

        // console.log('??? pos', pos)

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
        );
        if (!pendingTx.txDetails) {
            return {} as RecentlyUpdatedPositionIF;
        }

        const liqBigInt = position.liq;
        const liqNum = bigIntToFloat(liqBigInt);

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

        const basePrice = limitOrderData.baseUsdPrice || 0;
        const quotePrice = limitOrderData.quoteUsdPrice || 0;

        const backupUsdValue = pendingTx.txDetails.isBid
            ? parseFloat(pendingTx.txDetails.initialTokenQty || '0') * basePrice
            : parseFloat(pendingTx.txDetails.secondaryTokenQty || '0') *
              quotePrice;

        let totalValueUSD: number = backupUsdValue;
        if (limitOrderData.totalValueUSD) {
            totalValueUSD = limitOrderData.totalValueUSD as number;
        }

        const onChainOrder: LimitOrderIF = {
            positionLiq: liqNum,
            positionLiqBase: positionLiqBase,
            positionLiqQuote: positionLiqQuote,
            totalValueUSD: totalValueUSD,
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
            pair: pendingTx.txDetails.baseAddress.concat(
                '-',
                pendingTx.txDetails.quoteAddress,
            ),
        };
    };

    const genFakePosition = async (
        pendingTx: TransactionByType,
    ): Promise<RecentlyUpdatedPositionIF> => {
        if (!crocEnv || !pendingTx.txDetails)
            return {} as RecentlyUpdatedPositionIF;

        const pos = crocEnv.positions(
            pendingTx.txDetails.baseAddress,
            pendingTx.txDetails.quoteAddress,
            pendingTx.userAddress,
        );

        const poolPriceNonDisplay = await cachedQuerySpotPrice(
            crocEnv,
            pendingTx.txDetails.baseAddress,
            pendingTx.txDetails.quoteAddress,
            chainId,
            lastBlockNumber,
        );

        const position = pendingTx.txDetails.isAmbient
            ? await pos.queryAmbientPos()
            : await pos.queryRangePos(
                  pendingTx.txDetails.lowTick || 0,
                  pendingTx.txDetails.highTick || 0,
              );

        console.log('??? pendingTx', pendingTx);

        const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

        let positionLiqBase, positionLiqQuote;

        const liqBigInt = position.liq;
        const liqNum = bigIntToFloat(liqBigInt);
        if (pendingTx.txDetails.isAmbient) {
            positionLiqBase = liqNum * Math.sqrt(poolPriceNonDisplay);
            positionLiqQuote = liqNum / Math.sqrt(poolPriceNonDisplay);
        } else {
            positionLiqBase = bigIntToFloat(
                baseTokenForConcLiq(
                    poolPriceNonDisplay,
                    liqBigInt,
                    tickToPrice(pendingTx.txDetails.lowTick || 0),
                    tickToPrice(pendingTx.txDetails.highTick || 0),
                ),
            );
            positionLiqQuote = bigIntToFloat(
                quoteTokenForConcLiq(
                    poolPriceNonDisplay,
                    liqBigInt,
                    tickToPrice(pendingTx.txDetails.lowTick || 0),
                    tickToPrice(pendingTx.txDetails.highTick || 0),
                ),
            );
        }

        const posHash = getPositionHash(undefined, {
            isPositionTypeAmbient: pendingTx.txDetails.isAmbient || false,
            user: pendingTx.userAddress,
            baseAddress: pendingTx.txDetails.baseAddress,
            quoteAddress: pendingTx.txDetails.quoteAddress,
            poolIdx: pendingTx.txDetails.poolIdx,
            bidTick: pendingTx.txDetails.lowTick || 0,
            askTick: pendingTx.txDetails.highTick || 0,
        });

        const mockServerPosition: PositionServerIF = {
            positionId: posHash,
            chainId: chainId,
            askTick: pendingTx.txDetails.highTick || 0,
            bidTick: pendingTx.txDetails.lowTick || 0,
            poolIdx: pendingTx.txDetails.poolIdx,
            base: pendingTx.txDetails.baseAddress,
            quote: pendingTx.txDetails.quoteAddress,
            user: pendingTx.userAddress,
            ambientLiq: pendingTx.txDetails.isAmbient ? liqNum : 0,
            concLiq: !pendingTx.txDetails.isAmbient ? liqNum : 0,
            rewardLiq: 0, // unknown
            positionType: pendingTx.txDetails.isAmbient
                ? 'ambient'
                : 'concentrated',
            timeFirstMint: 0, // unknown
            lastMintTx: '', // unknown
            firstMintTx: '', // unknown
            aprEst: 0, // unknown
        };
        const skipENSFetch = true;

        const positionData = await getPositionData(
            mockServerPosition,
            tokenList,
            crocEnv,
            provider,
            chainId,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            cachedTokenDetails,
            cachedEnsResolve,
            skipENSFetch,
        );

        let backupUsdValue = 0;

        if (
            pendingTx.txDetails.initialTokenQty &&
            pendingTx.txDetails.secondaryTokenQty &&
            positionData.baseUsdPrice &&
            positionData.quoteUsdPrice
        ) {
            backupUsdValue =
                parseFloat(pendingTx.txDetails.initialTokenQty) *
                    positionData.baseUsdPrice +
                parseFloat(pendingTx.txDetails.secondaryTokenQty) *
                    positionData.quoteUsdPrice;
        }

        if (positionData.totalValueUSD > 0) {
            console.log(
                '??? positionData.totalValueUSD',
                positionData.totalValueUSD,
            );
        } else {
            console.log('??? GONNA USE BACKUP USD VALUE', backupUsdValue);
        }

        console.log('??? positionData', positionData);

        const onChainPosition: PositionIF = {
            chainId: chainId,
            base: pendingTx.txDetails.baseAddress,
            quote: pendingTx.txDetails.quoteAddress,
            poolIdx: pendingTx.txDetails.poolIdx,
            bidTick: pendingTx.txDetails.lowTick,
            askTick: pendingTx.txDetails.highTick,
            isBid: pendingTx.txDetails.isBid,
            user: pendingTx.userAddress,
            timeFirstMint: 0, // unknown
            latestUpdateTime: Math.floor(Date.now() / 1000),
            lastMintTx: '', // unknown
            firstMintTx: '', // unknown
            positionType: pendingTx.txDetails.isAmbient
                ? 'ambient'
                : 'concentrated',
            ambientLiq: pendingTx.txDetails.isAmbient ? liqNum : 0,
            concLiq: !pendingTx.txDetails.isAmbient ? liqNum : 0,
            rewardLiq: 0, // unknown
            liqRefreshTime: 0,
            aprDuration: 0, // unknown
            aprPostLiq: 0,
            aprContributedLiq: 0,
            // aprEst: 0,
            poolPriceInTicks: poolPriceInTicks,
            isPositionInRange: true, // unknown
            baseDecimals: pendingTx.txDetails.baseTokenDecimals,
            quoteDecimals: pendingTx.txDetails.quoteTokenDecimals,
            baseSymbol: pendingTx.txDetails.baseSymbol,
            quoteSymbol: pendingTx.txDetails.quoteSymbol,
            baseName: '',
            quoteName: '',
            lowRangeDisplayInBase: positionData.lowRangeDisplayInBase,
            highRangeDisplayInBase: positionData.highRangeDisplayInBase,
            lowRangeDisplayInQuote: positionData.lowRangeDisplayInQuote,
            highRangeDisplayInQuote: positionData.highRangeDisplayInQuote,
            lowRangeShortDisplayInBase: positionData.lowRangeShortDisplayInBase,
            lowRangeShortDisplayInQuote:
                positionData.lowRangeShortDisplayInQuote,
            highRangeShortDisplayInBase:
                positionData.highRangeShortDisplayInBase,
            highRangeShortDisplayInQuote:
                positionData.highRangeShortDisplayInQuote,
            bidTickPriceDecimalCorrected:
                positionData.bidTickPriceDecimalCorrected,
            bidTickInvPriceDecimalCorrected:
                positionData.bidTickInvPriceDecimalCorrected,
            askTickPriceDecimalCorrected:
                positionData.askTickPriceDecimalCorrected,
            askTickInvPriceDecimalCorrected:
                positionData.askTickInvPriceDecimalCorrected,
            positionLiq: liqNum,
            positionLiqBase: positionLiqBase,
            positionLiqQuote: positionLiqQuote,
            feesLiqBase: positionData.feesLiqBase,
            feesLiqQuote: positionData.feesLiqQuote,
            feesLiqBaseDecimalCorrected:
                positionData.feesLiqBaseDecimalCorrected,
            feesLiqQuoteDecimalCorrected:
                positionData.feesLiqQuoteDecimalCorrected,
            positionLiqBaseDecimalCorrected:
                positionData.positionLiqBaseDecimalCorrected,
            positionLiqQuoteDecimalCorrected:
                positionData.positionLiqQuoteDecimalCorrected,
            positionLiqBaseTruncated: positionData.positionLiqBaseTruncated,
            positionLiqQuoteTruncated: positionData.positionLiqQuoteTruncated,
            totalValueUSD: positionData.totalValueUSD
                ? positionData.totalValueUSD
                : backupUsdValue,
            apy: positionData.apy,
            positionId: positionData.positionId,
            onChainConstructedPosition: true,
        } as PositionIF;

        return {
            positionHash: posHash,
            timestamp: Date.now(),
            position: onChainPosition,
            type: pendingTx.txType,
            action: pendingTx.txAction || '',
            pair: pendingTx.txDetails.baseAddress.concat(
                '-',
                pendingTx.txDetails.quoteAddress,
            ),
        };
    };

    return {
        genFakeLimitOrder,
        genFakePosition,
    };
};

export default useGenFakeTableRow;
