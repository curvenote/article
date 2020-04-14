export const THROTTLE_SKIP = 100;

export type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
};
