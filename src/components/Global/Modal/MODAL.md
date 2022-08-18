# Introduction

This directory contains code to create modals in the Ambient app and data to fill out the modal skeleton.

# Location and Files

-   This directory is located at `/src/components/global/Modal`
-   `Modal.tsx` contains:
    -   JSX for the modal skeleton
    -   code to handle optional `<header>` amd `<footer>` elements
-   `Modal.component.css` is a CSS component which holds styling for the modal skeleton.
-   `useModal.tsx` contains all the code necessary to open and close the modal.

# Developer Notes

To call a Modal anywhere in the app, you should:

1. Import the `useModal` hook and extract the values it returns
2. Import the React functional component from `Modal.tsx`
3. Import the `.ts` file housing the data for the modal you want to create
4. Create a variable `const modal` (or similar) which holds a `<Modal />` instance which passes all necessary data and functions from the `.ts` data file and the `useModal` hook.
5. Create a variable `const modalOrNull` which gets a value from a ternary:

-   evaluator: value of `isModalOpen`
-   true: return the variable holding the `<Modal />` instance
-   false: return `null`

6. Insert `modalOrNull` somewhere in the JSX return of the React function.
7. Choose a JSX element to attach the `openModal` function as an `onClick` handler.

Be aware the `Modal.tsx` component actually covers the entire viewport. The shaded area around the periphery of the modal proper is a semi-transparent DOM element meant to obscure the background and intercept clicks from the user. Clicks outside of the modal body proper will close the modal.

To achieve accessibility, the modal can always be closed with an `Escape` keypress.

Some modals will have a close icon in the header and/or a confirmation button which closes the modal. Some modals may be closed by the same click that makes a selection in the modal. The `onClose()` function can be attacted to anything so long as the proper type is declared in the prop interface.
