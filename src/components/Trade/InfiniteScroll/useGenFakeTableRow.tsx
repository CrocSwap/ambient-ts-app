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

import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { getPositionData } from '../../../ambient-utils/dataLayer/functions/getPositionData';
import { getPositionHash } from '../../../ambient-utils/dataLayer/functions/getPositionHash';
import { RecentlyUpdatedPositionIF } from '../../../contexts/GraphDataContext';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const useGenFakeTableRow = () => {
    const { crocEnv, provider } = useContext(CrocEnvContext);
    const { lastBlockNumber, analyticsPoolList } = useContext(ChainDataContext);

    const { cachedQuerySpotPrice, cachedFetchTokenPrice, cachedTokenDetails } =
        useContext(CachedDataContext);

    const {
        activeNetwork: { chainId, poolIndex, indexerTimeout },
    } = useContext(AppStateContext);

    const getDelayTime = () => {
        // can be used to test if indexed data overrides pendings correctly
        const factor = 1;

        if (indexerTimeout) {
            return indexerTimeout * factor;
        }

        switch (chainId) {
            case '0x1': // eth-mainnet
            case '0xaa36a7': // eth-sepolia
                return 5000 * factor;
            case '0x18231': // plume-mainnet
                return 1000 * factor;
            default:
                return 2000 * factor;
        }
    };

    const getExtendedDelayTime = () => {
        return getDelayTime() * 2;
    };

    const {
        tokens: { tokenUniv: tokenList },
    } = useContext(TokenContext);

    const genFakeLimitOrder = async (
        pendingTx: TransactionByType,
    ): Promise<RecentlyUpdatedPositionIF> => {
        if (!crocEnv || !pendingTx.txDetails)
            return {} as RecentlyUpdatedPositionIF;

        await wait(getDelayTime());

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

        if (!pendingTx.txDetails) {
            return {} as RecentlyUpdatedPositionIF;
        }

        let position, liqBigInt, liqNum;

        position = await pos.queryKnockoutLivePos(
            pendingTx.txAction === 'Buy',
            pendingTx.txDetails.lowTick || 0,
            pendingTx.txDetails.highTick || 0,
        );

        liqBigInt = position.liq;
        liqNum = bigIntToFloat(liqBigInt);

        for (
            let attempt = 1;
            attempt < 6 &&
            liqBigInt === pendingTx.txDetails.currentLiquidity &&
            pendingTx.txAction !== 'Claim';
            attempt++
        ) {
            await wait(getDelayTime());
            position = await pos.queryKnockoutLivePos(
                pendingTx.txAction === 'Buy',
                pendingTx.txDetails.lowTick || 0,
                pendingTx.txDetails.highTick || 0,
            );
            liqBigInt = position.liq;
            liqNum = bigIntToFloat(liqBigInt);
        }

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
            user: pendingTx.userAddress.toLowerCase(),
            baseAddress: pendingTx.txDetails.baseAddress.toLowerCase(),
            quoteAddress: pendingTx.txDetails.quoteAddress.toLowerCase(),
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
            analyticsPoolList,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            cachedTokenDetails,
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

        let isSuccess = false;

        if (liqBigInt != pendingTx.txDetails.currentLiquidity) {
            isSuccess = true;
        } else if (pendingTx.txAction === 'Claim' && liqBigInt === 0n) {
            isSuccess = true;
        }

        return {
            positionHash: positionHash,
            timestamp: Date.now(),
            position: onChainOrder,
            type: pendingTx.txType,
            action: pendingTx.txAction || '',
            status: 'onchain',
            isSuccess: isSuccess,
        };
    };

    const genFakePosition = async (
        pendingTx: TransactionByType,
    ): Promise<RecentlyUpdatedPositionIF> => {
        if (!crocEnv || !pendingTx.txDetails)
            return {} as RecentlyUpdatedPositionIF;

        if (pendingTx.txAction === 'Add') {
            await wait(getExtendedDelayTime());
        } else {
            await wait(getDelayTime());
        }

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

        const poolPriceInTicks = priceToTick(poolPriceNonDisplay);

        let position,
            positionLiqBase,
            positionLiqQuote,
            liqBigInt,
            liqNum,
            positionLiqBaseDecimalCorrected,
            positionLiqQuoteDecimalCorrected,
            positionLiqBaseTruncated,
            positionLiqQuoteTruncated;

        position = pendingTx.txDetails.isAmbient
            ? await pos.queryAmbientPos()
            : await pos.queryRangePos(
                  pendingTx.txDetails.lowTick || 0,
                  pendingTx.txDetails.highTick || 0,
              );

        liqBigInt = position.liq;
        liqNum = bigIntToFloat(liqBigInt);

        for (
            let attempt = 1;
            attempt < 6 &&
            ((pendingTx.txDetails.initialTokenQty && liqNum === 0) ||
                (pendingTx.txDetails.currentLiquidity &&
                    liqBigInt === pendingTx.txDetails.currentLiquidity));
            attempt++
        ) {
            await wait(getDelayTime());
            position = pendingTx.txDetails.isAmbient
                ? await pos.queryAmbientPos()
                : await pos.queryRangePos(
                      pendingTx.txDetails.lowTick || 0,
                      pendingTx.txDetails.highTick || 0,
                  );
            liqBigInt = position.liq;
            liqNum = bigIntToFloat(liqBigInt);
        }

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

        if (positionLiqBase && pendingTx.txDetails.baseTokenDecimals) {
            positionLiqBaseDecimalCorrected =
                positionLiqBase /
                Math.pow(10, pendingTx.txDetails.baseTokenDecimals);
            positionLiqBaseTruncated = getFormattedNumber({
                value: positionLiqBaseDecimalCorrected,
                zeroDisplay: '0',
                removeExtraTrailingZeros: true,
            });
        }
        if (positionLiqQuote && pendingTx.txDetails.quoteTokenDecimals) {
            positionLiqQuoteDecimalCorrected =
                positionLiqQuote /
                Math.pow(10, pendingTx.txDetails.quoteTokenDecimals);
            positionLiqQuoteTruncated = getFormattedNumber({
                value: positionLiqQuoteDecimalCorrected,
                zeroDisplay: '0',
                removeExtraTrailingZeros: true,
            });
        }

        const posHashObject = {
            isPositionTypeAmbient: pendingTx.txDetails.isAmbient || false,
            user: pendingTx.userAddress.toLowerCase(),
            baseAddress: pendingTx.txDetails.baseAddress.toLowerCase(),
            quoteAddress: pendingTx.txDetails.quoteAddress.toLowerCase(),
            poolIdx: pendingTx.txDetails.poolIdx,
            bidTick: pendingTx.txDetails.lowTick || 0,
            askTick: pendingTx.txDetails.highTick || 0,
        };

        const posHash = getPositionHash(undefined, posHashObject);

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

        const positionData = await getPositionData(
            mockServerPosition,
            tokenList,
            crocEnv,
            provider,
            chainId,
            analyticsPoolList,
            cachedFetchTokenPrice,
            cachedQuerySpotPrice,
            cachedTokenDetails,
        );

        let backupUsdValue = 0;

        if (
            pendingTx.txDetails.initialTokenQty &&
            pendingTx.txDetails.secondaryTokenQty &&
            positionData.baseUsdPrice
        ) {
            const quoteUsdPrice =
                positionData.quoteUsdPrice ||
                poolPriceNonDisplay * positionData.baseUsdPrice ||
                0;
            backupUsdValue =
                parseFloat(pendingTx.txDetails.initialTokenQty) *
                    positionData.baseUsdPrice +
                parseFloat(pendingTx.txDetails.secondaryTokenQty) *
                    quoteUsdPrice;
        }

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
                positionLiqBaseDecimalCorrected ||
                positionData.positionLiqBaseDecimalCorrected,
            positionLiqQuoteDecimalCorrected:
                positionLiqQuoteDecimalCorrected ||
                positionData.positionLiqQuoteDecimalCorrected,
            positionLiqBaseTruncated:
                positionLiqBaseTruncated ||
                positionData.positionLiqBaseTruncated,
            positionLiqQuoteTruncated:
                positionLiqQuoteTruncated ||
                positionData.positionLiqQuoteTruncated,
            totalValueUSD: positionData.totalValueUSD
                ? positionData.totalValueUSD
                : backupUsdValue,
            apy: positionData.apy,
            positionId: positionData.positionId,
            onChainConstructedPosition: true,
        } as PositionIF;

        let isSuccess = false;

        if (
            pendingTx.txDetails &&
            pendingTx.txDetails.currentLiquidity != liqBigInt
        ) {
            isSuccess = true;
        } else if (
            liqBigInt > 0 &&
            (pendingTx.txDetails.currentLiquidity == 0n ||
                pendingTx.txDetails.currentLiquidity == undefined)
        ) {
            isSuccess = true;
        }

        return {
            positionHash: posHash,
            timestamp: Date.now(),
            position: onChainPosition,
            type: pendingTx.txType,
            action: pendingTx.txAction || '',
            status: 'onchain',
            isSuccess: isSuccess,
            prevPositionHash: pendingTx.txDetails?.prevPositionHash,
        };
    };

    return {
        genFakeLimitOrder,
        genFakePosition,
    };
};

export default useGenFakeTableRow;
