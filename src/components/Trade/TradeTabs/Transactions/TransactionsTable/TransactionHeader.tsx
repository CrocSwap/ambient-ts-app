import React, { Dispatch, memo, SetStateAction, useMemo } from 'react';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { IS_LOCAL_ENV } from '../../../../../ambient-utils/constants';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { TxSortType } from '../../useSortedTxs';

interface TransactionHeaderPropsIF {
    header: {
        name: string | React.ReactNode;
        show: boolean;
        slug: string;
        sortable: boolean;
        alignRight?: boolean;
        alignCenter?: boolean;
    };

    sortBy: TxSortType;
    setSortBy: Dispatch<SetStateAction<TxSortType>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}
function TransactionHeader(props: TransactionHeaderPropsIF) {
    const { header, sortBy, setSortBy, reverseSort, setReverseSort } = props;
    const { name, show, slug, sortable, alignRight, alignCenter } = header;

    function handleClick(slug: TxSortType) {
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

    const arrow = useMemo(() => {
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
                    style={{
                        cursor: sortable ? 'pointer' : 'default',
                        paddingRight: alignRight ? '10px' : '0',
                    }}
                    onClick={() => handleClick(slug as TxSortType)}
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
                        style={{ textTransform: 'none' }}
                    >
                        {name} {arrow}
                    </Text>
                </FlexContainer>
            )}
        </>
    );
}

export default memo(TransactionHeader);
