// import styles from './TokenRow.module.css';
import TokenIcon from '../TokenIcon/TokenIcon';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import {
    TableRow,
    TableCell,
    TradeButton,
} from '../../../styled/Components/Analytics';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { dexTokenData } from '../../../pages/Explore/useTokenStats';
import { GCServerPoolIF, PoolIF } from '../../../ambient-utils/types';
import { useContext, useEffect, useState } from 'react';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface propsIF {
    token: dexTokenData;
    samplePool: PoolIF | undefined;
    backupPool: GCServerPoolIF | undefined;
    goToMarket: (tknA: string, tknB: string) => void;
    smallScreen: boolean;
}

export default function TokenRow(props: propsIF) {
    const { token, samplePool, goToMarket, smallScreen, backupPool } = props;
    if (!token.tokenMeta || (!samplePool && !backupPool)) return null;
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const mobileScrenView = useMediaQuery('(max-width: 500px)');

    const [tvlDisplay, setTvlDisplay] = useState<string>('');
    const [feesDisplay, setFeesDisplay] = useState<string>('');
    const [volumeDisplay, setVolumeDisplay] = useState<string>('');

    useEffect(() => {
        expandTokenStats(token);
        async function expandTokenStats(token: dexTokenData) {
            if (!crocEnv || !token.tokenMeta) return;
            const tokenPricePromise = cachedFetchTokenPrice(
                token.tokenAddr,
                chainId,
                crocEnv,
            );
            const tokenPrice = (await tokenPricePromise)?.usdPrice || 0.0;
            const tvl = token.dexTvl / Math.pow(10, token.tokenMeta.decimals);
            const tvlUsd = tvl * tokenPrice;
            setTvlDisplay(
                getFormattedNumber({
                    value: tvlUsd,
                    prefix: '$',
                    isTvl: true,
                }),
            );
            const fees = token.dexFees / Math.pow(10, token.tokenMeta.decimals);
            const feesUsd = fees * tokenPrice;
            setFeesDisplay(
                getFormattedNumber({
                    value: feesUsd,
                    prefix: '$',
                    isTvl: true,
                }),
            );
            const volume =
                token.dexVolume / Math.pow(10, token.tokenMeta.decimals);
            const volumeUsd = volume * tokenPrice;
            setVolumeDisplay(
                getFormattedNumber({
                    value: volumeUsd,
                    prefix: '$',
                    isTvl: true,
                }),
            );
        }
    }, [JSON.stringify(token)]);

    return (
        <TableRow
            onClick={() => {
                console.log(backupPool);
                if (samplePool) {
                    goToMarket(
                        samplePool.base.address,
                        samplePool.quote.address,
                    );
                } else if (backupPool) {
                    goToMarket(backupPool.base, backupPool.quote);
                }
            }}
        >
            <TableCell>
                <FlexContainer
                    alignItems='center'
                    justifyContent='flex-start'
                    gap={8}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <TokenIcon
                            token={token.tokenMeta}
                            src={uriToHttp(token.tokenMeta?.logoURI ?? '')}
                            alt={token.tokenMeta?.symbol ?? ''}
                            size={mobileScrenView ? 's' : '2xl'}
                        />
                        <p>{token.tokenMeta?.symbol}</p>
                    </div>
                </FlexContainer>
            </TableCell>
            {smallScreen || <TableCell left>{token.tokenMeta?.name}</TableCell>}
            <TableCell>
                <p style={{ textTransform: 'none' }}>{tvlDisplay}</p>
            </TableCell>
            <TableCell>
                <p>{feesDisplay}</p>
            </TableCell>
            <TableCell>
                <p>{volumeDisplay}</p>
            </TableCell>
            <TableCell>
                <FlexContainer
                    fullHeight
                    alignItems='center'
                    justifyContent='flex-end'
                >
                    <TradeButton>Trade</TradeButton>
                </FlexContainer>
            </TableCell>
        </TableRow>
    );
}
