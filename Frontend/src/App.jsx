import { useEffect, useState } from "react";

import Welcome from "./components/Welcome";
import Header from "./components/Header";
import ObjectSelector from "./components/ObjectSelector";
import RecordSection from "./components/RecordSection";
import ViewRecordModal from "./components/ViewRecordModal";
import CreateRecordForm from "./components/CreateRecordForm";
import UpdateRecordForm from "./components/UpdateRecordForm";

import {
  checkAuthStatus,
  loginWithSalesforce,
} from "./services/authService";

import {
  getRecords,
  getCreateMetadata,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} from "./services/salesforceService";

import "./styles/dashboard.css";

function App() {
  // --------------------------------
  // Authentication
  // --------------------------------

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] =
    useState(true);

  // --------------------------------
  // Salesforce object
  // --------------------------------

  const [selectedObject, setSelectedObject] =
    useState("Account");

  const objects = [
    "Account",
    "Opportunity",
    "Lead",
    "Contact",
    "Case",
  ];

  // --------------------------------
  // Records
  // --------------------------------

  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState([]);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [loadingMore, setLoadingMore] =
    useState(false);

  // --------------------------------
  // Selected / editing / creating
  // --------------------------------

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [editingRecord, setEditingRecord] =
    useState(null);

  const [creatingRecord, setCreatingRecord] =
    useState(false);

  const [createMetadata, setCreateMetadata] =
    useState([]);

  // --------------------------------
  // Error
  // --------------------------------

  const [error, setError] = useState("");

  // --------------------------------
  // Authentication check
  // --------------------------------

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const data = await checkAuthStatus();

        setLoggedIn(data.loggedIn);
      } catch (error) {
        setLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  // --------------------------------
  // Fetch records when object changes
  // --------------------------------

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    fetchRecords();
  }, [selectedObject, loggedIn]);

  // --------------------------------
  // Infinite scroll
  // --------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight +
        window.scrollY;

      const pageHeight =
        document.documentElement
          .scrollHeight;

      if (
        scrollPosition >=
          pageHeight - 200 &&
        hasMore &&
        !loadingMore
      ) {
        loadMoreRecords();
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    offset,
    hasMore,
    loadingMore,
    selectedObject,
  ]);

  // --------------------------------
  // Fetch records
  // --------------------------------

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRecords(
        selectedObject,
        0
      );

      setFields(data.fields);
      setRecords(data.records);

      setOffset(0);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(
        "Fetch error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to fetch Salesforce records"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Load more records
  // --------------------------------

  const loadMoreRecords = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextOffset = offset + 20;

      const data = await getRecords(
        selectedObject,
        nextOffset
      );

      setRecords(
        (previousRecords) => [
          ...previousRecords,
          ...data.records,
        ]
      );

      setOffset(nextOffset);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(
        "Load more error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to load more records"
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // --------------------------------
  // Create metadata
  // --------------------------------

  const fetchCreateMetadata = async () => {
    try {
      setError("");

      const data =
        await getCreateMetadata(
          selectedObject
        );

      setCreateMetadata(data.fields);
      setCreatingRecord(true);
    } catch (error) {
      console.error(
        "Metadata error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to fetch create metadata"
      );
    }
  };

  // --------------------------------
  // View record
  // --------------------------------

  const handleView = async (id) => {
    try {
      setError("");

      const data = await getRecord(
        selectedObject,
        id
      );

      setSelectedRecord(data);
    } catch (error) {
      console.error(
        "View error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to fetch Salesforce record"
      );
    }
  };

  // --------------------------------
  // Update
  // --------------------------------

  const handleUpdate = (record) => {
    setEditingRecord(record);
  };

  const handleSaveUpdate = async (
    updatedData
  ) => {
    try {
      const readOnlyFields = [
        "Id",
        "IsDeleted",
        "MasterRecordId",
        "CreatedDate",
        "CreatedById",
        "LastModifiedDate",
        "LastModifiedById",
        "SystemModstamp",
      ];

      const dataToUpdate = {};

      Object.entries(updatedData).forEach(
        ([field, value]) => {
          if (
            !readOnlyFields.includes(field)
          ) {
            dataToUpdate[field] = value;
          }
        }
      );

      await updateRecord(
        selectedObject,
        editingRecord.Id,
        dataToUpdate
      );

      alert(
        "Record updated successfully!"
      );

      setEditingRecord(null);

      await fetchRecords();
    } catch (error) {
      console.error(
        "Update error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to update Salesforce record"
      );
    }
  };
  //
  const handleCreateButton = async () => {
    await fetchCreateMetadata();
      setCreatingRecord(true);
      };
  // --------------------------------
  // Create
  // --------------------------------

  const handleCreate = async (data) => {
    try {
      setError("");

      await createRecord(
        selectedObject,
        data
      );

      alert(
        "Record created successfully!"
      );

      setCreatingRecord(false);

      await fetchRecords();
    } catch (error) {
      console.error(
        "Create error:",
        error
      );

      setError(
        error.response?.data?.details ||
          error.response?.data?.error ||
          "Failed to create Salesforce record"
      );
    }
  };

  // --------------------------------
  // Delete
  // --------------------------------

  const handleDelete = async (id) => {
    try {
      await deleteRecord(
        selectedObject,
        id
      );

      alert(
        "Record deleted successfully!"
      );

      await fetchRecords();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setError(
        error.response?.data?.error ||
          "Failed to delete Salesforce record"
      );
    }
  };

  // --------------------------------
  // Object change
  // --------------------------------

  const handleObjectChange = (
    objectName
  ) => {
    setSelectedObject(objectName);

    setSelectedRecord(null);
    setEditingRecord(null);
    setCreatingRecord(false);

    setOffset(0);
    setHasMore(true);
    setRecords([]);
    setFields([]);
  };

  // --------------------------------
  // Close view modal
  // --------------------------------

  const closeModal = () => {
    setSelectedRecord(null);
  };

  // --------------------------------
  // Authentication UI
  // --------------------------------

  if (checkingAuth) {
    return (
      <p>
        Checking authentication...
      </p>
    );
  }

  if (!loggedIn) {
    return (
      <Welcome
        onLogin={loginWithSalesforce}
      />
    );
  }

  // --------------------------------
  // Main dashboard
  // --------------------------------

  return (
    <>
      <Header />
      <main className="dashboard">

      <div className="dashboard-title">
        <h2>Dashboard</h2>
        <p>
          View and manage your Salesforce records.
        </p>
      </div>

      <ObjectSelector
        objects={objects}
        selectedObject={selectedObject}
        onObjectChange={
          handleObjectChange
        }
      />

      {error && (
        <p>{error}</p>
      )}

      <RecordSection
        selectedObject={selectedObject}
        records={records}
        fields={fields}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        
        onView={handleView}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreate={handleCreateButton}
      />

      <ViewRecordModal
        record={selectedRecord}
        onClose={closeModal}
      />

      {creatingRecord && (
        <CreateRecordForm
          objectName={selectedObject}
          fields={createMetadata}
          onSave={handleCreate}
          onCancel={() =>
            setCreatingRecord(false)
          }
        />
      )}

      {editingRecord && (
        <UpdateRecordForm
          record={editingRecord}
          fields={fields}
          onSave={handleSaveUpdate}
          onCancel={() =>
            setEditingRecord(null)
          }
        />
      )}
      </main>
    </>
    );
}

export default App;