const CRM_URL =
  'http://192.168.1.185:4004';

export async function getClients() {

  const response =
    await fetch(
      `${CRM_URL}/api/clients`
    );

  if (!response.ok) {

    throw new Error(
      `Failed to load clients: ${response.status}`
    );

  }

  return response.json();

}

export async function getProperties() {

  const response =
    await fetch(
      `${CRM_URL}/api/properties`
    );

  if (!response.ok) {

    throw new Error(
      `Failed to load properties: ${response.status}`
    );

  }

  return response.json();

}

export async function getLeads() {

  const response =
    await fetch(
      `${CRM_URL}/api/leads`
    );

  if (!response.ok) {

    throw new Error(
      `Failed to load leads: ${response.status}`
    );

  }

  return response.json();

}

export async function getHealth() {

  const response =
    await fetch(
      `${CRM_URL}/health`
    );

  if (!response.ok) {

    throw new Error(
      `Failed to load CRM health: ${response.status}`
    );

  }

  return response.json();

}
