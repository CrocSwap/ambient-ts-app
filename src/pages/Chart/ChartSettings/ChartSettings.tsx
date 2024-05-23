import { useRef } from 'react';
import {
    ChartSettingsContainer,
    CheckListContainer,
    CloseButton,
    ColorPickerContainer,
    ContextMenu,
    ContextMenuFooter,
    ContextMenuHeader,
    ContextMenuHeaderText,
    SelectionContainer,
} from './ChartSettingsCss';
import { VscClose } from 'react-icons/vsc';

interface ContextMenuIF {
    contextMenuPlacement: { top: number; left: number };
    setContextmenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChartSettings(props: ContextMenuIF) {
    const { contextMenuPlacement, setContextmenu } = props;

    const contextMenuRef = useRef<HTMLInputElement | null>(null);

    return (
        <ChartSettingsContainer
            ref={contextMenuRef}
            top={contextMenuPlacement.top}
            left={contextMenuPlacement.left}
        >
            <ContextMenu>
                <ContextMenuHeader>
                    <ContextMenuHeaderText>
                        Chart Settings
                    </ContextMenuHeaderText>
                    <CloseButton onClick={() => setContextmenu(false)}>
                        <VscClose size={24} />
                    </CloseButton>
                </ContextMenuHeader>

                <CheckListContainer></CheckListContainer>

                <SelectionContainer></SelectionContainer>

                <ColorPickerContainer></ColorPickerContainer>

                <ContextMenuFooter></ContextMenuFooter>
            </ContextMenu>
        </ChartSettingsContainer>
    );
}
