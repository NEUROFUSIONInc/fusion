import { Sandpack } from "@codesandbox/sandpack-react";

export const ExperimentEditor: React.FC = () => {
  const files = {};

  return (
    <div className="experiment-editor">
      <h2>Experiment Editor</h2>
      <Sandpack files={files} theme="light" template="static" />
    </div>
  );
};
