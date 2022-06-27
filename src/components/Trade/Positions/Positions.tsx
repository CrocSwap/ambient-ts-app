import Position from '../../Global/Position/Position';
import { useAppSelector } from './../../../utils/hooks/reduxToolkit';

import styles from './Positions.module.css';

interface PositionsProps {
    isAllPositionsEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
}

import { useMoralis } from 'react-moralis';

export default function Positions(props: PositionsProps) {
    const { portfolio, notOnTradeRoute, isAllPositionsEnabled } = props;

    const { account } = useMoralis();

    const tradeData = useAppSelector((state) => state.tradeData);

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;

    const positionsDisplay = userPositions.map((position, idx) => (
        <Position
            key={idx}
            portfolio={portfolio}
            notOnTradeRoute={notOnTradeRoute}
            position={position}
            isAllPositionsEnabled={isAllPositionsEnabled}
            tokenAAddress={tokenAAddress}
            tokenBAddress={tokenBAddress}
            account={account ?? undefined}
        />
    ));

    const positionsHeader = (
        <thead>
            <tr>
                {portfolio && <th />}
                {isAllPositionsEnabled && <th>Owner ID</th>}
                <th>Position ID</th>
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
