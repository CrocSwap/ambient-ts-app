import { Suspense, memo, useEffect, useState } from 'react';
import styles from './TokenIcon.module.css';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';
import { IS_LOCAL_ENV } from '../../../constants';

type TokenIconSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

interface propsIF {
    src?: string;
    alt?: string;
    size?: TokenIconSize;
}

function TokenIcon({ src = '', alt = 'Token Icon', size = 'm' }: propsIF) {
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

    return (
        <Suspense fallback={noTokenIcon}>
            {src && !fetchError ? (
                <img
                    className={styles.token_icon}
                    style={{ width: getIconWidth(size) }}
                    src={src}
                    alt={alt}
                    onError={handleFetchError}
                />
            ) : (
                noTokenIcon
            )}
        </Suspense>
    );
}

export default memo(TokenIcon);
