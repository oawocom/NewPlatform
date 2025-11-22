import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { projectId, password } = await request.json();

    // Verify password with backend
    const res = await fetch(`http://backend:8000/api/v1/projects/${projectId}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      token: data.token || 'temp_token_' + projectId
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
