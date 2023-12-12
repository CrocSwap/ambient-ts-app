import { tokenUnicodeCharMap } from '../../constants/tokenUnicodeCharMap';

export function getUnicodeCharacter(symbol: string) {
    const character = tokenUnicodeCharMap.filter((token) => {
        return token.symbol.toLowerCase() === symbol.toLowerCase();
    })[0]?.character;

    return character || '';
}
