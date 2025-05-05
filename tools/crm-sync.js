export async function syncLeadToCRM(lead) {
    try {
      console.log("Syncing lead to CRM:\n", JSON.stringify(lead, null, 2));
      // future: real API call here
      return "Lead synced to CRM successfully.";
    } catch (err) {
      throw new Error(`CRM sync failed: ${err.message}`);
    }
  }
  