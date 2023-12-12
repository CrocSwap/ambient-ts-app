import { TransactionIF } from './transaction';
import { LimitOrderIF } from './limitOrder';
import { PositionIF } from './position';

export type TradeTableDataRow = TransactionIF | LimitOrderIF | PositionIF;
