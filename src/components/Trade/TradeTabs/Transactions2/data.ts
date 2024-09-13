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
    // 'txBase',
    // 'txQuote',
    'txTokens'
];

// left-to-right DOM sequence for action buttons
export const actionButtons: columnSlugsType[] = [
    'editBtn',
    'removeBtn',
    'overflowBtn',
];

export const priorityInDOM: columnSlugsType[] = [
    'timeStamp',
    'txWallet',
    'txPrice',
    'txType',
    'overflowBtn',
    'txValue',
    'txId',
    'txSide',
    // 'txBase',
    // 'txQuote',
    'txTokens',
    'editBtn',
    'removeBtn',
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