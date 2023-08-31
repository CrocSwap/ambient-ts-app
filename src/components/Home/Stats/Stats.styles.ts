import styled from 'styled-components';
import { FlexContainer, Text } from '../../../styled/Common';

export const StatContainer = styled(FlexContainer)`
    @media only screen and (max-width: 600px) {
        width: 100%;
    }
`;

export const StatCardContainer = styled.li`
    background: var(--dark2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 350px;
    height: 100px;
    border-radius: 4px;
    cursor: default;
    transition: all var(--animation-speed) ease-in-out;

    &:hover {
        box-shadow: var(--glow-light-box-shadow);
    }

    @media only screen and (max-width: 600px) {
        width: 100%;
        height: 70px;
        padding: 8px;
        box-shadow: none;
    }
`;

export const StatValue = styled(Text)`
    line-height: 22px;
    letter-spacing: -0.02em;
`;
