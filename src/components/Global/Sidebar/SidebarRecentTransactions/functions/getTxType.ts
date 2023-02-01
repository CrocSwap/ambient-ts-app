export const getTxType = (entityType: string): string => {
    return entityType === 'swap' ? 'Market' : entityType === 'limitOrder' ? 'Limit' : 'Range';
}