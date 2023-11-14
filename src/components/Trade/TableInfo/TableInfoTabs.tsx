import { GridContainer } from '../../../styled/Common';
import TabComponent from '../../Global/TabComponent/TabComponent';
import { StyledTabContainer } from './TableInfo.styles';
interface TabContainerProps {
    label: string;
    data: string;
}

interface DetailedData {
    TXS: string;
    Buys: string;
    Sells: string;
    Volume: string;
}
export default function TableInfoTabs() {
    const TabContainer = (props: TabContainerProps) => {
        const { label, data } = props;
        return (
            <StyledTabContainer>
                <p>{label}</p>
                <p>{data}</p>
            </StyledTabContainer>
        );
    };

    const detailedData: Record<string, DetailedData> = {
        '5m': {
            TXS: 'TXS for 5m',
            Buys: 'Buys for 5m',
            Sells: 'Sells for 5m',
            Volume: 'Volume for 5m',
        },
        '1h': {
            TXS: 'TXS for 1h',
            Buys: 'Buys for 1h',
            Sells: 'Sells for 1h',
            Volume: 'Volume for 1h',
        },
        '4h': {
            TXS: 'TXS for 4h',
            Buys: 'Buys for 4h',
            Sells: 'Sells for 4h',
            Volume: 'Volume for 4h',
        },
        '24h': {
            TXS: 'TXS for 24h',
            Buys: 'Buys for 24h',
            Sells: 'Sells for 24h',
            Volume: 'Volume for 24h',
        },
    };
    function getDetailedData(time: string): DetailedData | undefined {
        return detailedData[time];
    }
    const lengthOfDetailedData = Object.keys(detailedData).length;

    function tabDataDisplay(time: string): JSX.Element {
        const dataForTime = getDetailedData(time);
        const content = dataForTime ? (
            <GridContainer numCols={lengthOfDetailedData} gap={0}>
                {Object.entries(dataForTime).map(([key, value]) => (
                    <TabContainer label={key} data={value} key={key} />
                ))}
            </GridContainer>
        ) : (
            <></>
        );

        return content;
    }

    const tabData = [
        {
            label: '5m',
            content: tabDataDisplay('5m'),
            showRightSideOption: false,
        },
        {
            label: '1h',
            content: tabDataDisplay('1h'),
            showRightSideOption: false,
        },
        {
            label: '4h',
            content: tabDataDisplay('4h'),
            showRightSideOption: false,
        },
        {
            label: '24h',
            content: tabDataDisplay('24h'),
            showRightSideOption: false,
        },
    ];

    return (
        <TabComponent
            data={tabData}
            rightTabOptions={false}
            isModalView
            transparent
        />
    );
}
