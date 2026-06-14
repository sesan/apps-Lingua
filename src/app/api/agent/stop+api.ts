export async function POST(request: Request) {
  try {
    const { callId, sessionId } = await request.json();

    if (!callId || !sessionId) {
      return Response.json(
        { error: 'Missing required parameters: callId, sessionId' },
        { status: 400 }
      );
    }

    const serverUrl = process.env.VISION_AGENT_SERVER_URL || 'http://localhost:8000';
    console.log(`Proxying close session request for call ${callId}, session ${sessionId} to ${serverUrl}`);

    const response = await fetch(`${serverUrl}/calls/${callId}/sessions/${sessionId}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agent server close responded with ${response.status}: ${errorText}`);
      return Response.json(
        { error: `Agent server close responded with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Error stopping agent session:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
