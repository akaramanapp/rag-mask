import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 API ROUTE CALLED - /api/analyze');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔗 Request URL:', request.url);
  console.log('📋 Request method:', request.method);
  
  try {
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    
    // Use environment variables for service URLs, fallback to localhost for development
    const analyzerUrl = process.env.PRESIDIO_ANALYZER_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://presidio-analyzer:3000/analyze'
        : 'http://localhost:5002/analyze');
    
    const anonymizerUrl = process.env.PRESIDIO_ANONYMIZER_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'http://presidio-anonymizer:3000/anonymize'
        : 'http://localhost:5001/anonymize');
    
    console.log(`🔍 Starting analyze request to ${analyzerUrl}...`);
    // First, analyze the text to get sensitive data locations
    const analyzeResponse = await fetch(analyzerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Analyze API responded with status: ${analyzeResponse.status}`);
    }

    const analyzeResults = await analyzeResponse.json();
    console.log('🔍 ANALYZE API RESPONSE:', JSON.stringify(analyzeResults, null, 2));
    console.log('✅ Analyze request completed successfully');
    
    console.log(`🎭 Starting anonymize request to ${anonymizerUrl}...`);
    // Then, anonymize the text using the results
    const anonymizeResponse = await fetch(anonymizerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: body.text,
        analyzer_results: analyzeResults,
        anonymizers: { // DOCS: https://microsoft.github.io/presidio/supported_entities/
          "DEFAULT": {
            "type": "replace",
            "new_value": "ANONYMIZED",
          },
          "CREDIT_CARD": {
            "type": "mask",
            "masking_char": "*",
            "chars_to_mask": 4,
            "from_end": true
          },
          "PHONE_NUMBER": {
            "type": "mask",
            "masking_char": "*",
            "chars_to_mask": 7,
            "from_end": true
          },
          "PERSON": {
            "type": "mask",
            "masking_char": "*",
            "chars_to_mask": 3,
            "from_end": true
          },
          "US_DRIVER_LICENSE": {
            "type": "mask",
            "masking_char": "*",
            "chars_to_mask": 4,
            "from_end": true
          }
        }
      })
    });

    if (!anonymizeResponse.ok) {
      throw new Error(`Anonymize API responded with status: ${anonymizeResponse.status}`);
    }

    const anonymizeResults = await anonymizeResponse.json();
    console.log('🎭 ANONYMIZE API RESPONSE:', JSON.stringify(anonymizeResults, null, 2));
    console.log('✅ Anonymize request completed successfully');
    console.log('🎯 Final response being sent to frontend');
    
    return NextResponse.json(anonymizeResults);
  } catch (error: unknown) {
    console.error('❌ ERROR IN API ROUTE:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { error: 'Failed to process text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
