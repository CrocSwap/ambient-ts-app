import { columnSlugsType } from './Transactions2';
import styles from './TxHeader.module.css';

interface propsIF {
    activeColumns: [columnSlugsType, number, string][];
}

export default function TxHeader(props: propsIF) {
    const { activeColumns } = props;

    return (
        <header className={styles.header_row}>
            {activeColumns.map((header) => {
                // const width: number = header[1];
                const readable: string = header[2];
                return (
                    <div
                        key={JSON.stringify(header)}
                        // style={{ width: width }}
                    >
                        {readable}
                    </div>
                );
            })}
        </header>
    );
}
