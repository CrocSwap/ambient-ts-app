import { RiArrowDropDownLine } from 'react-icons/ri';
import { uriToHttp } from '../../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import RemoveRangeWidth from '../../../../../components/RangeActionModal/RemoveRangeWidth/RemoveRangeWidth';
import { FlexContainer } from '../../../../../styled/Common';
import styles from './VaultWithdraw.module.css';
import TooltipComponent from '../../../../../components/Global/TooltipComponent/TooltipComponent';
import Button from '../../../../../components/Form/Button';
import { useRef, useState } from 'react';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

interface Props {

    firstToken: any;
    secondToken: any;
}
export default function VaultWithdraw(props: Props) {
    const { firstToken, secondToken } = props;
    const [showWithdrawDropdown, setShowWithdrawDropdown] = useState(false)
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setShowWithdrawDropdown(false)
        
    };

    useOnClickOutside(dropdownRef, clickOutsideHandler);


    const tokensDisplay = (
        <FlexContainer
            alignItems='center'
            flexDirection='row'
            gap={5}
            style={{ flexShrink: 0 }}
        >
            <TokenIcon
                token={firstToken}
                src={uriToHttp(firstToken.logoURI)}
                alt={firstToken.symbol}
                size={'xl'}
            />
            <TokenIcon
                token={secondToken}
                src={uriToHttp(secondToken.logoURI)}
                alt={secondToken.symbol}
                size={'xl'}
            />
            <p className={styles.poolName}>ETH / USDC</p>
        </FlexContainer>
    );

    const withdrawDropdown = (
        <div className={styles.withdrawDropdownContainer}>
            <h3>Withdraw as</h3>
           

            <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button onClick={() => setShowWithdrawDropdown(!showWithdrawDropdown)}>
                    ETH / USDC <RiArrowDropDownLine />
                </button>
                {showWithdrawDropdown && <section className={styles.dropdownContent}>
                  i sm dropdown content
                </section>}
            </div>
        </div>
    );

    const pooledDisplay = (
        <section className={styles.pooledContent}>
            <div className={styles.pooledContentContainer}>
                Pooled ETH
                <div className={styles.alignCenter}>
                    1.69
                    <TokenIcon
                        token={firstToken}
                        src={uriToHttp(firstToken.logoURI)}
                        alt={firstToken.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                Pooled USDC
                <div className={styles.alignCenter}>
                    1,690.00
                    <TokenIcon
                        token={secondToken}
                        src={uriToHttp(secondToken.logoURI)}
                        alt={secondToken.symbol}
                        size={'s'}
                    />
                </div>
            </div>

            <div className={styles.seperator}>
                <span />
            </div>
            <div className={styles.pooledContentContainer}>
                Earned ETH
                <div className={styles.alignCenter}>
                    1.69
                    <TokenIcon
                        token={firstToken}
                        src={uriToHttp(firstToken.logoURI)}
                        alt={firstToken.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                Earned USDC
                <div className={styles.alignCenter}>
                    1,690.00
                    <TokenIcon
                        token={secondToken}
                        src={uriToHttp(secondToken.logoURI)}
                        alt={secondToken.symbol}
                        size={'s'}
                    />
                </div>
            </div>
        </section>
    );
    const extraDetailsDisplay = (
        <div className={styles.extraDetailsContainer}>
            <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Slippage Tolerance</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>0.5%</p>
            </div>
            <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Network Fee</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>~$3.69</p>
            </div>
        </div>
    );

    return (
        <div className={styles.withdrawContainer}>
            {tokensDisplay}
            <RemoveRangeWidth
                removalPercentage={10}
                setRemovalPercentage={() => console.log('yes')}
            />
            {pooledDisplay}
            {withdrawDropdown}
            {extraDetailsDisplay}
            <Button
                        idForDOM='approve_token_a_for_swap_module'
                        style={{ textTransform: 'none' }}
                        title={
                            'Remove Liquidity'
                        }
                        disabled={false}
                        action={() => console.log('withdraw')}
                        flat
                    />
              
        </div>
    );
}
