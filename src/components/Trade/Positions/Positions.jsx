import Divider from '../../Global/Divider/Divider';
import Position from '../../Global/Position/Position';
import styles from './Positions.module.css';

export default function Positions() {
    const examplePositions = [1, 2, 3];

    const positionsDisplay = examplePositions.map((position, idx) => <Position key={idx} />);

    const positionsHeader = (
        <thead>
            <tr>
                <th>ID</th>
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
                <Divider />
                <tbody>{positionsDisplay}</tbody>
            </table>
        </div>
    );
}
