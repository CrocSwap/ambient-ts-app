import { columnSlugsType } from './Transactions2';
import { infoCells, actionButtons } from './data';
import styles from './TxHeader.module.css';

interface propsIF {
    activeColumns: [columnSlugsType, number, string][];
}

export default function TxHeader(props: propsIF) {
    const { activeColumns } = props;

    const allColumns: columnSlugsType[] = infoCells.concat(actionButtons);

    return (
        <header className={styles.header_row}>
            {
                activeColumns
                .filter((col) => col[2].length)
                .sort((a, b) => allColumns.indexOf(a[0]) - allColumns.indexOf(b[0]))
                .map(
                    (header) => {
                        const width: number = header[1];
                        const readable: string = header[2];
                        return (
                            <div
                                key={JSON.stringify(header)}
                                style={{ width: width }}
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
