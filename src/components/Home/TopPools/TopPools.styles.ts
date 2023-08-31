import styled from 'styled-components';
import { FlexContainer } from '../../../styled/Common';

export const Container = styled(FlexContainer)`
    @media only screen and (min-width: 768px) {
        padding: 1rem 0;
    }
`;

export const ViewMore = styled.div`
    color: var(--accent1);
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    font-weight: 400;
    text-decoration: underline;
`;
