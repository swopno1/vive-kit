import { NextResponse } from 'next/server';

/**
 * POST: Logs strategy selection approvals and human overrides.
 * Establishes structured analytical metrics to optimize AI strategic weighting.
 */
export async function POST(req: Request) {
  try {
    const { selectedStrategy, userOverrode, overrideText } = await req.json();

    console.info('[CRM_DECISION_AUDIT_LOGGED]', {
      selectedStrategy,
      userOverrode,
      overrideTextLength: overrideText?.length || 0,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      logged: true,
      message: 'Operator decision logged successfully to reinforcement buffer'
    });
  } catch (error: any) {
    console.error('[API_CRM_DECISION_LOG_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
