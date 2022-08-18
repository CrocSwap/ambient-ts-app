# Introduction

This directory contains code to create modals in the Ambient app and data to fill out the relative modal skeleton.

This is a very similar component to the regular modal, except it is relative to where it is called and not the entire page.

# Location and Files

-   This directory is located at `/src/components/global/RelativeModal`
-   `RelativeModal.tsx` contains:
    -   JSX for the RelativeModal skeleton
    -   code to handle optional `<header>` amd `<footer>` elements
-   `RelativeModal.component.css` is a CSS component which holds styling for the relative modal skeleton.
-   `useRelativeModal.tsx` contains all the code necessary to open and close the modal.

# Developer Notes

To call a Modal anywhere in the app, you should:

1. Import the `useRelativeModal` hook and extract the values it returns
2. Import the React functional component from `RelativeModal.tsx`
3. Import the `.ts` file housing the data for the modal you want to create
4. Create a variable `const modal` (or similar) which holds a `<RelativeModal />` instance which passes all necessary data and functions from the `.ts` data file and the `useRelativeModal` hook.
5. Create a variable `const relativeModalOrNull` which gets a value from a ternary:

-   evaluator: value of `isRelativeModalOpen`
-   true: return the variable holding the `<RelativeModal />` instance
-   false: return `null`

6. Insert `modalOrNull` somewhere in the JSX return of the React function.
7. Choose a JSX element to attach the `openRelativeModal` function as an `onClick` handler.

To achieve accessibility, the modal can always be closed with an `Escape` keypress.

Some modals will have a close icon in the header and/or a confirmation button which closes the modal. Some modals may be closed by the same click that makes a selection in the modal. The `onClose()` function can be attacted to anything so long as the proper type is declared in the prop interface.
