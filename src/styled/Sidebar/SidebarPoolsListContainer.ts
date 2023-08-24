import styled from 'styled-components';
import { FontSize } from '../Common';

const SidebarPoolsListContainer = styled.div<{ fontSize?: string }>`
    height: 100%;
    ${FontSize}
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    overflow: hidden;
`;

export default SidebarPoolsListContainer;
