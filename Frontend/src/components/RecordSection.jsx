import RecordTable from "./RecordTable";

function RecordSection({
  selectedObject,
  records,
  fields,
  loading,
  loadingMore,
  hasMore,
  onCreate,
  onView,
  onUpdate,
  onDelete,
}) {
  return (
    <section>
      <h2>{selectedObject} Records</h2>

      {loading && (
        <p>Loading records...</p>
      )}

      {!loading && (
        <div>
          <p>
            Records loaded: {records.length}
          </p>

          <button onClick={onCreate}>
            Create New Record
          </button>

          <RecordTable
            fields={fields}
            records={records}
            onView={onView}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />

          {loadingMore && (
            <p>
              Loading more records...
            </p>
          )}

          {!hasMore && records.length > 0 && (
            <p>
              No more records.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default RecordSection;