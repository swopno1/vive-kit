/**
 * Legal Pages Layout
 *
 * Provides consistent styling and navigation for privacy and terms pages.
 */

import Link from 'next/link';

export const metadata = {
  title: 'Legal',
  description: 'Privacy Policy and Terms of Service for ViveKit'
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-lg text-gray-900">
              ViveKit
            </Link>
            <div className="flex gap-6">
              <Link
                href="/legal/privacy"
                className="text-gray-700 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/terms"
                className="text-gray-700 hover:text-gray-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">ViveKit</h3>
              <p className="text-gray-400 text-sm">
                Free AI client communication toolkit for freelancers and agencies.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/legal/privacy"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="text-gray-400 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                <a href="mailto:legal@vivescriptsolutions.com">
                  legal@vivescriptsolutions.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">
              © 2026 ViveScript Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
