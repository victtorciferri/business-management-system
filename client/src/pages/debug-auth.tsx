import React from 'react';
import AuthDebugger from '@/components/debug/AuthDebugger';

/**
 * Debug Auth Page
 * 
 * This page provides authentication debugging tools
 */
export default function DebugAuthPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debugging</h1>
      <p className="text-muted-foreground mb-6">
        This page provides tools to diagnose authentication and session issues.
        Use the tools below to test login/logout functionality and check auth status.
      </p>
      
      <AuthDebugger />
      
      <div className="mt-8 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-2">Debug Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Check the current authentication status</li>
          <li>Try logging in with the default credentials (businessowner/password123)</li>
          <li>After login, test the theme creation endpoint</li>
          <li>If needed, test logout functionality</li>
        </ol>
      </div>
    </div>
  );
}