import { columnSlugsType } from './Transactions2';
import { infoCells, actionButtons } from './data';
import styles from './TxHeader.module.css';

interface propsIF {
    activeColumns: [columnSlugsType, number, string, boolean][];
    updateSort: (s: columnSlugsType | 'default') => void;
}

export default function TxHeader(props: propsIF) {
    const { activeColumns, updateSort } = props;

    const allColumns: columnSlugsType[] = infoCells.concat(actionButtons);

    return (
        <header className={styles.header_row}>
            {
                activeColumns
                .sort((a, b) => allColumns.indexOf(a[0]) - allColumns.indexOf(b[0]))
                .map(
                    (header) => {
                        const [slug, width, readable, isSortable] = header;
                        return (
                            <div
                                key={JSON.stringify(header)}
                                style={{ width: width }}
                                onClick={() => {
                                    isSortable && updateSort(slug);
                                }}
                            >
                                {readable}
                            </div>
                        );
                    }
                )
            }
        </header>
    );
}
