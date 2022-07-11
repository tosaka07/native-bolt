export const encode = (value: any): string => {
  const jsonString = JSON.stringify(value);
  return Buffer.from(jsonString).toString('base64');
};

export const decode = (value: string): any => {
  const decodedData = Buffer.from(value, 'base64').toString();
  return JSON.parse(decodedData);
};
