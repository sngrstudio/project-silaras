/**
 * @fileoverview Application Health Check Endpoint
 *
 * Simple health check API endpoint for monitoring application availability
 * and basic system status. Used by load balancers, monitoring systems,
 * and deployment pipelines to verify service health.
 *
 * Features:
 * - Lightweight health status verification
 * - No-cache headers for real-time status
 * - Simple HTTP 200 response for healthy status
 * - Plain text response format
 * - Fast response time for monitoring
 *
 * Usage:
 * - Load balancer health checks
 * - Monitoring system probes
 * - Deployment pipeline verification
 * - Service mesh health monitoring
 *
 * Response:
 * - Status: 200 OK (healthy)
 * - Content-Type: text/plain
 * - Body: "OK"
 * - Cache-Control: no-cache (prevent stale status)
 *
 * @author SNGR Creative
 * @version 1.0.0
 */

import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
