import styles from './TopPoolsCard.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { TokenIF } from '../../../../utils/interfaces/exports';

interface TopPoolsCardProps {
    pool: { name: string; tokenA: TokenIF; tokenB: TokenIF };
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const dispatch = useAppDispatch();

    return (
        <div
            className={styles.container}
            onClick={() => {
                dispatch(setTokenA(props.pool.tokenA));
                dispatch(setTokenB(props.pool.tokenB));
            }}
        >
            <div>{props.pool.name}</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );
}
