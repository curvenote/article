// TODO: this should be imporved e.g. arrays

const serialize = (derived: any) => {
  if (typeof derived === 'number' && !Number.isFinite(derived)) {
    return derived;
  }
  return JSON.parse(JSON.stringify(derived));
};

export default serialize;
