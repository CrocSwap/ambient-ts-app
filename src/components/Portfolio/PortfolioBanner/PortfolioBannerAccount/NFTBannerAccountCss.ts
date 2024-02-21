import styled from 'styled-components';

const NFTBannerAccountContainer = styled.div`
    box-shadow: 4px 4px 6px #0d1117;

    position: absolute;

    display: grid;
    grid-template-rows: 20% 55% 25%;

    width: 350px;
    height: 400px;

    gap: 16px;

    top: 30%;
    left: 50%;
    transform: translate(-50%, 30%);

    border-radius: 4px;

    border-width: 0.5px;
    border-style: solid;
    border-color: #7371fc;

    background: #0d1117;

    z-index: 5;
`;

const NFTBannerHeader = styled.div`
    display: flex;

    height: 40px;

    margin: 0px 10px 5px 10px;

    align-items: center;
    justify-content: space-between;
`;

const NFTDisplay = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 25%);

    overflow-y: auto;
    overflow-x: hidden;
`;

const NFTImgContainer = styled.div`
    position: relative;
    display: flex;

    padding-bottom: 3px;

    justify-content: center;
    align-items: center;
`;

const NFTImg = styled.img<{
    selected: boolean;
}>`
    border: 2.25px solid
        ${({ selected }) => (selected ? '#7bede4' : 'transparent')};
    border-radius: 8px;

    width: 75px;
    height: 75px;

    alignitems: center;
    justifycontent: space-evenly;

    &:hover {
        border-color: #7bede4;
        cursor: pointer;
    }
`;

const NFTBannerFilter = styled.div`
    display: flex;

    height: 40px;

    gap: 5px;

    margin-left: 22px;

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

const SaveButton = styled.div`
    background: #7371fc;
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

export {
    NFTBannerAccountContainer,
    NFTBannerHeader,
    NFTDisplay,
    NFTImgContainer,
    DropDownList,
    NFTBannerFilter,
    DropDownListContainer,
    ListItem,
    DropDownHeader,
    LabelSettingsArrow,
    DropDownContainer,
    NFTBannerFooter,
    SaveButton,
    NFTImg,
};
