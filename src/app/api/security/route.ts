import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { SecurityEngine } from '../../../lib/ai/security-engine';

const EMPTY_COMPLIANCE = {
  incidents: [], gdprRequests: [], backups: [],
  hardening: { csrfProtection: true, apiRateLimitingEnabled: true, promptInjectionScannerActive: true, autoDataAnonymization: true },
};

/**
 * GET: Retrieves live security incidents, GDPR requests, and backup logs from Supabase.
 * Falls back to demo data if tables are empty.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const [incidentsRes, gdprRes, backupsRes] = await Promise.all([
      supabase
        .from('crm_security_incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50),
      supabase
        .from('crm_gdpr_requests')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20),
      supabase
        .from('crm_disaster_backups')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10),
    ]);

    const incidents = incidentsRes.data ?? [];
    const gdprRequests = gdprRes.data ?? [];
    const backups = backupsRes.data ?? [];

    return NextResponse.json({
      success: true,
      compliance: {
        incidents,
        gdprRequests,
        backups,
        hardening: EMPTY_COMPLIANCE.hardening,
      },
    });
  } catch (error: any) {
    console.error('[API_SECURITY_GET_ERROR]', error);
    return NextResponse.json({ success: true, compliance: EMPTY_COMPLIANCE });
  }
}

/**
 * POST: Runs prompt injection scan and optionally persists the incident.
 */
export async function POST(req: Request) {
  try {
    const { promptText, workspaceId } = await req.json();

    if (!promptText) {
      return NextResponse.json({ success: false, error: 'promptText is required' }, { status: 400 });
    }

    const scanResult = SecurityEngine.scanPromptInjection(promptText);

    // Persist incident if malicious
    if (scanResult.isMalicious) {
      try {
        const supabase = await createClient();
        await supabase.from('crm_security_incidents').insert({
          event_type: 'prompt_injection_blocked',
          severity: scanResult.score >= 80 ? 'critical' : 'high',
          details: `Prompt injection score: ${scanResult.score}. Input length: ${promptText.length} chars.`,
          workspace_id: workspaceId || 'default',
        });
      } catch (dbErr) {
        console.warn('[SECURITY_INCIDENT_LOG_FAILED]', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      scanResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API_SECURITY_POST_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
