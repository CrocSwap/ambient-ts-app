import { columnMetaWithIdIF, columnSlugsType } from './Transactions2';
import { infoCells, actionButtons } from './data';
import styles from './TxHeader.module.css';

interface propsIF {
    activeColumns: columnMetaWithIdIF[];
    updateSort: (slug: columnSlugsType) => void;
    overrides: { [key: columnSlugsType]: string; };
}

export default function TxHeader(props: propsIF) {
    const { activeColumns, updateSort, overrides } = props;

    const allColumns: columnSlugsType[] = infoCells.concat(actionButtons);

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
                                {overrides[id] ?? readable}
                            </div>
                        );
                    }
                )
            }
        </header>
    );
}
