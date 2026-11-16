import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Plus, X } from "react-bootstrap-icons";
import "./TagInput.css";

const TagInput = ({ label, description, placeholder, items = [], onChange, id }) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const newValue = value.trim();
    if (!newValue) return;

    const alreadyExists = items.some(
      (item) => item.toLowerCase() === newValue.toLowerCase(),
    );

    if (!alreadyExists) onChange([...items, newValue]);
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
        <p className="small text-body-secondary mb-3">{description}</p>
      )}

      <div className="d-flex gap-2">
        <Form.Control
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-3 py-2 px-3"
        />

        <Button
          type="button"
          className="tag-input-add d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
          onClick={handleAdd}
          disabled={!value.trim()}
          aria-label="Aggiungi"
        >
          <Plus />
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="tag-input-chip d-inline-flex align-items-center gap-2 rounded-pill py-2 ps-3 pe-2 small fw-medium"
            >
              {item}
              <button
                type="button"
                className="border-0 bg-transparent p-0 d-flex"
                onClick={() => handleRemove(index)}
                aria-label={`Rimuovi ${item}`}
              >
                <X />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="small text-body-secondary mt-3 mb-0">
          Nessuna informazione aggiunta.
        </p>
      )}
    </div>
  );
};

export default TagInput;