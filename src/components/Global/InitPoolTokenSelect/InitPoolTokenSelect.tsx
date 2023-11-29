import { useState, useEffect, memo, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import TokenIcon from '../TokenIcon/TokenIcon';
import { TokenIF } from '../../../ambient-utils/types';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { RiArrowDownSLine } from 'react-icons/ri';

import { useModal } from '../Modal/useModal';
import { SoloTokenSelect } from '../TokenSelectContainer/SoloTokenSelect';

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
        color: var(--accent1);
    }
`;

const LeftContainer = styled.p`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > p {
        color: var(--text1);
    }
    &:hover > p {
        color: var(--accent1);
    }
    &:hover > svg {
        color: var(--accent1);
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

function TokenSelectorPoolInit(props: propsIF) {
    const {
        tokenAorB,
        token,

        reverseTokens,

        setTokenModalOpen = () => null,
    } = props;

    const [isTokenSelectOpen, openTokenSelect, closeTokenSelect] = useModal();

    // needed to not dismiss exchangebalance modal when closing the token select modal
    useEffect(() => {
        setTokenModalOpen(isTokenSelectOpen);
    }, [isTokenSelectOpen]);

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const modalOrNoModal = (
        <SoloTokenSelect
            onClose={closeTokenSelect}
            showSoloSelectTokenButtons={showSoloSelectTokenButtons}
            setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
            isSingleToken={!tokenAorB}
            tokenAorB={tokenAorB}
            reverseTokens={reverseTokens}
        />
    );

    return (
        <>
            <MainContainer onClick={openTokenSelect}>
                <LeftContainer>
                    <TokenIcon
                        src={token.logoURI ? uriToHttp(token.logoURI) : ''}
                        alt={token.symbol}
                        size='xl'
                        token={token}
                    />
                    <p>{token?.symbol}</p>

                    <RiArrowDownSLine size={27} />
                </LeftContainer>
                <RightContainer>{token?.name}</RightContainer>
            </MainContainer>

            {isTokenSelectOpen && modalOrNoModal}
        </>
    );
}

export default memo(TokenSelectorPoolInit);
