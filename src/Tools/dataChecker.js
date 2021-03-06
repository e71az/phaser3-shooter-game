const dataTypeChecker = (data, debug = false) => {
  const { log } = console;
  let result = '';
  const typeString = Object.prototype.toString.call(data);
  result = typeString.replace(/\[object /gi, '').replace(/\]/gi, '');
  if (!debug) {
    log('true type', result);
  }
  return result;
};

export default dataTypeChecker;
