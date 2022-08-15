The `ContentHeader` component is used to layout the header of the components that are rendered throughout the app. This was created to handle the styling of the svg files that are used in the content header as well as the display of the files.

An example of a fully rendered `ContentHeader`

    <ContentHeader>
      <span>{''}</span>
      <span className={styles.title}>Add Liquidity</span>
      <div className={styles.settings_container}>
        <HiDotsHorizontal />
        <FiSettings />
      </div>
    </ContentHeader>
