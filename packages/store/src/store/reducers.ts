import { combineReducers } from 'redux';
import variables from './variables/reducers';
import components from './components/reducers';

export default combineReducers({
  variables,
  components,
});
