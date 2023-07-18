import { useContext, useEffect, useRef, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { ExploreContext } from '../../contexts/ExploreContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';
import styled from 'styled-components';

export default function Explore() {
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    // metadata only
    const { poolList } = useContext(PoolContext);
    // full expanded data set
    const { pools } = useContext(ExploreContext);

    // time since data was retrieved to display in DOM
    const [timeSince, setTimeSince] = useState<string>('');

    // fn wrapper to get pools
    const getPools = async () => {
        // make sure crocEnv exists and pool metadata is present
        if (crocEnv && poolList.length) {
            // clear text in DOM for time since last update
            setTimeSince('');
            // use metadata to get expanded pool data
            pools.getAll(poolList, crocEnv, chainData.chainId);
            // disable autopolling of infura
            pools.autopoll.disable();
        }
    };

    // get expanded pool metadata
    // run when crocEnv, current chain, or number of pools changes
    useEffect(() => {
        // prevent rapid-fire of requests to infura
        pools.autopoll.allowed && getPools();
    }, [crocEnv, chainData.chainId, poolList.length]);

    // logic to update DOM text with time since data was retrieved
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        // timestamp when data was successfully fetched
        const { retrievedAt } = pools;
        // constant defining 1s in ms
        const ONE_SECOND = 1000;
        // logic to translate elapsed time to a readable string
        // this logic calls itself recursively
        const updateRetrievedAt = () => {
            // make sure that data exists (implied by non-null value)
            if (retrievedAt) {
                // time elapsed since fetch in ms
                const elapsedTime: number = Date.now() - retrievedAt;
                // string for DOM
                let elapsedText: string;
                // logic tree for variable section of the text
                if (elapsedTime < ONE_SECOND * 10) {
                    elapsedText = 'just now';
                } else if (elapsedTime < ONE_SECOND * 30) {
                    elapsedText = '30 sec';
                } else if (elapsedTime < ONE_SECOND * 60) {
                    elapsedText = '1 min';
                } else if (elapsedTime < ONE_SECOND * 120) {
                    elapsedText = '2 min';
                } else if (elapsedTime < ONE_SECOND * 180) {
                    elapsedText = '3 min';
                } else if (elapsedTime < ONE_SECOND * 240) {
                    elapsedText = '4 min';
                } else if (elapsedTime < ONE_SECOND * 300) {
                    elapsedText = '5 min';
                } else if (elapsedTime < ONE_SECOND * 600) {
                    elapsedText = '10 min';
                } else if (elapsedTime < ONE_SECOND * 900) {
                    elapsedText = '15 min';
                } else if (elapsedTime < ONE_SECOND * 1200) {
                    elapsedText = '20 min';
                } else if (elapsedTime < ONE_SECOND * 1800) {
                    elapsedText = '30 min';
                } else {
                    elapsedText = '> 30 minutes';
                }
                // update the DOM with a readable text string
                setTimeSince('updated: ' + elapsedText);
                // call recursively at 10s
                timeoutId.current = setTimeout(
                    updateRetrievedAt,
                    ONE_SECOND * 10,
                );
            } else {
                // re-check data in two seconds if fetch is not yet complete
                timeoutId.current = setTimeout(
                    updateRetrievedAt,
                    ONE_SECOND * 2,
                );
            }
        };
        // run recursive text-updating fn
        updateRetrievedAt();
        // clear timeout when the component unmounts
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, [pools.retrievedAt]);

    return (
        <Section>
            <MainWrapper>
                <h2>Top Pools on Ambient</h2>
                <Refresh>
                    <p>{timeSince}</p>
                    <Button onClick={() => getPools()}>
                        <RefreshIcon />
                    </Button>
                </Refresh>
            </MainWrapper>
            <TopPools allPools={pools.all} chainId={chainData.chainId} />
        </Section>
    );
}

const Section = styled.section`
    background: var(--dark2);
    height: calc(100vh - 56px);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const MainWrapper = styled.p`
    font-size: var(--header1-size);
    line-height: var(--header1-lh);
    color: var(--text1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
`;

const Button = styled.button`
    background-color: var(--dark3);
    border-radius: 4px;
    padding: 4px 8px;
    border: none;
    outline: none;
`;

const Refresh = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 12px;
    font-style: italic;
    color: var(--text1);
`;

const RefreshIcon = styled(FiRefreshCw)`
    font-size: 18px;
    cursor: pointer;
`;
