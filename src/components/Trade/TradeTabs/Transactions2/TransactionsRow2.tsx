import styles from './TransactionsRow2.module.css';
import { dataIF } from './Transactions2';

interface propsIF {
    idx: number;
    data: dataIF;
    tableWidth: number;
}

export default function TransactionsRow2(props: propsIF) {
    const { idx, data, tableWidth } = props;

    const dataTuples: [string, string][] = Object.entries(data);
    console.log(dataTuples);

    // const elements: JSX.Element[] = dataTuples.map(
    //     (dT: [string, string]) => (
    //         <div key={dT.join()}>
    //             {dT[1]}
    //         </div>
    //     )
    // );

    const idForDOM = `tx_row_${idx}`;

    const width = document.getElementById(idForDOM)?.offsetWidth;

    const elementsForDOM: JSX.Element[] = [];

    let dataIndex = 0;
    do {
        if (width && width < tableWidth) {
            const d: [string, string] = dataTuples[dataIndex];
            console.log(d);
            elementsForDOM.push(<div key={d.join()}>{d[1]}</div>);
            dataIndex++;
        } else break;
    } while (dataIndex < dataTuples.length);

    console.log(elementsForDOM);

    return (
        <li id={idForDOM} className={styles.line_item}>
            {elementsForDOM}
        </li>
    );
}
