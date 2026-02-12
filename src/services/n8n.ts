/**
 * n8n Automation Service
 *
 * Handles workflow triggers and automation execution.
 */

import { ApiClient, ApiError } from '../lib/api-client';

const N8N_API_URL = import.meta.env.VITE_N8N_API_URL || '';
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

class N8nService {
  private client: ApiClient;
  private enabled: boolean;

  constructor() {
    this.enabled = !!(N8N_API_URL && N8N_API_KEY);

    if (this.enabled) {
      this.client = new ApiClient(N8N_API_URL, {
        'X-N8N-API-KEY': N8N_API_KEY,
      });
    } else {
      console.warn('[n8n] Service not configured. Set VITE_N8N_API_URL and VITE_N8N_API_KEY.');
      // Create a stub client
      this.client = new ApiClient('http://localhost');
    }
  }

  /**
   * Check if n8n service is configured and available
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Trigger a workflow by webhook
   */
  async triggerWorkflow(webhookPath: string, data: any): Promise<any> {
    if (!this.enabled) {
      console.warn('[n8n] Workflow trigger skipped - service not configured');
      return { success: false, message: 'n8n not configured' };
    }

    try {
      return await this.client.post(`/webhook/${webhookPath}`, data);
    } catch (error) {
      console.error('[n8n] Workflow trigger failed:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    if (!this.enabled) {
      return { status: 'unavailable' };
    }

    try {
      return await this.client.get(`/executions/${executionId}`);
    } catch (error) {
      console.error('[n8n] Failed to get execution status:', error);
      throw error;
    }
  }

  /**
   * List available workflows
   */
  async listWorkflows(): Promise<any[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await this.client.get<{ data: any[] }>('/workflows');
      return response.data || [];
    } catch (error) {
      console.error('[n8n] Failed to list workflows:', error);
      return [];
    }
  }

  /**
   * Execute a workflow by ID
   */
  async executeWorkflow(workflowId: string, data?: any): Promise<any> {
    if (!this.enabled) {
      console.warn('[n8n] Workflow execution skipped - service not configured');
      return { success: false, message: 'n8n not configured' };
    }

    try {
      return await this.client.post(`/workflows/${workflowId}/execute`, data);
    } catch (error) {
      console.error('[n8n] Workflow execution failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const n8nService = new N8nService();
