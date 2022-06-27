import Position from '../../Global/Position/Position';
import { useAppSelector } from './../../../utils/hooks/reduxToolkit';

import styles from './Positions.module.css';

interface PositionsProps {
    isAllPositionsEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
}

export default function Positions(props: PositionsProps) {
    const { portfolio, notOnTradeRoute, isAllPositionsEnabled } = props;
    const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;

    const positionsDisplay = userPositions.map((position, idx) => (
        <Position
            key={idx}
            portfolio={portfolio}
            notOnTradeRoute={notOnTradeRoute}
            position={position}
            isAllPositionsEnabled={isAllPositionsEnabled}
        />
    ));

    const positionsHeader = (
        <thead>
            <tr>
                {portfolio && <th />}
                {isAllPositionsEnabled && <th>Owner</th>}
                <th>Position Id</th>
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
