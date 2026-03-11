const maps = import.meta.glob("../../assets/maps/*.svg", {
  query: "?react",
  import: "default",
  eager: true
});

export default maps;