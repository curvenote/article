import {
  ComponentsState,
  ComponentActionTypes,
  DefineComponentProperty, ComponentSpec, ComponentProperty,
  DEFINE_COMPONENT_SPEC, DEFINE_COMPONENT, REMOVE_COMPONENT,
} from './types';
import { RETURN_RESULTS } from '../comms/types';
import { Dictionary, forEachObject } from '../../utils';
import { includeCurrentValue, testScopeAndName, unpackCurrent } from '../variables/utils';

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
    case REMOVE_COMPONENT: {
      const { id } = action.payload;
      const newState = {
        ...state,
        components: { ...state.components },
      };
      delete newState.components[id];
      return newState;
    }
    case RETURN_RESULTS: {
      const newState = {
        ...state,
        components: {
          ...state.components,
        },
      };
      Object.entries(action.payload.results.components).forEach(([id, properties]) => {
        if (newState.components[id] == null) return;
        Object.entries(properties).forEach(([propName, value]) => {
          if (newState.components[id].properties[propName] == null) return;
          newState.components[id] = {
            ...newState.components[id],
            properties: {
              ...newState.components[id].properties,
              [propName]: unpackCurrent(newState.components[id].properties[propName], value),
            },
          };
        });
      });
      return newState;
    }
    default:
      return state;
  }
};

export default componentsReducer;
