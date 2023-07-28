import { Suspense, memo, useState } from 'react';
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
    const getIconWidth = (size: TokenIconSize) => {
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

    const [fetchError, setFetchError] = useState<boolean>(false);

    const handleFetchError = (): void => {
        IS_LOCAL_ENV &&
            console.warn(
                `failed to fetch token icon from URI <<${src}>>, displaying fallback image, refer to file TokenIcon.tsx to troubleshoot`,
            );
        setFetchError(true);
    };

    const noTokenIcon: JSX.Element = (
        <NoTokenIcon tokenInitial={alt?.charAt(0)} width={getIconWidth(size)} />
    );

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
