/**
 * Services Index
 *
 * Centralized export for all service clients.
 * Import services from here for consistency.
 *
 * Example:
 *   import { n8nService, stripeService, supabase } from '@/services';
 */

// Core Infrastructure
export { supabase } from '../lib/supabase';

// API Clients
export { n8nService } from './n8n';
export { stripeService } from './stripe';
export { paypalService } from './paypal';
export { emailService } from './email';

// AI Services
export { editImageWithAI } from './gemini';

// Re-export types
export type { ApiError } from '../lib/api-client';
