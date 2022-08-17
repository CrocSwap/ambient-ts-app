# Introduction

This directory houses all component-level React functional components for the Ambient UI.

# About

In normal React architecture, JSX files are generally written as pages or components to achieve separation of concerns and to make JSX elements reusable. While there is no functional difference between a React function coding for a page vs a component, "pages" are generally top-level files which import one or more components.

Each sub-directory in this directory contains the `.tsx` file encoding a React functional component file which maps to a single URL pathway (either absolute or defined with parameters). Most sub-directories will map to a single sub-directory in `/src/pages` and contain all the JSX component files used in that pathway. The components in each may be assumed to exist exclusively in JSX page file in the `/src/pages` sub-directory of the matching name. Some sub-directories however will contain JSX component files which are used in multiple directories and will be in a `/src/components/misc` sub-directory.

# Location and Files

-   This file `COMPONENTS.md` is located in the directory `/src/components`
-   The `/Home` sub-directory contains all files necessary to render components exclusive to the `Home.tsx` page file
-   The `/Trade` sub-directory contains all files necessary to render components exclusive to the `Trade.tsx` page file
-   The `/Analytics` sub-directory contains all files necessary to render components exclusive to the `Analytics.tsx` page file
-   The `/Portfolio` sub-directory contains all files necessary to render components exclusive to the `Portfolio.tsx` page file
-   The `/Global` sub-directory contains all files necessary to render components in multiple files throughout the app.
