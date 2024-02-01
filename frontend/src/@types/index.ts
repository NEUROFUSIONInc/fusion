export interface MetaSeo {
  title: string;
  description: string;
  image: string;
  keywords: string[];
  author: {
    name: string;
  };
  social: Record<string, string>;
}

export interface IExperiment {
  id: number;
  name: string;
  description: string;
  image?: string;
  url?: string;
  tags?: string[];
  duration?: number;
}

export interface EventData {
  startTimestamp: number;
  duration: number;
  data: string;
}

export interface PowerByBand {
  data: {
    gamma: number[];
    beta: number[];
    alpha: number[];
    theta: number[];
    delta: number[];
  };
}

interface DeviceInfo {
  name: string;
  samplingRate: number;
  channels: string[];
  manufacturer?: string;
}

export interface DatasetExport {
  fileNames: string[];
  dataSets: Array<any>;
}
