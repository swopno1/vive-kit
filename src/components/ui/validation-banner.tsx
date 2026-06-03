/**
 * Validation Banner Component
 *
 * Emil Kowalski Week 1 implementation:
 * - Clip-path reveal animation (no layout shift)
 * - Severity grouping (critical violations first)
 * - Icon indicators
 * - Smooth entry from bottom
 */

'use client';

import React, { useEffect, useState } from 'react';

interface Violation {
  /**
   * Violation severity level
   * - critical: Policy-breaking violation (red)
   * - warning: Inconsistent with profile (yellow)
   * - info: Informational note (blue)
   */
  severity: 'critical' | 'warning' | 'info';

  /**
   * Human-readable violation message
   */
  message: string;

  /**
   * Optional field that caused violation
   */
  field?: string;

  /**
   * Optional remediation suggestion
   */
  suggestion?: string;
}

interface ValidationBannerProps {
  /**
   * Array of validation violations to display
   */
  violations: Violation[];

  /**
   * Callback when banner is dismissed
   */
  onDismiss?: () => void;

  /**
   * Auto-dismiss after ms (0 = no auto-dismiss)
   */
  autoDismissMs?: number;
}

const severityConfig = {
  critical: {
    color: 'bg-red-50 border-red-200',
    icon: '⚠️',
    iconColor: 'text-red-600',
    title: 'Critical Policy Violations',
    textColor: 'text-red-800',
  },
  warning: {
    color: 'bg-yellow-50 border-yellow-200',
    icon: '⚡',
    iconColor: 'text-yellow-600',
    title: 'Warnings',
    textColor: 'text-yellow-800',
  },
  info: {
    color: 'bg-blue-50 border-blue-200',
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
    title: 'Notes',
    textColor: 'text-blue-800',
  },
};

/**
 * ValidationBanner Component
 *
 * Displays business rule violations with:
 * - Severity-based grouping (critical → warning → info)
 * - Clip-path reveal animation from bottom
 * - Icon indicators for quick scanning
 * - Optional auto-dismiss
 *
 * @example
 * <ValidationBanner
 *   violations={[
 *     {
 *       severity: 'critical',
 *       message: 'Discount exceeds maximum 10%',
 *       field: 'discount',
 *       suggestion: 'Keep discount under 10% or adjust business profile'
 *     }
 *   ]}
 *   onDismiss={() => clearErrors()}
 *   autoDismissMs={5000}
 * />
 */
export function ValidationBanner({
  violations,
  onDismiss,
  autoDismissMs = 0,
}: ValidationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isEntering, setIsEntering] = useState(true);

  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismissMs || !isVisible) return;

    const timeout = setTimeout(() => {
      setIsEntering(false);
      setTimeout(() => setIsVisible(false), 200); // Wait for animation
    }, autoDismissMs);

    return () => clearTimeout(timeout);
  }, [autoDismissMs, isVisible]);

  // Reset animation when violations change
  useEffect(() => {
    setIsVisible(true);
    setIsEntering(true);
  }, [violations]);

  if (!isVisible || violations.length === 0) return null;

  // Group violations by severity
  const grouped = {
    critical: violations.filter((v) => v.severity === 'critical'),
    warning: violations.filter((v) => v.severity === 'warning'),
    info: violations.filter((v) => v.severity === 'info'),
  };

  return (
    <div
      className={cn(
        'validation-banner',
        'border-l-4 p-4 rounded-md mb-4',
        'transition-all duration-200',
        isEntering ? 'opacity-100' : 'opacity-0 transform translate-y-2'
      )}
      style={{
        // Use clip-path reveal animation from animations.css
        animation: isEntering
          ? 'reveal-banner var(--duration-base) var(--ease-out) forwards'
          : 'none',
        clipPath: isEntering ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Critical Violations */}
      {grouped.critical.length > 0 && (
        <ViolationGroup
          severity="critical"
          violations={grouped.critical}
        />
      )}

      {/* Warnings */}
      {grouped.warning.length > 0 && (
        <ViolationGroup
          severity="warning"
          violations={grouped.warning}
        />
      )}

      {/* Info Messages */}
      {grouped.info.length > 0 && (
        <ViolationGroup
          severity="info"
          violations={grouped.info}
        />
      )}

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => {
            setIsEntering(false);
            setTimeout(onDismiss, 200);
          }}
          className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Dismiss validation errors"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

/**
 * ViolationGroup Component
 * Groups violations by severity with icon and title
 */
function ViolationGroup({
  severity,
  violations,
}: {
  severity: 'critical' | 'warning' | 'info';
  violations: Violation[];
}) {
  const config = severityConfig[severity];

  return (
    <div className={cn('mb-4 p-3 rounded', config.color)}>
      {/* Group Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-lg', config.iconColor)}>{config.icon}</span>
        <h3 className={cn('font-semibold', config.textColor)}>
          {config.title} ({violations.length})
        </h3>
      </div>

      {/* Violations List */}
      <ul className="space-y-2">
        {violations.map((violation, idx) => (
          <li
            key={idx}
            className={cn(
              'text-sm flex gap-2',
              config.textColor
            )}
            style={{
              animation: `fade-in var(--duration-base) var(--ease-out) forwards`,
              animationDelay: `calc(var(--stagger-xs) * ${idx})`,
              opacity: 0,
            }}
          >
            <span className="text-lg leading-none">•</span>
            <div className="flex-1">
              {/* Main message */}
              <div className="font-medium">{violation.message}</div>

              {/* Optional field and suggestion */}
              {violation.suggestion && (
                <div className="text-xs opacity-90 mt-1">
                  💡 {violation.suggestion}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Helper function for className concatenation
 */
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ValidationBanner;
