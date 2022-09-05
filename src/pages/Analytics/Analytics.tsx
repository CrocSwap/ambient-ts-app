import styles from './Analytics.module.css';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';
import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';
import { SetStateAction, Dispatch } from 'react';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';

interface AnalyticsProps {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
}

export default function Analytics(props: AnalyticsProps) {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <GraphContainer />
            <AnalyticsTabs
                setOutsideControl={props.setOutsideControl}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
                favePools={props.favePools}
                removePoolFromFaves={props.removePoolFromFaves}
                addPoolToFaves={props.addPoolToFaves}
            />
        </main>
    );
}
