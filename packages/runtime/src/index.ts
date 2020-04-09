import * as store from './store';
import * as utils from './utils';

import InkVarSpec from './store/variables/varSpec';
import provider, { setup } from './provider';

export * from './store';
export {
  utils, InkVarSpec, provider, setup,
};
export * from './constants';

const inkStore = {
  ...store,
  utils,
  InkVarSpec,
  provider,
  setup,
};

export default inkStore;
