import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/TestTypes.css";

export default function TestTypes() {
  const [testTypes, setTestTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchTestTypes();
  }, []);

  const fetchTestTypes = async () => {
    const res = await API.get("/admin/test-types");
    setTestTypes(res.data);
  };

  const createTestType = async () => {
    if (!newTypeName.trim()) return;

    await API.post("/admin/test-types", { typeName: newTypeName });
    setNewTypeName("");
    fetchTestTypes();
  };

  const startEdit = (type) => {
    setEditingId(type._id);
    setEditingName(type.typeName);
  };

  const updateTestType = async () => {
    await API.put(`/test-types/${editingId}`, {
      typeName: editingName,
    });

    setEditingId(null);
    setEditingName("");
    fetchTestTypes();
  };

  return (
    <div className="test-type-page">
      <h2>Test Types</h2>

      {/* Add new */}
      <div className="add-test-type">
        <input
          type="text"
          placeholder="New test type name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
        />
        <button onClick={createTestType}>Add</button>
      </div>

      {/* List */}
      <div className="test-type-list">
        {testTypes.map((type) => (
          <div key={type._id} className="test-type-item">
            {editingId === type._id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={updateTestType}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{type.typeName}</span>
                <button onClick={() => startEdit(type)}>Edit</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
