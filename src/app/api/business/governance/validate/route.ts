import { NextResponse } from 'next/server';
import { BusinessIntelligenceEngine } from '../../../../../lib/ai/business-engine';

/**
 * POST: Runs strict operational policy checks on a proposed response draft.
 */
export async function POST(req: Request) {
  try {
    const { replyText } = await req.json();

    if (replyText === undefined || replyText === null) {
      return NextResponse.json({ success: false, error: 'replyText is required' }, { status: 400 });
    }

    const governanceResult = BusinessIntelligenceEngine.validateResponse(replyText);

    return NextResponse.json({
      success: true,
      governance: governanceResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API_RESPONSE_GOVERNANCE_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
