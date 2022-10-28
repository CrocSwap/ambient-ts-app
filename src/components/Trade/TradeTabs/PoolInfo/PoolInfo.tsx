import { ChainSpec } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { memoizePoolStats } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { formatAmount } from '../../../../utils/numbers';
import styles from './PoolInfo.module.css';
import { BsArrowUpRight, BsStars } from 'react-icons/bs';
import trimString from '../../../../utils/functions/trimString';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { ZERO_ADDRESS } from '../../../../constants';
// interface for props
interface PoolInfoPropsIF {
    chainData: ChainSpec;
    lastBlockNumber: number;
}
interface PoolInfoCardPropsIF {
    // eslint-disable-next-line
    title: any;
    // eslint-disable-next-line
    data: any;
}

const cachedPoolStatsFetch = memoizePoolStats();

// react functional component
export default function PoolInfo(props: PoolInfoPropsIF) {
    // pool info card--------------------

    function PoolInfoCard(props: PoolInfoCardPropsIF) {
        return (
            <div className={styles.card_container}>
                <p className={styles.title}>{props.title}</p>
                <h4 className={styles.info}>{props.data}</h4>
            </div>
        );
    }

    // end of pool info card--------------------

    const { chainData, lastBlockNumber } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();
    const [poolFees, setPoolFees] = useState<string | undefined>();
    const [poolAPR, setPoolAPR] = useState<string | undefined>();

    useEffect(() => {
        setPoolVolume(undefined);
        setPoolTvl(undefined);
        setPoolFees(undefined);
        setPoolAPR(undefined);
    }, [
        JSON.stringify({ base: tradeData.baseToken.address, quote: tradeData.quoteToken.address }),
    ]);

    const fetchPoolStats = () => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainData.chainId.toString(),
                baseTokenAddress,
                quoteTokenAddress,
                chainData.poolIndex,
                Math.floor(lastBlockNumber / 4),
            );
            const volume = poolStatsFresh?.volume;
            const volumeString = volume ? '$' + formatAmount(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmount(tvl) : undefined;
            setPoolTvl(tvlString);
            const fees = poolStatsFresh?.fees;
            const feesString = fees ? '$' + formatAmount(fees) : undefined;
            setPoolFees(feesString);
            const apr = poolStatsFresh?.apy;
            const aprString = apr ? formatAmount(apr) + '%' : undefined;
            setPoolAPR(aprString);
        })();
    };

    useEffect(() => {
        fetchPoolStats();
    }, [
        lastBlockNumber,
        JSON.stringify({ base: tradeData.baseToken.address, quote: tradeData.quoteToken.address }),
    ]);
    const truncatedBaseAddress = trimString(baseTokenAddress, 6, 0, '…');
    const truncatedQuoteAddress = trimString(quoteTokenAddress, 6, 0, '…');

    const baseAddressWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{baseTokenAddress}</p>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p>{truncatedBaseAddress}</p>
        </DefaultTooltip>
    );
    const quoteAdressWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{quoteTokenAddress}</p>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p>{truncatedQuoteAddress}</p>
        </DefaultTooltip>
    );

    const poolComposition = (
        <div className={styles.pool_composition_container}>
            <p className={styles.title}>Pool Composition</p>
            <div className={styles.pool_composition}>
                <div className={`${styles.composition_row} ${styles.composition_row_header}`}>
                    <p>Token</p>
                    <p className={styles.right}>Balance(not real)</p>
                    <p className={styles.right}>Value(not real)</p>
                </div>
                <div className={styles.composition_row}>
                    <a
                        target='_blank'
                        rel='noreferrer'
                        href={
                            baseTokenAddress === ZERO_ADDRESS
                                ? 'https://goerli.etherscan.io/address/0xfafcd1f5530827e7398b6d3c509f450b1b24a209'
                                : `https://goerli.etherscan.io/token/${baseTokenAddress}`
                        }
                        className={styles.token_display}
                    >
                        {/* <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt=""  /> */}
                        <p>{baseTokenSymbol} </p>
                        <p> {baseAddressWithTooltip}</p>
                        <BsArrowUpRight size={10} />
                    </a>
                    <p className={styles.right}>87,114</p>
                    <p className={styles.right}>$135,868,360</p>
                </div>
                <div className={styles.composition_row}>
                    <a
                        target='_blank'
                        rel='noreferrer'
                        href={`https://goerli.etherscan.io/token/${quoteTokenAddress}`}
                        className={styles.token_display}
                    >
                        {/* <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt=""  /> */}
                        <p>{quoteTokenSymbol} </p>
                        <p>{quoteAdressWithTooltip}</p>
                        <BsArrowUpRight size={10} />
                    </a>

                    <p className={styles.right}>81,973</p>
                    <p className={styles.right}>$139,945,927e</p>
                </div>
            </div>
        </div>
    );

    const aprTitle = (
        <p>
            APR
            <BsStars color='#d4af37' />
        </p>
    );

    return (
        <main className={styles.container}>
            {/* <p>
                {baseTokenSymbol}: {baseTokenAddress}
            </p>
            <p>
                {quoteTokenSymbol}: {quoteTokenAddress}
            </p> */}
            {/* <p>24h Swap Volume: {poolVolume || '...'}</p>
            <p>Total Value Locked (TVL): {poolTvl || '...'}</p> */}
            {/* <p>Total Fees: {poolFees || '...'}</p> */}
            {/* <p>Total APR: {poolAPR || '...'}</p> */}
            {poolComposition}
            <div className={styles.content}>
                <PoolInfoCard title='24h Swap Volume:' data={poolVolume || '...'} />
                <PoolInfoCard title='TVL:' data={poolTvl || '...'} />
                <PoolInfoCard title='Total Fees:' data={poolFees || '...'} />
                <PoolInfoCard title={aprTitle} data={poolAPR || '...'} />
            </div>
        </main>
    );
}
