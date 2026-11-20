import "./PageStats.css";

const PageStats = ({ stats }) => {
  return (
    <div className="page-stats">
      {stats.map((stat) => (
        <div className="page-stat" key={stat.id}>
          <div className="icon-dashboard page-stat-icon">{stat.icon}</div>

          <div className="page-stat-text">
            <span className="page-stat-value">
              {stat.loading ? "—" : stat.value}
            </span>
            <span className="page-stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageStats;