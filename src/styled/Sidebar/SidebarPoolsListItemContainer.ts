import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BodyText } from '..';

const SidebarPoolsListItemContainer = styled(Link)`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-weight: 300;
    ${BodyText}
    color: var(--text2);
    padding: 5px;
    max-height: 25px;
    overflow: hidden;
    white-space: nowrap;
    border-radius: var(--border-radius);
    cursor: pointer;

    &:hover {
        transition: all var(--animation-speed) ease-in-out;
        background: var(--dark2);
    }
`;

export default SidebarPoolsListItemContainer;
