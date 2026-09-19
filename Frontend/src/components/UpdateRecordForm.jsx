import { useState } from "react";
import "../styles/modal.css";

function UpdateRecordForm({
  record,
  fields,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => {
    const initialData = {};

    fields.forEach((field) => {
      initialData[field] = record[field] ?? "";
    });

    return initialData;
  });

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
      <div className="edit-modal">
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">EDIT RECORD</span>

            <h2>
              Edit {record.Name || "Record"}
            </h2>

            <p>
              Update the Salesforce record details.
            </p>
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
                className="form-field"
                key={field}
              >
                <label>
                  {field}
                </label>

                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={(event) =>
                    handleChange(
                      field,
                      event.target.value
                    )
                  }
                />
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
              className="update-button"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateRecordForm;