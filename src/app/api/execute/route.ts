import { NextRequest, NextResponse } from 'next/server'

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://api.judge0.com'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ''

// Language mapping
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 63,
  python: 71,
  cpp: 54,
  react: 63,
}

export async function POST(request: NextRequest) {
  try {
    const { sourceCode, language } = await request.json()

    if (!sourceCode || !language) {
      return NextResponse.json(
        { error: 'Missing sourceCode or language' },
        { status: 400 }
      )
    }

    const languageId = LANGUAGE_IDS[language]
    if (!languageId) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    // Create submission
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(JUDGE0_API_KEY && { 'X-Auth-Token': JUDGE0_API_KEY }),
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        base64_encoded: false,
      }),
    })

    if (!submitResponse.ok) {
      const errorData = await submitResponse.text()
      console.error('Judge0 submission error:', errorData)
      return NextResponse.json(
        { error: 'Failed to submit code to Judge0' },
        { status: 500 }
      )
    }

    const { token } = await submitResponse.json()

    // Poll for result
    let attempts = 0
    const maxAttempts = 10
    const delay = 1000 // 1 second

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay))

      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: JUDGE0_API_KEY ? { 'X-Auth-Token': JUDGE0_API_KEY } : {},
        }
      )

      if (!resultResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch execution result' },
          { status: 500 }
        )
      }

      const result = await resultResponse.json()

      if (result.status.id >= 3) {
        // Status is completed (Accepted, Wrong Answer, etc.)
        return NextResponse.json({
          status: result.status.description,
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          compileOutput: result.compile_output || '',
          time: result.time,
          memory: result.memory,
        })
      }

      attempts++
    }

    return NextResponse.json(
      { error: 'Execution timeout' },
      { status: 408 }
    )
  } catch (error) {
    console.error('Execute API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
