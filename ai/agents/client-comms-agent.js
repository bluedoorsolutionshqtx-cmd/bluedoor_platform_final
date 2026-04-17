export async function clientCommsAgent(payload) {
  console.log("Client Comms Agent notifying client");

  return {
    notified: true,
    client: payload.clientId || "unknown"
  };
}
