import "../styles/modal.css";

function ViewRecordModal({ record, onClose }) {
  if (!record) return null;

  return (
    <div className="modal-overlay">
      <div className="view-modal">
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">RECORD DETAILS</span>
            <h2>View Record</h2>
            <p>Salesforce record information</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-divider"></div>

        <div className="record-details">
          {Object.entries(record).map(([key, value]) => {
            if (key === "attributes") return null;

            let displayValue;

            if (value === null || value === undefined) {
              displayValue = "-";
            } else if (typeof value === "object") {
              displayValue = JSON.stringify(value, null, 2);
            } else {
              displayValue = String(value);
            }

            return (
              <div className="record-detail-card" key={key}>
                <span className="record-detail-label">
                  {key}
                </span>

                <span className="record-detail-value">
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewRecordModal;