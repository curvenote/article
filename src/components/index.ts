import { registerComponent } from '@iooxa/components';
import Equation from './equation';
import Code from './code';
import Demo from './demo';
import Outline from './outline';
import Card from './card';

export const register = () => {
  registerComponent('r-card', Card);
  registerComponent('r-outline', Outline);
  registerComponent('r-equation', Equation);
  registerComponent('r-code', Code);
  registerComponent('r-demo', Demo);
};

export default {
  Card,
  Outline,
  Equation,
  Code,
  Demo,
};
