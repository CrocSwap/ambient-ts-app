import styled from 'styled-components';

const SidebarPoolsListHeaderContainer = styled.header<{ range?: boolean }>`
    width: 100%;
    display: grid;
    grid-template-columns: ${({ range }) =>
        range ? '1fr 2fr 1fr 20px' : 'repeat(3, 1fr)'};
    font-weight: 300;
    color: var(--text2);
    padding: 5px 0;
    border-bottom: 1px solid var(--dark2);
`;

export default SidebarPoolsListHeaderContainer;
