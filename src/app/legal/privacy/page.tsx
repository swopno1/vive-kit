/**
 * Privacy Policy Page
 *
 * Comprehensive privacy policy for ViveKit explaining:
 * - What data we collect
 * - How we use it
 * - How users can control it
 * - GDPR/CCPA compliance
 * - Contact for privacy inquiries
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>

        <p className="text-gray-500">Last Updated: June 3, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          ViveKit ("we," "us," "our," or "Company") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our web application available at kit.vivereply.com (the "Service").
        </p>
        <p>
          Please read this Privacy Policy carefully. If you do not agree with our policies and practices,
          please do not use our Service.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Account Information:</strong> When you create an account, we collect your email address,
            name, company name, and authentication credentials (via Google OAuth).
          </li>
          <li>
            <strong>Conversations:</strong> When you paste conversation history (email threads, Slack messages,
            tickets), we store that content temporarily to generate AI responses.
          </li>
          <li>
            <strong>Business Profile:</strong> When you configure your business settings (tone, pricing policy,
            service offerings), we store these preferences.
          </li>
          <li>
            <strong>CRM Data:</strong> If you connect a CRM, we import and store client contact information,
            interaction history, and relationship metadata.
          </li>
          <li>
            <strong>API Keys:</strong> When you provide AI provider keys (Gemini, OpenAI, Claude), these are
            NOT stored on our servers. They are used only for that specific API call and then discarded.
          </li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li>
            <strong>Usage Data:</strong> We log how you use ViveKit (features accessed, conversations analyzed,
            responses generated) to improve our service.
          </li>
          <li>
            <strong>Tokens & Costs:</strong> We track token usage and estimated costs for each provider to show
            you accurate billing information.
          </li>
          <li>
            <strong>Technical Data:</strong> Browser type, IP address, pages visited, time on page, referral source.
          </li>
          <li>
            <strong>Error Logs:</strong> If you encounter errors, we log error details to diagnose and fix issues.
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>

        <p>ViveKit uses the collected information for:</p>

        <ul>
          <li><strong>Service Delivery:</strong> To generate AI responses using your configured business rules and CRM context.</li>
          <li><strong>Service Improvement:</strong> To understand how you use ViveKit and improve features, performance, and security.</li>
          <li><strong>Communications:</strong> To send you transactional emails (account confirmations, password resets) and updates about the Service.</li>
          <li><strong>Compliance:</strong> To comply with legal obligations, respond to legal requests, and enforce our Terms of Service.</li>
          <li><strong>Analytics:</strong> To understand usage patterns, conversion funnels, and feature adoption (aggregate, non-identifiable data).</li>
          <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security incidents.</li>
        </ul>

        <h2>4. Data Storage & Security</h2>

        <h3>4.1 Where Your Data is Stored</h3>
        <p>
          ViveKit uses Supabase PostgreSQL with pgvector extensions for storage. All data is stored in
          secure, encrypted databases with automatic backups.
        </p>
        <p>
          Server location: United States (us-east-1 region)
        </p>

        <h3>4.2 Data Protection Measures</h3>
        <ul>
          <li><strong>Encryption in Transit:</strong> All data in transit is encrypted using TLS 1.3.</li>
          <li><strong>Encryption at Rest:</strong> Sensitive data is encrypted in the database.</li>
          <li><strong>Row-Level Security (RLS):</strong> Database policies ensure users can only access their own data.</li>
          <li><strong>Access Controls:</strong> Only authorized ViveScript team members can access customer data, with audit logging.</li>
          <li><strong>No API Key Storage:</strong> Your AI provider keys are never stored on our servers.</li>
        </ul>

        <h3>4.3 Data Retention</h3>
        <ul>
          <li><strong>Active Accounts:</strong> Data is retained while your account is active.</li>
          <li><strong>Deleted Accounts:</strong> Upon account deletion, all personal data is permanently removed within 30 days.</li>
          <li><strong>Backups:</strong> Backup copies are retained for 30 days after deletion, then securely destroyed.</li>
        </ul>

        <h2>5. Sharing Your Information</h2>

        <h3>5.1 We Do NOT Share</h3>
        <p>
          ViveKit does NOT sell, trade, or rent your personal information to third parties. We do NOT share
          your conversations, CRM data, or business profiles with any third party without your explicit consent.
        </p>

        <h3>5.2 We MAY Share</h3>
        <ul>
          <li>
            <strong>Service Providers:</strong> With vendors who help us operate the Service (e.g., hosting providers,
            analytics tools) under confidentiality agreements.
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, court order, or government request.
          </li>
          <li>
            <strong>Business Transfers:</strong> If ViveKit is acquired or merged, your data may be transferred as part of that transaction.
          </li>
          <li>
            <strong>With Consent:</strong> When you explicitly authorize us to share information with third parties.
          </li>
        </ul>

        <h2>6. Your Privacy Rights</h2>

        <h3>6.1 GDPR Rights (EU Users)</h3>
        <p>If you are located in the EU, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
          <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
          <li><strong>Restriction:</strong> Request restriction of processing.</li>
          <li><strong>Objection:</strong> Object to processing of your data.</li>
        </ul>

        <h3>6.2 CCPA Rights (California Users)</h3>
        <p>If you are a California resident, you have the right to:</p>
        <ul>
          <li><strong>Know:</strong> What personal information we collect and how we use it.</li>
          <li><strong>Delete:</strong> Request deletion of your personal data.</li>
          <li><strong>Opt-Out:</strong> Opt out of the sale of your personal information.</li>
          <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights.</li>
        </ul>

        <h3>6.3 Exercising Your Rights</h3>
        <p>
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:privacy@vivescriptsolutions.com">privacy@vivescriptsolutions.com</a> with:
        </p>
        <ul>
          <li>Your account email address</li>
          <li>Type of request (access, deletion, correction, etc.)</li>
          <li>Specific data you're requesting</li>
        </ul>
        <p>
          We will respond to your request within 30 days. We may request verification of your identity before
          processing your request.
        </p>

        <h2>7. Account Deletion & Data Erasure</h2>

        <p>
          ViveKit provides a complete GDPR-compliant data erasure pipeline accessible through your account settings:
        </p>

        <ol>
          <li>Go to Settings → Account</li>
          <li>Scroll to "Danger Zone"</li>
          <li>Click "Delete My Account & All Data"</li>
          <li>Confirm deletion (requires entering your password)</li>
          <li>Receive confirmation email</li>
          <li>All data deleted within 24 hours</li>
        </ol>

        <p>
          Upon deletion, we permanently remove:
        </p>
        <ul>
          <li>Your account information</li>
          <li>All conversations and vector memories</li>
          <li>CRM profiles and relationship data</li>
          <li>Business configuration</li>
          <li>Usage logs</li>
          <li>Backups (within 30 days)</li>
        </ul>

        <p>
          You can also request data export before deletion. Go to Settings → Data Export to download all your
          data as JSON.
        </p>

        <h2>8. Third-Party Services</h2>

        <h3>8.1 AI Providers</h3>
        <p>
          ViveKit integrates with three AI providers. When you generate responses:
        </p>
        <ul>
          <li>Your conversation and context are sent to the selected provider (Gemini, OpenAI, or Claude).</li>
          <li>Your API key is sent to authenticate the request.</li>
          <li>The provider returns the AI-generated response.</li>
        </ul>
        <p>
          Please refer to each provider's privacy policy:
        </p>
        <ul>
          <li>Google Gemini: <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a></li>
          <li>OpenAI: <a href="https://openai.com/privacy">https://openai.com/privacy</a></li>
          <li>Anthropic Claude: <a href="https://www.anthropic.com/privacy">https://www.anthropic.com/privacy</a></li>
        </ul>

        <h3>8.2 CRM Integrations</h3>
        <p>
          If you connect a CRM, ViveKit requests data for client profiles and interaction history.
          This data is stored in your ViveKit account and encrypted. Refer to your CRM provider's privacy policy.
        </p>

        <h3>8.3 Analytics</h3>
        <p>
          We use Vercel Analytics and Supabase Analytics to understand usage patterns. These tools collect
          aggregate, non-identifiable data. No personal information is shared.
        </p>

        <h2>9. Children's Privacy</h2>

        <p>
          ViveKit is not intended for children under 13. We do not knowingly collect personal information from
          children. If we discover we have collected data from a child, we will delete it immediately.
          If you believe we have collected data from a child, please contact us immediately.
        </p>

        <h2>10. Privacy Policy Changes</h2>

        <p>
          We may update this Privacy Policy occasionally to reflect changes in our practices or legal requirements.
          We will notify you of material changes by email or by posting the updated policy on our website with a
          revised "Last Updated" date.
        </p>

        <p>
          Your continued use of ViveKit after changes constitutes acceptance of the updated Privacy Policy.
        </p>

        <h2>11. Contact Us</h2>

        <p>
          For questions about this Privacy Policy or our privacy practices, please contact:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg">
          <p>
            <strong>ViveScript Solutions</strong><br/>
            Privacy Officer<br/>
            Email: <a href="mailto:privacy@vivescriptsolutions.com">privacy@vivescriptsolutions.com</a><br/>
            Website: <a href="https://vivescriptsolutions.com">https://vivescriptsolutions.com</a>
          </p>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          This Privacy Policy is effective as of June 3, 2026 and was last updated on June 3, 2026.
        </p>
      </div>
    </div>
  );
}
