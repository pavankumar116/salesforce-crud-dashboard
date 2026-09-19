function ObjectSelector({
  objects,
  selectedObject,
  onObjectChange,
}) {
  return (
    <div>
      <label htmlFor="object-select">
        Select Object:
      </label>

      <select
        id="object-select"
        value={selectedObject}
        onChange={(event) =>
          onObjectChange(event.target.value)
        }
      >
        {objects.map((object) => (
          <option
            key={object}
            value={object}
          >
            {object}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ObjectSelector;