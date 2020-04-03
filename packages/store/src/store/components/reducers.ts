import {
  ComponentsState,
  ComponentActionTypes,
  DefineComponentProperty, ComponentSpec, ComponentProperty,
  DEFINE_COMPONENT_SPEC, DEFINE_COMPONENT,
} from './types';
import { Dictionary, forEachObject } from '../../utils';
import { includeCurrentValue, testScopeAndName } from '../variables/utils';

const initialState: ComponentsState = {
  specs: {},
  components: {},
};

const includeCurrentValueInProps = (
  props: Dictionary<DefineComponentProperty>,
  spec: ComponentSpec,
): Dictionary<ComponentProperty> => (
  forEachObject(spec.properties, ([propName, propSpec]) => {
    const prop = {
      ...props[propName],
    };
    return [
      propName,
      { ...includeCurrentValue(prop, propSpec.type) },
    ];
  })
);


const componentsReducer = (
  state: ComponentsState = initialState,
  action: ComponentActionTypes,
): ComponentsState => {
  switch (action.type) {
    case DEFINE_COMPONENT_SPEC: {
      const componentSpec = action.payload;
      return {
        ...state,
        specs: {
          ...state?.specs,
          [componentSpec.name]: { ...componentSpec },
        },
      };
    }
    case DEFINE_COMPONENT: {
      const newComponent = action.payload;
      const { scope, name } = newComponent;
      if (!testScopeAndName(scope, name)) throw new Error('Scope or name has bad characters');
      const spec = state.specs[newComponent.spec];
      const component = {
        ...newComponent,
        properties: includeCurrentValueInProps(newComponent.properties, spec),
      };
      return {
        ...state,
        components: {
          ...state?.components,
          [component.id]: component,
        },
      };
    }
    default:
      return state;
  }
};

export default componentsReducer;
