import "./PageTabs.css";

const PageTabs = ({ items, activeKey, onChange }) => {
  return (
    <div
      className="page-tabs d-flex flex-nowrap align-items-center overflow-x-auto"
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={activeKey === item.key}
          className={`flex-shrink-0 ${activeKey === item.key ? "is-active" : ""}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}

          {item.count !== undefined && (
            <span>{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default PageTabs;