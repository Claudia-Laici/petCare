import { Search } from "react-bootstrap-icons";
import "./SearchInput.css";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Cerca...",
  className = "",
}) => {
  return (
    <div className={`page-search ${className}`}>
      <Search className="page-search-icon" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchInput;