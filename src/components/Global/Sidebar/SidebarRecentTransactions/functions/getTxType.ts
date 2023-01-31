export const getTxType = (entityType: string) => {
    return entityType === 'swap' ? 'Market' : entityType === 'limitOrder' ? 'Limit' : 'Range';
}