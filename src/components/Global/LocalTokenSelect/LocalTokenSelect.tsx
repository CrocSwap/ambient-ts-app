import {
    useContext,
    useState,
    useEffect,
    memo,
    Dispatch,
    SetStateAction,
} from 'react';
import styled from 'styled-components';
import TokenIcon from '../TokenIcon/TokenIcon';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { RiArrowDownSLine } from 'react-icons/ri';

import { SoloTokenSelectModal } from '../TokenSelectContainer/SoloTokenSelectModal';

import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useModal } from '../Modal/useModal';

const MainContainer = styled.button`
    background-color: var(--dark2);
    width: 100%;
    height: 40px;
    border-radius: var(--border-radius);

    display: grid;
    grid-template-columns: 145px 1fr;
    align-items: center;
    padding: 0 8px;

    outline: none;
    border: none;
    transition: all var(--animation-speed) ease-in-out;

    & > p {
        font-size: var(--header2-size);
        line-height: var(--header2-lh);
        color: var(--text2);
    }

    &:hover {
        background: var(--dark3);
        cursor: pointer;
    }
`;

const LeftContainer = styled.p`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > p {
        color: var(--text1);
    }
`;

const RightContainer = styled.p`
    display: flex;
    justify-content: flex-end;
    text-align: end;
    align-items: flex-end;
    color: var(--text2);
`;

interface propsIF {
    tokenAorB: 'A' | 'B' | null;
    token: TokenIF;

    reverseTokens?: () => void;

    includeWallet?: React.ReactNode;

    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
}

function TokenInputQuantity(props: propsIF) {
    const {
        tokenAorB,
        token,

        reverseTokens,

        setTokenModalOpen = () => null,
    } = props;
    useContext(CrocEnvContext);

    const [isTokenSelectOpen, openTokenSelect, closeTokenSelect] = useModal();

    // needed to not dismiss exchangebalance modal when closing the token select modal
    useEffect(() => {
        setTokenModalOpen(isTokenSelectOpen);
    }, [isTokenSelectOpen]);

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    return (
        <>
            <MainContainer onClick={openTokenSelect}>
                <LeftContainer>
                    <TokenIcon
                        src={token.logoURI ? uriToHttp(token.logoURI) : ''}
                        alt={token.symbol}
                        size='xl'
                    />
                    <p>{token?.symbol}</p>

                    <RiArrowDownSLine size={27} />
                </LeftContainer>
                <RightContainer>{token?.name}</RightContainer>
            </MainContainer>

            {isTokenSelectOpen && (
                <SoloTokenSelectModal
                    onClose={closeTokenSelect}
                    showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                    setShowSoloSelectTokenButtons={
                        setShowSoloSelectTokenButtons
                    }
                    isSingleToken={!tokenAorB}
                    tokenAorB={tokenAorB}
                    reverseTokens={reverseTokens}
                />
            )}
        </>
    );
}

export default memo(TokenInputQuantity);
