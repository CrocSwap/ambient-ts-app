import { Suspense, memo, useEffect, useState } from 'react';
import styles from './TokenIcon.module.css';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';
import { IS_LOCAL_ENV } from '../../../constants';
import { TokenIF } from '../../../utils/interfaces/exports';
import processLogoSrc from './processLogoSrc';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import { useLocation } from 'react-router-dom';

type TokenIconSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

interface propsIF {
    token?: TokenIF;
    src?: string;
    alt?: string;
    size?: TokenIconSize;
}

function TokenIcon({
    token,
    src = '',
    alt = 'Token Icon',
    size = 'm',
}: propsIF) {
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

    const noTokenIcon: JSX.Element = (
        <NoTokenIcon tokenInitial={alt?.charAt(0)} width={getIconWidth(size)} />
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
                            style={{ width: getIconWidth(size) }}
                            src={processLogoSrc(token)}
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
