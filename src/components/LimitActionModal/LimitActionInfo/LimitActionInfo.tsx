import { useContext } from 'react';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { AppStateContext } from '../../../contexts';
import { TokenContext } from '../../../contexts/TokenContext';
import Row from '../../Global/Row/Row';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './LimitActionInfo.module.css';

interface ILimitActionInfoProps {
    type: 'Remove' | 'Claim';
    usdValue: string;
    tokenQuantity: string | undefined;
    tokenQuantityAddress: string;
    limitOrderPrice: string | undefined;
    limitOrderPriceAddress: string;
    receivingAmount: string | undefined;
    receivingAmountAddress: string;
    claimableAmount?: string | undefined;
    claimableAmountAddress?: string;
    networkFee: string | undefined;
}

export default function LimitActionInfo(props: ILimitActionInfoProps) {
    const {
        type,
        usdValue,
        tokenQuantity,
        tokenQuantityAddress,
        limitOrderPrice,
        limitOrderPriceAddress,
        receivingAmount,
        receivingAmountAddress,
        networkFee,
        claimableAmount,
        claimableAmountAddress,
    } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { tokens } = useContext(TokenContext);
    const tokenQuantityToken: TokenIF | undefined =
        tokens.getTokenByAddress(tokenQuantityAddress);
    const limitOrderPriceToken: TokenIF | undefined = tokens.getTokenByAddress(
        limitOrderPriceAddress,
    );
    const receivingAmountToken: TokenIF | undefined = tokens.getTokenByAddress(
        receivingAmountAddress,
    );
    const claimableAmountToken: TokenIF | undefined = claimableAmountAddress
        ? tokens.getTokenByAddress(claimableAmountAddress)
        : undefined;

    const isLimitOrderPartiallyFilled =
        claimableAmount !== undefined && claimableAmount !== '0';

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <div className={styles.info_container}>
                    <Row>
                        <span>Total Value</span>
                        <div className={styles.token_price}>{usdValue}</div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>
                            {type === 'Remove' ? 'Unconverted ' : 'Original '}
                            Token Quantity
                        </span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>{tokenQuantity}</p>
                            <TokenIcon
                                token={tokenQuantityToken}
                                src={uriToHttp(
                                    tokenQuantityToken?.logoURI ?? '',
                                )}
                                alt={tokenQuantityToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                    <Row>
                        <span>Limit Order Price</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {limitOrderPrice}
                            </p>
                            <TokenIcon
                                token={limitOrderPriceToken}
                                src={uriToHttp(
                                    limitOrderPriceToken?.logoURI ?? '',
                                )}
                                alt={limitOrderPriceToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>
                            {type === 'Remove'
                                ? isLimitOrderPartiallyFilled
                                    ? 'Return Quantities'
                                    : 'Return Quantity'
                                : 'Claimable Amount'}{' '}
                        </span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {receivingAmount}
                            </p>
                            <TokenIcon
                                token={receivingAmountToken}
                                src={uriToHttp(
                                    receivingAmountToken?.logoURI ?? '',
                                )}
                                alt={receivingAmountToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                    {type === 'Remove' && isLimitOrderPartiallyFilled ? (
                        <Row>
                            <span></span>
                            <div className={styles.align_center}>
                                <p className={styles.info_text}>
                                    {claimableAmount}
                                </p>
                                <TokenIcon
                                    token={claimableAmountToken}
                                    src={uriToHttp(
                                        claimableAmountToken?.logoURI ?? '',
                                    )}
                                    alt={claimableAmountToken?.symbol ?? '?'}
                                    size='xs'
                                />
                            </div>
                        </Row>
                    ) : undefined}
                </div>
            </div>
            {chainId === '0x1' && (
                <div className={styles.network_fee_container}>
                    <div>
                        <span>Network Fee</span>
                    </div>
                    <span>{networkFee ? '~' + networkFee : '...'}</span>
                </div>
            )}
        </div>
    );
}
