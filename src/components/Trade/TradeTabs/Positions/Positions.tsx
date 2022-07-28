// import Position from '../../Global/Position/Position';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

import styles from './Positions.module.css';

interface PositionsProps {
    isShowAllEnabled: boolean;
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    graphData: graphData;
    lastBlockNumber: number;
    chainId: string;
}

import { useMoralis } from 'react-moralis';
import { graphData } from '../../../../utils/state/graphDataSlice';
import PositionHeader from './Position/PositionHeader';
import PositionCard from './Position/PositionCard';

export default function Positions(props: PositionsProps) {
    const { portfolio, notOnTradeRoute, isShowAllEnabled, graphData } = props;

    const { account, isAuthenticated } = useMoralis();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    // const graphData = useAppSelector((state) => state?.graphData);

    const userPositions = graphData?.positionsByUser?.positions;
    const poolPositions = graphData?.positionsByPool?.positions;

    const positionsDisplay = isShowAllEnabled
        ? poolPositions.map((position, idx) => (
              <PositionCard
                  key={idx}
                  portfolio={portfolio}
                  notOnTradeRoute={notOnTradeRoute}
                  position={position}
                  isAllPositionsEnabled={isShowAllEnabled}
                  tokenAAddress={tokenAAddress}
                  tokenBAddress={tokenBAddress}
                  account={account ?? undefined}
                  isAuthenticated={isAuthenticated}
                  isDenomBase={isDenomBase}
                  lastBlockNumber={props.lastBlockNumber}
                  chainId={props.chainId}
              />
          ))
        : //   .reverse()
          userPositions.map((position, idx) => (
              <PositionCard
                  key={idx}
                  portfolio={portfolio}
                  notOnTradeRoute={notOnTradeRoute}
                  position={position}
                  isAllPositionsEnabled={isShowAllEnabled}
                  tokenAAddress={tokenAAddress}
                  tokenBAddress={tokenBAddress}
                  account={account ?? undefined}
                  isAuthenticated={isAuthenticated}
                  isDenomBase={isDenomBase}
                  lastBlockNumber={props.lastBlockNumber}
                  chainId={props.chainId}
                  userPosition
              />
          ));
    //   .reverse();

    return (
        <div className={styles.posiitonse_table_display}>
            <PositionHeader />

            <>{positionsDisplay}</>
        </div>
    );
}
