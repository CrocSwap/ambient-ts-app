import styled from 'styled-components';

const OrderHistoryHover = styled.div<{
    top: number;
    left: number;
    isOnLeftSide: boolean;
    pointerEvents: boolean;
}>`
    ${({ pointerEvents }) => {
        if (!pointerEvents) return 'pointer-events: none';
    }};

    position: absolute;
    text-align: center;

    padding: 0px 15px 0px 15px;
    cursor: pointer;
    transform: translateY(-50%);

    top: ${({ top }) => top + 'px'};
    left: ${({ left, isOnLeftSide }) => left + (isOnLeftSide ? 0 : -15) + 'px'};
`;

const OrderHistoryContainer = styled.div`
    background: var(--dark3);

    padding: 3px 8px 3px 8px;
    backdrop-filter: blur(4px);

    -webkit-backdrop-filter: blur(4px);

    border-radius: 4px;
    box-shadow: 0 8px 32px 0 var(--dark1);

    min-width: 120px;

    line-height: 1.3;

    gap: 6px;

    cursor: pointer;
`;

const OrderHistoryHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    gap: 5px;
`;

const OrderHistoryBody = styled.div`
    align-items: center;
    justify-content: space-evenly;
`;

const StyledHeader = styled.div<{ color: string; size: string }>`
    display: flex;
    align-items: center;
    cursor: pointer;

    justify-content: space-evenly;
    color: ${({ color }) => color};
    font-size: ${({ size }) => size};
`;

const StyledLink = styled.div<{ color: string; size: string }>`
    display: flex;
    align-items: center;
    cursor: pointer;

    justify-content: center;

    gap: 5px;

    color: ${({ color }) => color};
    font-size: ${({ size }) => size};

    &:hover {
        -webkit-mask: linear-gradient(
                -60deg,
                black 30%,
                rgba(119, 117, 117, 0.333),
                black 70%
            )
            right/300% 100%;

        background-repeat: no-repeat;
        animation: shimmer 2s infinite;

        @keyframes shimmer {
            100% {
                -webkit-mask-position: left;
            }
        }
    }
`;

const LinkContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    justify-content: center;
`;

export {
    OrderHistoryBody,
    OrderHistoryContainer,
    OrderHistoryHeader,
    OrderHistoryHover,
    StyledHeader,
    StyledLink,
    LinkContainer,
};
