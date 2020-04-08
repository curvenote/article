import { DEFAULT_FORMAT } from '../../constants';
import { PropTypes } from '../types';
import { getComponentSpecFromDefinition } from '../components/utils';

const valueOnly = { value: true, func: false };

const VarSpec = getComponentSpecFromDefinition({
  name: 'var',
  description: 'Ink variable declaration',
  properties: {
    name: { type: PropTypes.string, default: '', has: valueOnly },
    value: { type: PropTypes.number, default: 0 },
    format: { type: PropTypes.string, default: DEFAULT_FORMAT, has: valueOnly },
    description: { type: PropTypes.string, default: '', has: valueOnly },
    type: { type: PropTypes.string, default: PropTypes.number, has: valueOnly },
  },
  events: {},
});

export default VarSpec;
