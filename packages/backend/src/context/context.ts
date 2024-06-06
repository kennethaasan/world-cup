import { DataSources } from '../data-sources';

interface ContextWithoutDataSources {
  test: string;
}

export interface Context extends ContextWithoutDataSources {
  dataSources: DataSources;
}

export function getContext(): ContextWithoutDataSources {
  return {
    test: 'tipping.aasan.dev',
  };
}
