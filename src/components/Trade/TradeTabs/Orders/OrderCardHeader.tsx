import styles from './OrderCardHeader.module.css';

interface OrderCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    };
}

export default function OrderCardHeader(props: OrderCardHeaderPropsIF) {
    const { data } = props;

    return (
        <div>
            <h5>{data.name}</h5>
        </div>
    );
}
