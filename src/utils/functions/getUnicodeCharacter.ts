import tokenUnicodeCharMap from '../data/tokenUnicodeCharMap';

export default (symbol: string) => {
    const character = tokenUnicodeCharMap.filter((token) => {
        return token.symbol.toLowerCase() === symbol.toLowerCase();
    })[0]?.character;

    return character || '';
};
