import { useMemo } from 'react';
import { ackTokensMethodsIF } from '../../App/hooks/useAckTokens';
import { TokenIF, TokenPairIF } from '../../utils/interfaces/exports';

export const useAcknowledgementSwap = (
    chainId: string,
    tokenPair: TokenPairIF,
    ackTokens: ackTokensMethodsIF,
    verifyToken: (addr: string, chn: string) => boolean,
) => {
    // logic to determine if a given token is acknowledged or on a list
    const isTokenUnknown = (tkn: TokenIF): boolean => {
        const isAckd: boolean = ackTokens.check(tkn.address, chainId);
        const isListed: boolean = verifyToken(tkn.address, chainId);
        return !isAckd && !isListed;
    };

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA: boolean = isTokenUnknown(tokenPair.dataTokenA);
    const needConfirmTokenB: boolean = isTokenUnknown(tokenPair.dataTokenB);

    // token acknowledgement needed message (empty string if none needed)
    const ackTokenMessage = useMemo<string>(() => {
        // !Important   any changes to verbiage in this code block must be approved
        // !Important   ... by Doug, get in writing by email or request specific
        // !Important   ... review for a pull request on GitHub
        let text: string;
        if (needConfirmTokenA && needConfirmTokenB) {
            text = `The tokens ${
                tokenPair.dataTokenA.symbol || tokenPair.dataTokenA.name
            } and ${
                tokenPair.dataTokenB.symbol || tokenPair.dataTokenB.name
            } are not listed on any major reputable token list. Please be sure these are the actual tokens you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenA) {
            text = `The token ${
                tokenPair.dataTokenA.symbol || tokenPair.dataTokenA.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenB) {
            text = `The token ${
                tokenPair.dataTokenB.symbol || tokenPair.dataTokenB.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else {
            text = '';
        }
        return text;
    }, [needConfirmTokenA, needConfirmTokenB]);

    // value showing if no acknowledgement is necessary
    const areBothAckd: boolean = !needConfirmTokenA && !needConfirmTokenB;

    // logic to acknowledge one or both tokens as necessary
    const ackAsNeeded = (): void => {
        console.clear();
        needConfirmTokenA && ackTokens.acknowledge(tokenPair.dataTokenA);
        needConfirmTokenB && ackTokens.acknowledge(tokenPair.dataTokenB);
    };
};
