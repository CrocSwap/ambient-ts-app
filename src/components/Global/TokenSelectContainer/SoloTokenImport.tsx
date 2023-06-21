import styles from './SoloTokenImport.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import Button from '../../Global/Button/Button';
import DividerDark from '../DividerDark/DividerDark';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
interface propsIF {
    customToken: TokenIF | null | 'querying';
    chooseToken: (tkn: TokenIF, isCustom: boolean) => void;
    chainId: string;
}
export default function SoloTokenImport(props: propsIF) {
    const { customToken, chooseToken, chainId } = props;

    const chainData = lookupChain(chainId);

    const tokenNotFound = (
        <div className={styles.token_not_found}>
            <p>Cound not find matching token</p>
            <AiOutlineQuestionCircle />
        </div>
    );

    const tokenQuerying = (
        <div className={styles.match_text_container}>
            <p>...</p>
        </div>
    );

    if (!customToken) return tokenNotFound;
    if (customToken === 'querying') return tokenQuerying;

    return (
        <div className={styles.main_container}>
            <div className={styles.match_text_container}>
                <p>A match for this token was found on chain.</p>
            </div>
            <DividerDark />

            <div className={styles.token_display}>
                <div>
                    <TokenIcon
                        src={uriToHttp(customToken.logoURI)}
                        alt={customToken.name}
                        size='2xl'
                    />
                    <h2>{customToken?.symbol}</h2>
                </div>
                <h6>{customToken?.name}</h6>
            </div>
            <p style={{ textAlign: 'center' }}>
                This token is not listed on Coingecko or any other major
                reputable lists. Please be sure
                <a
                    href={
                        chainData.blockExplorer + 'token/' + customToken.address
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                        color: 'var(--accent2)',
                    }}
                    aria-label={customToken.symbol}
                >
                    {' '}
                    this{' '}
                </a>
                is the actual token you want to trade. Many fraudulent tokens
                will use the same name and symbol as other major tokens. Always
                conduct your own research before trading.
            </p>
            <Button
                flat
                title='Acknowledge'
                action={() => chooseToken(customToken, true)}
            />
        </div>
    );
}
