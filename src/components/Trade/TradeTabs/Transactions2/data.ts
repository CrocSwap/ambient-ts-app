import { columnSlugsType } from './Transactions2';

// left-to-right DOM sequence for informational columns
export const infoCells: columnSlugsType[] = [
    'timeStamp',
    'txId',
    'txWallet',
    'txPrice',
    'txType',
    'txSide',
    'txValue',
];

// left-to-right DOM sequence for action buttons
export const actionButtons: columnSlugsType[] = [
    'editBtn',
    'removeBtn',
    'copyBtn',
    'walletBtn',
    'overflowBtn',
];

// left-to-right DOM sequence for overflow menu buttons
export const actionButtonsMenu: columnSlugsType[] = [
    'editBtn',
    'removeBtn',
    'copyBtn',
    'walletBtn',
    'leafBtn',
    'editBtn',
    'removeBtn',
];