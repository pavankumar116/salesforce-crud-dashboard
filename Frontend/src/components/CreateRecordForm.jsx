import { useState } from "react";
import "../styles/modal.css";

function CreateRecordForm({
  objectName,
  fields,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="create-modal">
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">NEW RECORD</span>
            <h2>Create {objectName}</h2>
            <p>Add a new {objectName.toLowerCase()} to Salesforce.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="modal-divider"></div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {fields.map((field) => (
              <div
                key={field.name}
                className="form-field"
              >
                <label>
                  {field.label}
                  {field.required && (
                    <span className="required-mark"> *</span>
                  )}
                </label>

                {field.type === "picklist" ? (
                  <select
                    value={formData[field.name] || ""}
                    onChange={(event) =>
                      handleChange(
                        field.name,
                        event.target.value
                      )
                    }
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>

                    {field.picklistValues.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={formData[field.name] || ""}
                    onChange={(event) =>
                      handleChange(
                        field.name,
                        event.target.value
                      )
                    }
                    required={field.required}
                    rows="4"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ""}
                    onChange={(event) =>
                      handleChange(
                        field.name,
                        event.target.value
                      )
                    }
                    required={field.required}
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-button"
            >
              Create {objectName}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecordForm;