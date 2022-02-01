export const encode = (v) => {
  return Buffer.from(v).toString("base64");
};

export const decode = (v) => {
  return Buffer.from(v, "base64").toString("ascii");
};

