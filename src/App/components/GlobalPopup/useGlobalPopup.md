`useGlobalPopup` is a custom React Hook that allows for the creation of a global popup. It takes in one optional parameter initialMode which defaults to false.

The hook returns an array of values and functions that can be destructured and used in a component.

The returned values include:

`isGlobalPopupOpen`: a boolean that represents whether the global popup is open or closed.

`openGlobalPopup`: a function that takes in three optional parameters: content, popupTitle, and popupPlacement.

-   It sets `isGlobalPopupOpen` to true and sets the value of popupContent to the passed in content. It also sets the value of popupTitle and popupPlacement if those parameters are passed in.

`closeGlobalPopup`: a function that sets `isGlobalPopupOpen` to false and resets the values of popupContent, popupTitle, and popupPlacement to their default values.

`popupContent`: the content that is displayed inside the global popup when it is open.

`popupTitle`: the title that is displayed inside the global popup when it is open.

`popupPlacement`: a string that represents the placement of the global popup.

<!-- This hook works with GlobalPopup.tsx, which is being rendered in App.tsx -->

Example Usage:
import{ useGlobalPopup } from './useGlobalPopup';

    function MyComponent() {
        const [
        isGlobalPopupOpen,
        openGlobalPopup,
        closeGlobalPopup,
        popupContent,
        popupTitle,
        popupPlacement,
    ] = useGlobalPopup();

    return (
        <>
            <button onClick={() =>  openGlobalPopup("This is content!", "This is title", "left" )}>Open Popup</button>
            <button onClick={closeGlobalPopup}>Close Popup</button>

        </>
    )

}
