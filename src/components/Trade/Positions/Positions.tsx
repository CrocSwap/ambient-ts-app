import Position from '../../Global/Position/Position';
import { useAppSelector } from './../../../utils/hooks/reduxToolkit';

import styles from './Positions.module.css';

interface PositionsProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
}

export default function Positions(props: PositionsProps) {
    const { portfolio, notOnTradeRoute } = props;
    const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;
    console.log({ userPositions });

    const examplePositions = [1, 2, 3];

    const positionsDisplay = examplePositions.map((position, idx) => (
        <Position key={idx} portfolio={portfolio} notOnTradeRoute={notOnTradeRoute} />
    ));

    const positionsHeader = (
        <thead>
            <tr>
                {portfolio && <th></th>}
                <th>Id</th>
                <th>Range</th>
                <th>APY</th>
                <th></th>
                <th></th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.posiitons_table_display}>
            <table>
                {positionsHeader}

                <tbody>{positionsDisplay}</tbody>
            </table>
        </div>
    );
}
