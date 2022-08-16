The `ContentContainer` component is the component that is used throughout the app to hold the contents. In simplest terms, it is the "box" that holds the main contents such as `swap`, `trade`, `liquidity`, etc.. This was created so the styling for all containers on the ambient UI can be indistinguishable from each other, as well as handle responsiveness without rewriting css code.

The `ContentContainer` component can accept two props or no props at all.

-   Without Props : Without props, the component renders a regular container component. (See swap for example).
-   With `customWidth` prop: If you add a `customWidth` prop to the component, it renders a slightly larger version of the original component. (See shareable card for example).
-   With `customWidthAuto` prop: With this prop, there are no fixed or min sizes for the components. It grows to take the size of the content that it renders.

An example of a fully rendered `ContentContainer`

     <ContentContainer customWidth>
      {closeButton}
      <TokenInfo
        posDetail={posDetail}
        range={range}
        TempAPY={TempAPY}
        shareable
      />
      <Divider />
      <GraphData posDetail={posDetail} />
      {socialMediaLinks}
    </ContentContainer>
