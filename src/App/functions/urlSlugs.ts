interface paramsObjIF {
    chain: string;
    tokenA: string;
    tokenB: string;
    lowTick?: string;
    highTick?: string;
}

export function formSlugForPairParams(paramsObj: paramsObjIF): string {
    const paramTuples: [string, string][] = Object.entries(paramsObj);
    const paramStrings: string[] = paramTuples.map((tup: [string, string]) =>
        tup.join('='),
    );
    const paramsString: string = paramStrings.join('&');

    return paramsString;
}
