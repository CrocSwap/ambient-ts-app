import { Dispatch, SetStateAction, useMemo } from 'react';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { IS_LOCAL_ENV } from '../../../../../constants';
import { LimitSortType } from '../../useSortedLimits';
import { FlexContainer, Text } from '../../../../../styled/Common';

interface propsIF {
    header: {
        name: string | JSX.Element;
        show: boolean;
        slug: string;
        sortable: boolean;
        alignRight?: boolean;
        alignCenter?: boolean;
    };
    sortBy: LimitSortType;
    setSortBy: Dispatch<SetStateAction<LimitSortType>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}

function OrderHeader(props: propsIF) {
    const { header, sortBy, setSortBy, reverseSort, setReverseSort } = props;
    const { name, show, slug, sortable, alignCenter, alignRight } = header;

    function handleClick(slug: LimitSortType): void {
        if (sortable) {
            if (sortBy !== slug) {
                IS_LOCAL_ENV && console.debug('first click');
                setSortBy(slug);
            } else if (!reverseSort) {
                IS_LOCAL_ENV && console.debug('second click');
                setReverseSort(true);
            } else if (sortBy === slug && reverseSort) {
                IS_LOCAL_ENV && console.debug('third click');
                setSortBy('default');
                setReverseSort(false);
            } else {
                console.error(
                    'Problem in click handler control flow. Refer to RangeCardHeader.tsx for troubleshooting. Resetting sort parameters to default as fallback action.',
                );
                setSortBy('default');
                setReverseSort(false);
            }
        }
    }

    const arrow = useMemo<JSX.Element | undefined>(() => {
        if (sortable) {
            if (sortBy === slug.toLowerCase()) {
                if (!reverseSort) {
                    return <BsSortDown />;
                } else if (reverseSort) {
                    return <BsSortUpAlt />;
                }
            }
            return undefined;
        }
    }, [sortBy, reverseSort, slug, sortable]);

    return (
        <>
            {show && (
                <FlexContainer
                    fullWidth
                    alignItems='center'
                    justifyContent={
                        alignRight
                            ? 'flex-end'
                            : alignCenter
                            ? 'center'
                            : 'flex-start'
                    }
                    style={{ cursor: sortable ? 'pointer' : 'default' }}
                    onClick={() => handleClick(slug as LimitSortType)}
                >
                    <Text
                        fontSize='mini'
                        color='text2'
                        align={
                            alignRight
                                ? 'right'
                                : alignCenter
                                ? 'center'
                                : 'left'
                        }
                    >
                        {name} {arrow}
                    </Text>
                </FlexContainer>
            )}
        </>
    );
}

export default OrderHeader;
