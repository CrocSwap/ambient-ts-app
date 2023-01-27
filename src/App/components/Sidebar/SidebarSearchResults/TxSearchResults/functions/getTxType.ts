export const getTxType = (entityType: string) => {
    const output = entityType === 'swap'
        ? 'Market' : entityType === 'limitOrder'
        ? 'Limit'
        : 'Range';
    return output;
}