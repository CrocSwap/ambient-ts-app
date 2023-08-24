import styled from 'styled-components';

export const WalletDisplay = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;

    p {
        font-size: var(--body-size);
        line-height: var(--body-lh);
        color: var(--text2);
    }
`;

export const NameDisplayContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const NameDisplay = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;

    h2 {
        font-size: var(--header2-size);
        line-height: var(--header2-lh);
        color: var(--text1);
        font-weight: 100;
    }
`;

export const CopyButton = styled.button`
    cursor: pointer;
    background: transparent;
    border: none;
`;

export const TokenContainer = styled.section`
    font-size: var(--header2-size);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 4px 10px;

    &:not(:last-of-type) {
        border-bottom: 1px solid var(--dark1);
    }
`;

export const LogoName = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;

    img {
        width: 25px;
        height: 25px;
    }
`;

export const TokenAmount = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    h3 {
        color: var(--text1);
        text-align: right;
    }

    h3,
    h6 {
        text-align: right;
    }
`;

export const NameDisplayContainer = styled.div`
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;

    .image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--title-gradient);
    }
`;

export const ActionsContainer = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    bottom: 0;
    z-index: 9;

    a:hover,
    a:focus-visible {
        color: var(--text-grey-white);
    }
`;
