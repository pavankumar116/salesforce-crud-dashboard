const express = require("express");
const axios = require("axios");

const router = express.Router();

// Salesforce objects supported by the dashboard.
const allowedObjects = [
  "Account",
  "Opportunity",
  "Lead",
  "Contact",
  "Case",
];

function selectFields(fields) {
  return fields
    .filter((field) => {
      return (
        field.filterable &&
        !field.name.endsWith("__c")
      );
    })
    .slice(0, 10)
    .map((field) => field.name);
}

// router.get("/objects/:objectName/describe", async (req, res) => {
//   try {
//     if (!req.session.salesforce) {
//       return res.status(401).json({
//         error: "Not logged in to Salesforce",
//       });
//     }

//     const { objectName } = req.params;

//     if (!allowedObjects.includes(objectName)) {
//       return res.status(400).json({
//         error: "Invalid Salesforce object",
//       });
//     }

//     const { accessToken, instanceUrl } = req.session.salesforce;

//     const response = await axios.get(
//       `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/describe`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     res.json(response.data);

//   } catch (error) {
//     console.error(
//       "Salesforce Describe Error:",
//       error.response?.data || error.message
//     );

//     res.status(500).json({
//       error: "Failed to get object metadata",
//       details: error.response?.data || error.message,
//     });
//   }
// }); 

// Get a page of Salesforce records.
router.get("/objects/:objectName", async (req, res) => {
  try {
    const { objectName } = req.params;

    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not authenticated with Salesforce",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    // Read the requested page offset.
    const offset = parseInt(req.query.offset, 10) || 0;

    // Keep pagination within Salesforce OFFSET limits.
    if (offset < 0 || offset > 2000) {
      return res.status(400).json({
        error: "Offset must be between 0 and 2000",
      });
    }

    // Get the fields available for the selected object.
    const describeResponse = await axios.get(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/describe`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const fields = selectFields(describeResponse.data.fields);

    // Get the total record count for pagination.
    const countQuery = `
      SELECT COUNT()
      FROM ${objectName}
    `;

    const countResponse = await axios.get(
      `${instanceUrl}/services/data/v67.0/query`,
      {
        params: {
          q: countQuery,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const totalCount = countResponse.data.totalSize;

    // Fetch 20 records for the current page.
    const query = `
      SELECT ${fields.join(", ")}
      FROM ${objectName}
      LIMIT 20
      OFFSET ${offset}
    `;

    console.log("OBJECT:", objectName);
    console.log("OFFSET:", offset);
    console.log("SOQL:", query);

    const response = await axios.get(
      `${instanceUrl}/services/data/v67.0/query`,
      {
        params: {
          q: query,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const records = response.data.records;

    res.json({
      object: objectName,
      fields,
      totalSize: totalCount,
      offset,
      records,
      hasMore: offset + records.length < totalCount,
    });

  } catch (error) {
    console.error(
      "Salesforce API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to fetch Salesforce records",
      details: error.response?.data || error.message,
    });
  }
  });


// Get metadata needed to create records.
router.get("/objects/:objectName/metadata", async (req, res) => {
  try {
    const { objectName } = req.params;

    // Validate the selected Salesforce object.
    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    // Make sure the user is authenticated before calling Salesforce.
    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not authenticated with Salesforce",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    // Get Salesforce object metadata.
    const response = await axios.get(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/describe`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Keep only fields that can be used when creating a record.
    const createableFields = response.data.fields
      .filter((field) => field.createable)
      .map((field) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        required: !field.nillable && !field.defaultedOnCreate,
        updateable: field.updateable,
        picklistValues:
          field.picklistValues?.map((item) => ({
            label: item.label,
            value: item.value,
          })) || [],
      }));

    res.json({
      object: objectName,
      fields: createableFields,
    });
  } catch (error) {
    console.error(
      "Salesforce Metadata Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch Salesforce metadata",
      details: error.response?.data || error.message,
    });
  }
});

// Get a single Salesforce record by ID.
router.get("/objects/:objectName/:id", async (req, res) => {
  try {
    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not logged in to Salesforce",
      });
    }

    const { objectName, id } = req.params;

    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    const response = await axios.get(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error(
      "Salesforce Get Record Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to fetch Salesforce record",
      details: error.response?.data || error.message,
    });
  }
}); 

// Partially update an existing Salesforce record.
router.patch("/objects/:objectName/:id", async (req, res) => {
  try {
    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not logged in to Salesforce",
      });
    }

    const { objectName, id } = req.params;

    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    await axios.patch(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/${id}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: `${objectName} updated successfully`,
      id,
    });

  } catch (error) {
    console.error(
      "Salesforce Update Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to update Salesforce record",
      details: error.response?.data || error.message,
    });
  }
});

// Delete an existing Salesforce record.
router.delete("/objects/:objectName/:id", async (req, res) => {
  try {
    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not logged in to Salesforce",
      });
    }

    const { objectName, id } = req.params;

    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    await axios.delete(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({
      message: `${objectName} deleted successfully`,
      id,
    });

  } catch (error) {
    console.error(
      "Salesforce Delete Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to delete Salesforce record",
      details: error.response?.data || error.message,
    });
  }
});

// Fetch the next page using Salesforce's next-records URL.
router.get("/next", async (req, res) => {
  try {
    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not logged in to Salesforce",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    const { nextRecordsUrl } = req.query;

    if (!nextRecordsUrl) {
      return res.status(400).json({
        error: "nextRecordsUrl is required",
      });
    }

    const response = await axios.get(
      `${instanceUrl}${nextRecordsUrl}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({
      totalSize: response.data.totalSize,
      done: response.data.done,
      nextRecordsUrl: response.data.nextRecordsUrl || null,
      records: response.data.records,
    });

  } catch (error) {
    console.error(
      "Salesforce Pagination Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to fetch next records",
      details: error.response?.data || error.message,
    });
  }
}); 

// Create a new Salesforce record.
router.post("/objects/:objectName", async (req, res) => {
  try {
    const { objectName } = req.params;
    const data = req.body;

    if (!allowedObjects.includes(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
      });
    }

    if (!req.session.salesforce) {
      return res.status(401).json({
        error: "Not authenticated with Salesforce",
      });
    }

    const { accessToken, instanceUrl } = req.session.salesforce;

    const response = await axios.post(
      `${instanceUrl}/services/data/v67.0/sobjects/${objectName}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json({
      message: `${objectName} created successfully`,
      id: response.data.id,
      success: response.data.success,
    });
  } catch (error) {
    console.error(
      "Salesforce Create Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "Failed to create Salesforce record",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;