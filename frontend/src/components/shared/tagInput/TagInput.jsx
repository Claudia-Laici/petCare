import { useState } from "react";
import { Form } from "react-bootstrap";
import { Plus, X } from "react-bootstrap-icons";
import "./TagInput.css";

const TagInput = ({
  label,
  description,
  placeholder,
  items = [],
  onChange,
  id,
}) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const newValue = value.trim();

    if (!newValue) return;

    const alreadyExists = items.some(
      (item) => item.toLowerCase() === newValue.toLowerCase(),
    );

    if (alreadyExists) {
      setValue("");
      return;
    }

    onChange([...items, newValue]);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="tag-input">
      <Form.Label className="fw-semibold">{label}</Form.Label>

      {description && (
        <p className="tag-input-description">{description}</p>
      )}

      <div className="d-flex gap-2">
        <Form.Control
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="tag-input-field"
        />

        <button
          type="button"
          className="tag-input-add"
          onClick={handleAdd}
          disabled={!value.trim()}
          aria-label="Aggiungi"
        >
          <Plus />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="tag-input-list mt-3">
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="tag-input-chip">
              {item}

              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Rimuovi ${item}`}
              >
                <X />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="tag-input-empty mt-3 mb-0">
          Nessuna informazione aggiunta.
        </p>
      )}
    </div>
  );
};

export default TagInput;