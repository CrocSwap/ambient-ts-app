import { memo } from 'react';
import styles from './TokenIcon.module.css';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';

type TokenIconSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl';

interface TokenIconPropsIF {
    src?: string;
    alt?: string;
    size?: TokenIconSize;
}

function TokenIcon({
    src = '',
    alt = 'Token Icon',
    size = 'm',
}: TokenIconPropsIF) {
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

    return (
        <>
            {src !== '' ? (
                <img
                    className={styles.token_icon}
                    style={{ width: getIconWidth(size) }}
                    src={src}
                    alt={alt}
                />
            ) : (
                <NoTokenIcon
                    tokenInitial={alt?.charAt(0)}
                    width={getIconWidth(size)}
                />
            )}
        </>
    );
}

export default memo(TokenIcon);
