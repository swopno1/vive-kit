'use client';

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  MessageSquare,
  Database,
  Users,
  Download,
  Trash2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

// =========================================================================
// ViveKit - My Data Dashboard (User Data Visibility)
// =========================================================================

export default function MyDataDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch user's data from API endpoint
      const res = await fetch('/api/data/my-data');
      if (res.ok) {
        const userData = await res.json();
        setData(userData);
      } else if (res.status === 401) {
        setError('Please sign in to view your data');
      } else {
        setError('Failed to load your data');
      }
    } catch (err) {
      setError('Error fetching your data');
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/data/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vivekit-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export data');
      }
    } catch (err) {
      alert('Error exporting data');
      console.error('Export failed:', err);
    }
  };

  const handleDeleteData = async () => {
    if (deleteConfirmText !== 'DELETE ALL') {
      alert('Please type "DELETE ALL" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/gdpr/erase', {
        method: 'DELETE',
      });

      if (res.ok) {
        // Redirect to goodbye page
        setTimeout(() => {
          window.location.href = '/goodbye';
        }, 2000);
      } else {
        alert('Failed to delete your data. Please try again.');
      }
    } catch (err) {
      alert('Error deleting your data');
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-400" />
          <span className="text-slate-200 text-sm font-semibold">My Data</span>
        </div>

        <button
          onClick={fetchUserData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">

        {error ? (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-red-500/10 border border-red-500/20 p-6 max-w-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-300">{error}</h3>
                  <p className="text-xs text-red-200 mt-1">Try refreshing the page or check your connection.</p>
                </div>
              </div>
            </Card>
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* Data Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Conversations */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conversations</span>
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {data.conversationCount || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Stored conversations</p>
                  </div>
                </CardContent>
              </Card>

              {/* Embeddings/Memories */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Embeddings</span>
                    <Database className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {data.embeddingsCount || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Vector memories stored</p>
                  </div>
                </CardContent>
              </Card>

              {/* Client Profiles */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Client Profiles</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {data.clientProfileCount || 0}
                    </h3>
                    <p className="text-xs text-slate-500">Clients in CRM</p>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Used */}
              <Card className="bg-slate-900/30 border border-slate-900 overflow-hidden hover:border-slate-800 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Storage Used</span>
                    <HardDrive className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-100">
                      {formatBytes(data.storageUsedBytes || 0)}
                    </h3>
                    <p className="text-xs text-slate-500">Total data size</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Data Breakdown */}
            <Card className="bg-slate-900/20 border border-slate-900 p-5">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-4">Storage Breakdown</h3>

              <div className="space-y-3">
                {/* Conversations Storage */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40">
                  <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">Conversations</p>
                      <p className="text-xs text-slate-500">{data.conversationCount || 0} records</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-300">
                    {formatBytes(data.conversationStorageBytes || 0)}
                  </span>
                </div>

                {/* Embeddings Storage */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40">
                  <div className="flex items-center gap-3 flex-1">
                    <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">Embeddings</p>
                      <p className="text-xs text-slate-500">{data.embeddingsCount || 0} vectors</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-300">
                    {formatBytes(data.embeddingsStorageBytes || 0)}
                  </span>
                </div>

                {/* Client Data Storage */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40">
                  <div className="flex items-center gap-3 flex-1">
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">Client Profiles & CRM</p>
                      <p className="text-xs text-slate-500">{data.clientProfileCount || 0} profiles</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-300">
                    {formatBytes(data.crmStorageBytes || 0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Data Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Export Data */}
              <Card className="bg-slate-900/20 border border-slate-900 p-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-400" />
                      Export Your Data
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Download all your data as a JSON file</p>
                  </div>
                  <Button
                    onClick={handleExportData}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Export Data
                  </Button>
                </div>
              </Card>

              {/* Delete Data */}
              <Card className="bg-red-500/10 border border-red-500/20 p-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-red-300 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete All Data
                    </h3>
                    <p className="text-xs text-red-200 mt-1">Permanently delete your account and data</p>
                  </div>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Delete Account
                  </Button>
                </div>
              </Card>

            </div>

            {/* Data Policy Info */}
            <Card className="bg-slate-900/20 border border-slate-900 p-4">
              <p className="text-xs text-slate-400">
                <strong>Your Privacy:</strong> All your data is stored securely in Supabase and is private to you.
                You can export or delete your data at any time. Deletion is permanent and cannot be undone.
              </p>
            </Card>

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin inline-block mb-3">
                <RefreshCw className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">Loading your data...</p>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-950 border border-slate-800 max-w-md w-full">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Delete All Data?</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    This will permanently delete your account, all conversations, client profiles, and embeddings. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Type <strong>"DELETE ALL"</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE ALL"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteConfirmText !== 'DELETE ALL' || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Everything'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
