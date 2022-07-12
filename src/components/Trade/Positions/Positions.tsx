import Position from '../../Global/Position/Position';
import { useAppSelector } from './../../../utils/hooks/reduxToolkit';

import styles from './Positions.module.css';

interface PositionsProps {
    isAllPositionsEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
}

import { useMoralis } from 'react-moralis';
import { graphData } from '../../../utils/state/graphDataSlice';
import PositionHeader from '../../Global/Position/PositionHeader';
import PositionCard from '../../Global/Position/PositionCard';

export default function Positions(props: PositionsProps) {
    const { portfolio, notOnTradeRoute, isAllPositionsEnabled, graphData } = props;

    const { account, isAuthenticated } = useMoralis();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    // const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;
    const poolPositions = graphData?.positionsByPool?.positions;

    const positionsDisplay = isAllPositionsEnabled
        ? poolPositions
              .map((position, idx) => (
                  <PositionCard
                      key={idx}
                      portfolio={portfolio}
                      notOnTradeRoute={notOnTradeRoute}
                      position={position}
                      isAllPositionsEnabled={isAllPositionsEnabled}
                      tokenAAddress={tokenAAddress}
                      tokenBAddress={tokenBAddress}
                      account={account ?? undefined}
                      isAuthenticated={isAuthenticated}
                      isDenomBase={isDenomBase}
                  />
              ))
              .reverse()
        : userPositions
              .map((position, idx) => (
                  <PositionCard
                      key={idx}
                      portfolio={portfolio}
                      notOnTradeRoute={notOnTradeRoute}
                      position={position}
                      isAllPositionsEnabled={isAllPositionsEnabled}
                      tokenAAddress={tokenAAddress}
                      tokenBAddress={tokenBAddress}
                      account={account ?? undefined}
                      isAuthenticated={isAuthenticated}
                      isDenomBase={isDenomBase}
                      userPosition
                  />
              ))
              .reverse();

    return (
        <div className={styles.posiitonse_table_display}>
            <PositionHeader />

            <>{positionsDisplay}</>
        </div>
    );
}
