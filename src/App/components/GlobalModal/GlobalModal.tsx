import SimpleModal from '../../../components/Global/SimpleModal/SimpleModal';

interface GlobalModalProps {
    isGlobalModalOpen: boolean;
    openGlobalModal: (page: string) => void;
    closeGlobalModal: () => void;
    currentContent: React.ReactNode;

    title?: string;
}

export default function GlobalModal(props: GlobalModalProps) {
    const modalOrNull = props.isGlobalModalOpen ? (
        <SimpleModal onClose={props.closeGlobalModal} title={props.title}>
            {props.currentContent}
        </SimpleModal>
    ) : null;

    return <>{modalOrNull}</>;
}
