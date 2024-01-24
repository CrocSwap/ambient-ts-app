import styled from 'styled-components';

const OrderHistoryContainer = styled.div<{ top: number; left: number }>`
    position: absolute;
    text-align: center;

    top: ${({ top }) => top + 'px'};
    left: ${({ left }) => left + 'px'};

    background: rgba(36, 47, 63, 0.8);

    padding: 3px 8px 3px 8px;
    backdrop-filter: blur(4px);

    -webkit-backdrop-filter: blur(4px);

    border-radius: 4px;
    box-shadow: 0 8px 32px 0 var(--dark1);

    min-width: 120px;

    line-height: 1.3;

    transform: translateY(-50%);

    gap: 6px;
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
    cursor: default;

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
`;

export {
    OrderHistoryContainer,
    OrderHistoryHeader,
    StyledHeader,
    OrderHistoryBody,
    StyledLink,
};
