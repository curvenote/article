import * as store from './store';
import * as utils from './utils';

import InkVarSpec from './store/variables/varSpec';

export * from './store';
export { utils, InkVarSpec };
export * from './constants';

const inkStore = {
  ...store,
  utils,
  InkVarSpec,
};

export default inkStore;
