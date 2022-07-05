import styles from './TokenSelect.module.css';
import { CgUnavailable } from 'react-icons/cg';
import { TokenIF } from '../../../utils/interfaces/exports';

interface TokenSelectProps {
    token: TokenIF;
    chooseToken: (tok: TokenIF) => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { token, chooseToken } = props;

    const getRandomInt = () => Math.floor(Math.random() * 18000);

    const noTokenImage = <CgUnavailable size={20} />;

    // As much as I dislike directing using svgs in code, this is the only way we can style the fill on hover...unless we want to bring in two different SVGS.
    const starIcon = (
        <svg
            width='23'
            height='23'
            viewBox='0 0 23 23'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M11.5 1.58301L14.7187 8.10384L21.9166 9.15593L16.7083 14.2288L17.9375 21.3955L11.5 18.0101L5.06248 21.3955L6.29165 14.2288L1.08331 9.15593L8.28123 8.10384L11.5 1.58301Z'
                stroke='#BDBDBD'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className={styles.star_svg}
            />
        </svg>
    );

    return (
        <div className={styles.modal_content} onClick={() => chooseToken(token)}>
            <div className={styles.modal_tokens_info}>
                {starIcon}
                {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
                <span className={styles.modal_token_symbol}>{token.symbol}</span>
                <span className={styles.modal_token_name}>{token.name}</span>
            </div>
            <div className={styles.modal_tokens_amount}>{getRandomInt()}</div>
        </div>
    );
}
