const createAppSlice = (set: any, get: any) => ({
  searchValue: "",
  isLayoutDisabled: false,
  actualClient: false,
  contentScrollParentRef: undefined,
  scanShipmentResult: undefined,
  subPageTab: null,
});

export default createAppSlice;
