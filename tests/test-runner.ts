import { PromptBuilder } from "../src/lib/ai/prompt-builder";
import { TEST_SCENARIOS } from "./scenarios";

/**
 * Simple test runner to verify prompt composition for Phase 4.
 * In a real environment, this would call the AI providers and verify outputs.
 */
async function runPromptTests() {
  console.log("=== VIVEKIT PHASE 4 PROMPT TEST RUNNER ===\n");

  for (const [name, config] of Object.entries(TEST_SCENARIOS)) {
    console.log(`Scenario: ${name.toUpperCase()}`);
    console.log(`Task: ${config.task}`);
    console.log(`Tone: ${config.selectedTone}`);

    const systemPrompt = PromptBuilder.buildSystemInstructions(config);

    console.log("--- SYSTEM PROMPT PREVIEW (First 500 chars) ---");
    console.log(systemPrompt.substring(0, 500) + "...");
    console.log("-------------------------------------------\n");

    // Basic validation
    if (systemPrompt.includes("Senior Client Communication Strategist")) {
      console.log("✅ Identity correctly injected.");
    } else {
      console.log("❌ Identity MISSING.");
    }

    if (
      config.businessContext &&
      systemPrompt.includes(config.businessContext.businessName)
    ) {
      console.log("✅ Business context correctly injected.");
    }

    if (
      config.selectedTone &&
      systemPrompt.includes(config.selectedTone.toUpperCase())
    ) {
      console.log("✅ Tone guidelines correctly injected.");
    }

    if (
      config.task === "negotiate" &&
      systemPrompt.includes("NEGOTIATION STRATEGY")
    ) {
      console.log("✅ Negotiation intel correctly injected.");
    }

    console.log("\n" + "=".repeat(50) + "\n");
  }
}

runPromptTests().catch(console.error);
