import { LimitOrderIF } from './limitOrder';
import { PositionIF } from './position';
import { TransactionIF } from './transaction';

export type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;
