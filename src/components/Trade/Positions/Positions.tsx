import Position from '../../Global/Position/Position';
import styles from './Positions.module.css';
import { SetStateAction } from 'react';

interface PositionsProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    showEditComponent: boolean;
    setShowEditComponent: React.Dispatch<SetStateAction<boolean>>;
}

export default function Positions(props: PositionsProps) {
    const { portfolio, showEditComponent, setShowEditComponent, notOnTradeRoute } = props;
    const examplePositions = [1, 2, 3];

    const positionsDisplay = examplePositions.map((position, idx) => (
        <Position
            key={idx}
            portfolio={portfolio}
            showEditComponent={showEditComponent}
            setShowEditComponent={setShowEditComponent}
            notOnTradeRoute={notOnTradeRoute}
        />
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
