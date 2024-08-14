export const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <svg width="50" height="50" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="45" stroke="gray" strokeWidth="15" fill="none" />
      <circle
        cx="60"
        cy="60"
        r="45"
        stroke="blue"
        strokeWidth="15"
        fill="none"
        strokeDasharray="282.7"
        strokeDashoffset={((100 - percentage) / 100) * 2 * Math.PI * 45}
        className="progress"
      />
      <text x="60" y="70" textAnchor="middle" fill="white" fontSize="30px">{`${Math.floor(percentage)}%`}</text>
      <style jsx>{`
        .progress {
          transition: stroke-dashoffset 0.02s linear;
        }
      `}</style>
    </svg>
  );
};
