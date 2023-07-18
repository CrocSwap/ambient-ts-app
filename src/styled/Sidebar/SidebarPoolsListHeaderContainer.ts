import styled from 'styled-components';
import { BodyText } from '..';

const SidebarPoolsListHeaderContainer = styled.header`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-weight: 300;
    ${BodyText}
    color: rgba(235, 235, 255, 0.4);
    padding: 5px 0;
    border-bottom: 1px solid var(--dark2);
`;

export default SidebarPoolsListHeaderContainer;
