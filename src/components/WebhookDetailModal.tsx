import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Clock, Zap } from 'lucide-react';
import { Webhook, WebhookConfig, WebhookLog } from '../types';
import { getWebhookConfig, saveWebhookConfig, getWebhookLogs, triggerWebhook } from '../services/supabaseData';

interface WebhookDetailModalProps {
  webhook: Webhook;
  onClose: () => void;
}

const WebhookDetailModal: React.FC<WebhookDetailModalProps> = ({ webhook, onClose }) => {
  const [config, setConfig] = useState<Partial<WebhookConfig>>({
    webhook_id: webhook.id,
    auth_type: 'none',
    timeout_ms: 30000,
    retry_enabled: true,
    retry_count: 3,
    retry_delay_ms: 1000,
    verify_ssl: true,
  });
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  useEffect(() => {
    loadConfigAndLogs();
  }, [webhook.id]);

  const loadConfigAndLogs = async () => {
    setLoading(true);
    try {
      const [webhookConfig, webhookLogs] = await Promise.all([
        getWebhookConfig(webhook.id),
        getWebhookLogs(webhook.id, 20),
      ]);

      if (webhookConfig) {
        setConfig(webhookConfig);
      }
      setLogs(webhookLogs);
    } catch (error) {
      console.error('Error loading webhook details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await saveWebhookConfig(config);
      alert('Webhook configuration saved successfully');
    } catch (error) {
      console.error('Error saving webhook config:', error);
      alert('Failed to save webhook configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Test webhook delivery from CatchaCRM',
        },
      };

      const { success, log } = await triggerWebhook(webhook, testPayload);

      if (success) {
        alert('Webhook test successful! Check the logs tab for details.');
      } else {
        alert(`Webhook test failed: ${log?.error_message || 'Unknown error'}`);
      }

      // Reload logs to show the test delivery
      const webhookLogs = await getWebhookLogs(webhook.id, 20);
      setLogs(webhookLogs);
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Failed to test webhook');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{webhook.name}</h2>
            <p className="text-sm text-slate-600 mt-1">{webhook.url}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivery History ({logs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading...</p>
            </div>
          ) : activeTab === 'config' ? (
            <div className="space-y-6">
              {/* Authentication */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Authentication Type</label>
                <select
                  value={config.auth_type}
                  onChange={(e) => setConfig({ ...config, auth_type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="none">None</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                </select>
              </div>

              {config.auth_type === 'basic' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={config.auth_username || ''}
                      onChange={(e) => setConfig({ ...config, auth_username: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={config.auth_password || ''}
                      onChange={(e) => setConfig({ ...config, auth_password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {config.auth_type === 'bearer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Bearer Token</label>
                  <input
                    type="password"
                    value={config.auth_token || ''}
                    onChange={(e) => setConfig({ ...config, auth_token: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}

              {config.auth_type === 'api_key' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">API Key Header</label>
                    <input
                      type="text"
                      value={config.auth_api_key_header || 'X-API-Key'}
                      onChange={(e) => setConfig({ ...config, auth_api_key_header: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      placeholder="X-API-Key"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">API Key</label>
                    <input
                      type="password"
                      value={config.auth_api_key || ''}
                      onChange={(e) => setConfig({ ...config, auth_api_key: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              {/* Retry Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Timeout (ms)</label>
                  <input
                    type="number"
                    value={config.timeout_ms || 30000}
                    onChange={(e) => setConfig({ ...config, timeout_ms: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Retry Count</label>
                  <input
                    type="number"
                    value={config.retry_count || 3}
                    onChange={(e) => setConfig({ ...config, retry_count: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={config.retry_enabled}
                  onChange={(e) => setConfig({ ...config, retry_enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-slate-700">Enable automatic retries</label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={config.verify_ssl}
                  onChange={(e) => setConfig({ ...config, verify_ssl: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-slate-700">Verify SSL certificates</label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No delivery attempts yet</p>
                  <button
                    onClick={handleTestWebhook}
                    disabled={testing}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testing ? 'Testing...' : 'Test Webhook'}
                  </button>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border-2 ${
                      log.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <AlertCircle size={16} className="text-red-600" />
                        )}
                        <span className={`text-xs font-bold uppercase ${
                          log.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                        {log.response_status && (
                          <span className="text-xs font-mono text-slate-600">
                            HTTP {log.response_status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={12} />
                        {new Date(log.triggered_at).toLocaleString()}
                        {log.response_time_ms && (
                          <span className="font-mono">({log.response_time_ms}ms)</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 mb-2">
                      <strong>{log.request_method}</strong> {log.request_url}
                    </div>

                    {log.error_message && (
                      <div className="text-xs text-red-700 mt-2 p-2 bg-red-100 rounded">
                        {log.error_message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-700 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            {activeTab === 'config' && (
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
            {activeTab === 'logs' && (
              <button
                onClick={handleTestWebhook}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                <Zap size={16} />
                {testing ? 'Testing...' : 'Test Webhook'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookDetailModal;
