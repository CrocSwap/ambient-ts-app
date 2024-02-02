import { columnMetaWithIdIF, columnSlugsType } from './Transactions2';
import { infoCells, actionButtons } from './data';
import styles from './TxHeader.module.css';

interface propsIF {
    activeColumns: columnMetaWithIdIF[];
    updateSort: (slug: columnSlugsType) => void;
    baseSymbol: string;
    quoteSymbol: string;
}

export default function TxHeader(props: propsIF) {
    const { activeColumns, updateSort, baseSymbol, quoteSymbol } = props;

    const allColumns: columnSlugsType[] = infoCells.concat(actionButtons);

    // manual overrides for column titles that are dynamic and cannot be hardcoded, will
    // ... be consumed if key-val pair exists for the column header being rendered
    const dynamicReadables: { [key: columnSlugsType]: string; } = {
        txBase: baseSymbol,
        txQuote: quoteSymbol,
    };

    return (
        <header className={styles.header_row}>
            {
                activeColumns
                .sort((a, b) => allColumns.indexOf(a.id) - allColumns.indexOf(b.id))
                .map(
                    (header) => {
                        const {id, width, readable, isSortable} = header;
                        return (
                            <div
                                key={JSON.stringify(header)}
                                style={{ width: width }}
                                onClick={() => {
                                    isSortable && updateSort(id);
                                }}
                            >
                                {dynamicReadables[id] ?? readable}
                            </div>
                        );
                    }
                )
            }
        </header>
    );
}
