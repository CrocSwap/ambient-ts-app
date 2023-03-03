import styles from './Analytics.module.css';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';
import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';
import { SetStateAction, Dispatch } from 'react';
import { favePoolsMethodsIF } from '../../App/hooks/useFavePools';

interface propsIF {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    favePools: favePoolsMethodsIF;
}

export default function Analytics(props: propsIF) {
    const {setSelectedOutsideTab, setOutsideControl, favePools} = props;
    return (
        <section data-testid={'analytics'} className={styles.analytics_container}>
            <GraphContainer />
            <AnalyticsTabs
                setOutsideControl={setOutsideControl}
                setSelectedOutsideTab={setSelectedOutsideTab}
                favePools={favePools}
            />
        </section>
    );
}
