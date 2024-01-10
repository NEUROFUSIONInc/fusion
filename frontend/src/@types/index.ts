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
