export interface Context {
  test: string;
}

export function getContext(): Context {
  return {
    test: 'tipping.aasan.dev',
  };
}
