export type EntityType = 'swap' | 'limitOrder' | 'liqchange';

// fn to access tx metadata and produce a human-readable output for DOM for tx type
export const getTxType = (entityType: EntityType): string => {
    // declare an output variable
    let output: string;

    // template for console warning if input is not a recognized value
    const errorMessage = `Did not recognize value of arg <<entityType>> in function getTxType(). Received value <<${entityType}>> of type <<${typeof entityType}>>. Recognized values  are type <<string>> and include <<'swap'>>, <<'limitOrder'>>, and <<liqchange>>. Function will return value <<'Unknown'>> of type <<string>>. Please refer to file getTxType.ts for troubleshooting.`;

    // logic router to produce a human-readable value for DOM based on input
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

    // return human-readable output value
    return output;
};
