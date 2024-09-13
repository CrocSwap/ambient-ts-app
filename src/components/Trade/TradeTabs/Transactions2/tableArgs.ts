// !important:  this file is to hold non-stateful arguments provided to the new table format
// !important:  ... in a location and format that's easy to change, later this should be
// !important:  ... moved to be coded in situ in a more relevant file in the tree

// columns to display in table and px width to alot for each
export const columnMetaInfo = {
    timeStamp: {
        width: 60,
        readable: 'Timestamp',
    },
    txId: {
        width: 120,
        readable: 'ID',
    },
    txWallet: {
        width: 120,
        readable: 'Wallet',
    },
    txPrice: {
        width: 100,
        readable: 'Price',
    },
    txValue: {
        width: 100,
        readable: 'Value',
    },
    txSide: {
        width: 80,
        readable: 'Side',
    },
    txType: {
        width: 80,
        readable: 'Type',
    },
    txBase: {
        width: 100,
        readable: '',
    },
    txQuote: {
        width: 100,
        readable: '',
    },
    overflowBtn: {
        width: 30,
        readable: '',
    },
    editBtn: {
        width: 30,
        readable: '',
    },
    harvestBtn: {
        width: 30,
        readable: '',
    },
    addBtn: {
        width: 30,
        readable: '',
    },
    leafBtn: {
        width: 30,
        readable: '',
    },
    removeBtn: {
        width: 30,
        readable: '',
    },
    shareBtn: {
        width: 30,
        readable: '',
    },
    exportBtn: {
        width: 30,
        readable: '',
    },
    walletBtn: {
        width: 30,
        readable: '',
    },
    copyBtn: {
        width: 30,
        readable: '',
    },
    downloadBtn: {
        width: 30,
        readable: '',
    },
};

// string-union type of all keys in the `columnsAndSizes` object
export type columnSlugsType = keyof typeof columnMetaInfo;

// array to define column priority in the DOM, columns listed last will be removed from the
// ... DOM first when space is limited
const txPriority: columnSlugsType[] = [
    'timeStamp',
    'txPrice',
    'overflowBtn',
    'txId',
    'txWallet',
    'txSide',
    'txType',
    'txValue',
    'txBase',
    'txQuote',
    'editBtn',
    'harvestBtn',
    'addBtn',
    'leafBtn',
    'removeBtn',
    'shareBtn',
    'exportBtn',
    'walletBtn',
    'copyBtn',
    'downloadBtn',
];

export const txTableArgs = {
    txPriority
};