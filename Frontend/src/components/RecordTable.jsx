import "../styles/table.css";

function RecordTable({
  fields,
  records,
  onView,
  onUpdate,
  onDelete,
}) {
  if (records.length === 0) {
    return (
      <div className="empty-table">
        <p>No records found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="records-table">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field}>
                {field}
              </th>
            ))}

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.Id}>
              {fields.map((field) => (
                <td key={field}>
                  {record[field] ?? "-"}
                </td>
              ))}

              <td>
                <div className="action-buttons">
                  <button
                    className="view-button"
                    onClick={() => onView(record.Id)}
                  >
                    View
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => onUpdate(record)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => onDelete(record.Id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecordTable;