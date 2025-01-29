import styled from 'styled-components';

const NFTBannerAccountContainer = styled.div<{
    isMobile?: boolean;
}>`
    box-shadow: 4px 4px 6px #0d1117;

    position: fixed;

    display: grid;

    width: ${({ isMobile }) => (isMobile ? '90vw' : '350px')};
    max-height: ${({ isMobile }) => (isMobile ? '70vh' : '570px')};

    gap: ${({ isMobile }) => (isMobile ? '1vw' : '16px')};

    top: ${({ isMobile }) => (isMobile ? '10vh' : '0')};
    left: ${({ isMobile }) => (isMobile ? '-1vw' : 'calc(50vw - 50px)')};
    transform: ${({ isMobile }) =>
        isMobile ? 'translate(0,0)' : 'translateX(-50%)'};

    border-radius: 4px;

    border-width: 0.5px;
    border-style: solid;
    border-color: var(--accent1);

    background: #0d1117;

    z-index: 9999999;

    @media (max-width: 768px) {
        border: none;
        position: static;
        transform: none;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

const NFTBannerHeader = styled.div`
    display: flex;

    height: 40px;

    margin: 0px 10px 5px 10px;

    align-items: center;
    justify-content: space-between;
`;

const NFTHeaderSettings = styled.div`
    display: flex;

    gap: 5px;

    flex-direction: column;
`;

const NFTDisplay = styled.div<{
    template: number;
}>`
    display: grid;
    grid-template-columns: ${({ template }) =>
        template > 4 ? 'repeat(4, auto);' : 'repeat(' + template + ',  auto);'}

    overflow-y: auto;
    overflow-x: hidden;
`;

const NFTImgContainer = styled.div<{
    isMobile?: boolean;
}>`
    position: relative;
    display: flex;

    padding-bottom: ${({ isMobile }) => (isMobile ? '2vw' : '3px')};

    justify-content: center;
    align-items: center;
`;

const SelectedNftCotainer = styled.div`
    display: flex;

    gap: 10px;

    justify-content: center;
    align-items: center;
`;

const IconContainer = styled.div`
    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    gap: 2px;

    font-size: 13px;
    line-height: var(--body-lh);
    color: var(--text1);
`;

const CheckBoxContainer = styled.div`
    position: relative;
    display: flex;
`;

const NFTImg = styled.img<{
    selectedNFT: boolean;
    selectedThumbnail: boolean;
    isSelectThumbnail: boolean;
    isMobile?: boolean;
}>`
    border: 2.25px solid
        ${({ selectedNFT, selectedThumbnail }) =>
            selectedNFT
                ? '#7bede4'
                : selectedThumbnail
                  ? '#ff9800'
                  : 'transparent'};
    border-radius: 8px;

    width: ${({ isMobile }) => (isMobile ? '20vw' : '75px')};
    height: ${({ isMobile }) => (isMobile ? '20vw' : '75px')};

    &:hover {
        border-color: ${({ isSelectThumbnail }) =>
            isSelectThumbnail ? '#ff9800' : '#7bede4'};
        cursor: pointer;
    }
`;

const SelectedNFTImg = styled.img<{
    selected: boolean;
    isSelectThumbnail: boolean;
}>`
    border: 2.25px solid
        ${({ selected, isSelectThumbnail }) =>
            selected
                ? isSelectThumbnail
                    ? '#ff9800'
                    : '#7bede4'
                : 'transparent'};
    border-radius: 50%;

    width: 55px;
    height: 55px;

    &:hover {
        border-color: ${({ isSelectThumbnail }) =>
            isSelectThumbnail ? '#ff9800' : '#7bede4'};
        cursor: pointer;
    }
`;

const SelectedJazzIcon = styled.div<{
    selected: boolean;
    isSelectThumbnail: boolean;
}>`
    border: 2.25px solid
        ${({ selected, isSelectThumbnail }) =>
            selected
                ? isSelectThumbnail
                    ? '#ff9800'
                    : '#7bede4'
                : 'transparent'};
    border-radius: 50%;

    width: 55px;
    height: 55px;

    &:hover {
        border-color: ${({ isSelectThumbnail }) =>
            isSelectThumbnail ? '#ff9800' : '#7bede4'};
        cursor: pointer;
    }
`;

const NFTBannerFilter = styled.div`
    display: flex;

    height: 40px;

    gap: 5px;

    align-items: center;
    justify-content: center;
`;

const DropDownContainer = styled.div`
    position: relative;

    align-items: center;
    justify-content: center;

    z-index: 99;
`;

const DropDownListContainer = styled.div`
    position: absolute;

    height: 250px;

    overflow-y: auto;
    overflow-x: hidden;

    &:first-child {
        padding-top: 5px;
    }
`;

const DropDownHeader = styled.div`
    padding: 4px;

    grid-template-columns: repeat(2, 1fr);
    justify-content: space-around;

    display: flex;

    border-radius: 3px;

    border-width: 1.5px;
    border-style: solid;
    border-color: rgba(121, 133, 148, 0.7);

    font-size: 13px;
    color: rgba(204, 204, 204);
    background: #2f3d52;

    align-items: center;

    cursor: pointer;

    width: 150px;

    &:hover {
        border-color: rgba(121, 133, 148, 1);
    }
`;

const DropDownList = styled.ul`
    padding: 0;
    margin: 0;

    width: 150px;

    background: var(--dark3);

    box-sizing: border-box;

    color: rgba(204, 204, 204);
    font-size: 13px;

    border: 1px solid #434c58;
    box-sizing: border-box;

    cursor: pointer;
`;

const ListItem = styled.ul<{
    backgroundColor: string | undefined;
}>`
    padding: 5px 10px 5px 10px;

    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : 'transparent'};

    display: flex;

    align-items: center;
    justify-content: start;

    &:hover {
        background: #434c58;
    }
`;

const LabelSettingsArrow = styled.span<{ isActive: boolean }>`
    ${({ isActive }) => {
        if (isActive) {
            return `
                margin-top: 2.5px;
                transform: rotate(315deg);
            `;
        } else {
            return `
            margin-top: -2.5px;
            transform: rotate(135deg);
            `;
        }
    }}

    display: inline-block;
    width: 5px;
    height: 6px;
    border-top: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
    transition: all 600ms;
`;

const NFTBannerFooter = styled.div`
    display: flex;

    height: 40px;

    margin: 10px;

    align-items: center;
    justify-content: center;
`;

const SaveButton = styled.div<{ isActive: number }>`
    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    background: var(--accent1);

    ${({ isActive }) => {
        if (isActive === 1) {
            return `
                animation: pulse 1.5s ease-in-out infinite;
            `;
        } else if (isActive === 2) {
            return `
            background: var(--positive);
            `;
        }
    }}

    transition: all 500ms ease;

    display: flex;

    height: 30px;
    width: 90%;

    border-radius: 4px;

    align-items: center;
    justify-content: center;

    &:hover {
        cursor: pointer;
        filter: brightness(1.1);
    }
`;

const ScrollableContainer = styled.div<{
    isMobile?: boolean;
}>`
    position: relative;
    flex-grow: 1;
    overflow-y: auto;
    max-height: ${({ isMobile }) => (isMobile ? '30vh' : '310px')};
    scrollbar-width: thin;
    scrollbar-color: var(--accent1) var(--dark1);

    &::-webkit-scrollbar {
        display: 'none';
    }

    &::-webkit-scrollbar-track {
        background-color: var(--dark1);
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--dark3);
    }
`;
const HeaderText = styled.div<{ fontSize?: string }>`
    text-decoration: none;
    position: relative;
    padding-bottom: 0.2rem;
    font-family: var(--font-family);
    font-weight: 300;
    font-size: ${({ fontSize }) => (fontSize ? fontSize : '18px')};
    line-height: var(--header2-lh);
    letter-spacing: -0.02em;
    color: var(--text1);
`;

export {
    CheckBoxContainer,
    DropDownContainer,
    DropDownHeader,
    DropDownList,
    DropDownListContainer,
    HeaderText,
    IconContainer,
    LabelSettingsArrow,
    ListItem,
    NFTBannerAccountContainer,
    NFTBannerFilter,
    NFTBannerFooter,
    NFTBannerHeader,
    NFTDisplay,
    NFTHeaderSettings,
    NFTImg,
    NFTImgContainer,
    SaveButton,
    ScrollableContainer,
    SelectedJazzIcon,
    SelectedNftCotainer,
    SelectedNFTImg,
};
