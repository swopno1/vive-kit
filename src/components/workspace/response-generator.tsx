/**
 * Response Generator Component
 *
 * Emil Kowalski Week 1 implementation:
 * - Spinner with pulse brightness (perceived performance)
 * - Character-by-character reveal animation
 * - Button press feedback
 * - Loading state management
 */

'use client';

import React, { useState, useEffect } from 'react';
import Button from './button';

interface ResponseGeneratorProps {
  /**
   * Callback when generate button is clicked
   */
  onGenerate?: (conversationData: string) => Promise<string>;

  /**
   * Placeholder text for conversation input
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * ResponseGenerator Component
 *
 * Features:
 * - Input field for conversation/context
 * - Generate button with loading spinner
 * - Character-by-character response reveal (15ms per char)
 * - Spinner uses brightness pulse for perceived faster performance
 * - Copy response to clipboard button
 * - Full Emil design polish
 *
 * @example
 * <ResponseGenerator
 *   onGenerate={async (context) => {
 *     const response = await aiService.generate(context);
 *     return response;
 *   }}
 *   placeholder="Paste conversation or ticket details..."
 * />
 */
export function ResponseGenerator({
  onGenerate,
  placeholder = 'Paste your conversation, email thread, or support ticket here...',
  disabled = false,
}: ResponseGeneratorProps) {
  const [conversationInput, setConversationInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [revealedResponse, setRevealedResponse] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

  /**
   * Character-by-character reveal animation
   * Creates smooth text reveal at ~15ms per character
   */
  useEffect(() => {
    if (!generatedResponse) {
      setRevealedResponse('');
      return;
    }

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < generatedResponse.length) {
        setRevealedResponse(generatedResponse.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15); // ~15ms per character for smooth, readable reveal

    return () => clearInterval(interval);
  }, [generatedResponse]);

  /**
   * Handle generate button click
   * Shows spinner and initiates AI response generation
   */
  const handleGenerate = async () => {
    if (!conversationInput.trim() || !onGenerate) return;

    setIsGenerating(true);
    setGeneratedResponse('');
    setRevealedResponse('');

    try {
      const response = await onGenerate(conversationInput);
      setGeneratedResponse(response);
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedResponse('Error generating response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copy response to clipboard
   */
  const handleCopy = async () => {
    if (!revealedResponse) return;

    try {
      await navigator.clipboard.writeText(revealedResponse);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Input Section */}
      <div className="space-y-2">
        <label htmlFor="conversation" className="block text-sm font-medium text-gray-900">
          Paste Conversation or Context
        </label>
        <textarea
          id="conversation"
          value={conversationInput}
          onChange={(e) => setConversationInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isGenerating}
          className={cn(
            'w-full h-40 p-4 border rounded-lg font-mono text-sm',
            'placeholder:text-gray-400 focus:outline-2 focus:outline-blue-600 focus:outline-offset-0',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'border-gray-300 focus:border-blue-600'
          )}
        />
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          disabled={disabled || !conversationInput.trim() || isGenerating}
          isLoading={isGenerating}
          loadingText="Generating..."
          className="min-w-48"
        >
          Generate Response
        </Button>
      </div>

      {/* Response Display Section */}
      {revealedResponse && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900">
              Generated Response
            </label>
            <button
              onClick={handleCopy}
              className={cn(
                'text-sm px-3 py-1 rounded transition-all duration-200',
                copiedMessage
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {copiedMessage ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-32 whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
            {revealedResponse}
            {/* Blinking cursor while revealing */}
            {revealedResponse.length < generatedResponse.length && (
              <span className="animate-pulse">|</span>
            )}
          </div>

          {/* Character count */}
          <div className="text-xs text-gray-500">
            {revealedResponse.length} / {generatedResponse.length} characters
          </div>
        </div>
      )}

      {/* Empty State */}
      {!revealedResponse && !isGenerating && conversationInput && (
        <div className="text-center py-12 text-gray-500">
          Generated response will appear here
        </div>
      )}
    </div>
  );
}

/**
 * Helper function for className concatenation
 * (Replace with your actual cn utility)
 */
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ResponseGenerator;
