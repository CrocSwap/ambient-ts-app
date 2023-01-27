export const getTxType = (entityType: string): string => {
    let output: string;

    const errorMessage = `Did not recognize value of arg <<entityType>> in function getTxType(). Received value <<${entityType}>> of type <<${typeof entityType}>>. Recognized values  are type <<string>> and include <<'swap'>>, <<'limitOrder'>>, and <<liqchange>>. Function will return value <<'Unknown'>> of type <<string>>. Please refer to file getTxType.ts for troubleshooting.`;

    switch (entityType) {
        case 'swap':
            output = 'Market';
            break;
        case 'limitOrder':
            output = 'Limit';
            break;
        case 'liqchange':
            output = 'Range';
            break;
        default:
            console.warn(errorMessage);
            output = 'Unknown';
    }

    return output;
}