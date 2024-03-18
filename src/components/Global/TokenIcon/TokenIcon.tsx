import { Suspense, memo, useEffect, useState } from 'react';
import styles from './TokenIcon.module.css';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../ambient-utils/constants';
import { TokenIF } from '../../../ambient-utils/types';
import processLogoSrc from './processLogoSrc';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import { useLocation } from 'react-router-dom';
import fixCase, {
    letterCasings,
} from '../../../ambient-utils/functions/fixCase';

type TokenIconSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

interface propsIF {
    token?: TokenIF;
    src?: string;
    alt?: string;
    size?: TokenIconSize;
    empty?: boolean;
}

function TokenIcon(props: propsIF) {
    const {
        token,
        src = '',
        alt = 'Token Icon',
        size = 'm',
        empty = false,
    } = props;

    // translate human-readable icon width to CSS value
    const getIconWidth = (size: TokenIconSize): string => {
        switch (size) {
            case '3xl':
                return '35px';
            case '2xl':
                return '30px';
            case 'xl':
                return '27px';
            case 'l':
                return '25px';
            case 'm':
                return '20px';
            case 's':
                return '18px';
            case 'xs':
                return '15px';
            case 'xxs':
                return '10px';
            default:
                return '20px';
        }
    };

    // return the element with no embedded image asset, this is for layouts where we want to
    // ... perserve the correct negative space in the DOM without actually showing anything
    if (empty) {
        return (
            <div
                style={{
                    width: getIconWidth(size),
                    height: getIconWidth(size),
                }}
            ></div>
        );
    }

    const { pathname } = useLocation();

    // bool to trigger fallback error handling
    const [fetchError, setFetchError] = useState<boolean>(false);

    const handleFetchError = (): void => {
        IS_LOCAL_ENV &&
            console.warn(
                `failed to fetch token icon from URI <<${src}>>, displaying fallback image, refer to file TokenIcon.tsx to troubleshoot`,
            );
        setFetchError(true);
    };

    // this fixes a bug when the app sometimes gets an empty string for URI src
    // sometimes this happens post-load for still undetermined reasons
    useEffect(() => {
        setFetchError(false);
    }, [src]);

    function getTokenCharacter(tkn: TokenIF | undefined): string {
        if (!tkn) return '';
        const alphanumericRegex = /^[0-9a-zA-Z]$/;
        let character = '';
        const characterSources: string[] = [tkn.symbol, tkn.name];
        let i = 0;
        do {
            for (let i = 0; i < tkn.name.length; i++) {
                const char: string = tkn.name.charAt(i);
                if (alphanumericRegex.test(char)) {
                    character = char;
                    break;
                }
            }
            i++;
        } while (!character && i < characterSources.length);

        type casingException = [string, string, letterCasings];
        const casingExceptionsMap = new Map();
        const casingExceptions: casingException[] = [
            ['0x1', ZERO_ADDRESS, 'upper'],
        ];
        function makeMapKey(c: string, a: string): string {
            const key: string = c + '_' + a;
            return key.toLowerCase();
        }
        casingExceptions.forEach((ex: casingException) => {
            const [chn, addr, casing]: casingException = ex;
            casingExceptionsMap.set(makeMapKey(chn, addr), casing);
        });
        function chooseCasing(t: TokenIF | undefined) {
            const DEFAULT_CASING = 'upper';
            if (!t) return DEFAULT_CASING;
            const lookupKey: string = makeMapKey(
                '0x' + t.chainId.toString(16),
                t.address,
            );
            const casingOverride: letterCasings | undefined =
                casingExceptionsMap.get(lookupKey);
            return casingOverride ?? DEFAULT_CASING;
        }

        return fixCase(character, chooseCasing(token) ?? 'upper');
    }

    const noTokenIcon: JSX.Element = (
        <NoTokenIcon
            tokenInitial={getTokenCharacter(token)}
            width={getIconWidth(size)}
        />
    );

    // TODO: not great practice to use the same item for both loader and error fallback
    // TODO: ... makes it difficult to tell where the error is when seeing the fallback
    // TODO: ... best practice we should change this up in the future

    // logic to create a tooltip text based on pathway
    // if supplied an empty string tooltip will not render
    const makeTooltipText = (): string =>
        pathname.startsWith('/explore') ? `${token?.name ?? '[unknown]'}` : '';

    return (
        <DefaultTooltip title={makeTooltipText()}>
            {/* without this wrapper below the tooltip breaks */}
            <div className={styles.token_logo_wrapper}>
                <Suspense fallback={noTokenIcon}>
                    {!fetchError ? (
                        <img
                            className={styles.token_icon}
                            style={{
                                width: getIconWidth(size),
                                height: getIconWidth(size),
                            }}
                            src={processLogoSrc({
                                token: token,
                                sourceURI: src,
                            })}
                            alt={alt}
                            onError={handleFetchError}
                        />
                    ) : (
                        noTokenIcon
                    )}
                </Suspense>
            </div>
        </DefaultTooltip>
    );
}

export default memo(TokenIcon);
