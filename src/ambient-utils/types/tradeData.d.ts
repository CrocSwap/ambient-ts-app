import { TransactionIF } from './transaction';
import { LimitOrderIF } from './limitOrder';
import { PositionIF } from './rangePosition';

export type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;