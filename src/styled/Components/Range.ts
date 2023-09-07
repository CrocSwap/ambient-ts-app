import styled from 'styled-components';

export const Status = styled.div<{
    status: 'ambient' | 'positive' | 'negative';
}>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    ${({ status }) =>
        `background-color: var(--${
            status === 'ambient' ? 'title-gradient' : status
        })`};
`;
