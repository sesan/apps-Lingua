export async function POST(request: Request) {
  try {
    const { callId, callType } = await request.json();

    if (!callId) {
      return Response.json(
        { error: 'Missing required parameter: callId' },
        { status: 400 }
      );
    }

    const serverUrl = process.env.VISION_AGENT_SERVER_URL || 'http://localhost:8000';
    console.log(`Proxying start session request for call ${callId} to ${serverUrl}`);

    const response = await fetch(`${serverUrl}/calls/${callId}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ call_type: callType || 'audio_room' }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agent server responded with ${response.status}: ${errorText}`);
      return Response.json(
        { error: `Agent server responded with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return Response.json(responseData);
  } catch (error: any) {
    console.error('Error starting agent session:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
