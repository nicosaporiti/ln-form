export const encode = (v) => {
  return Buffer.from(v).toString("base64");
};

export const decode = (v) => {
  return Buffer.from(v, "base64").toString("ascii");
};

export const getQueryParams = (v) => {
  const getSearch = v;
  const search = getSearch === "" ? "" : getSearch.split("?");
  const decodeSearch = !search ? "" : "?" + decode(search[1]);
  const queryParams = new URLSearchParams(decodeSearch);

  return queryParams;
};
