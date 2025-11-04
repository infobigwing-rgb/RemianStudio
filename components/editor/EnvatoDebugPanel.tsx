"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: string
  user?: {
    username: string
    email: string
  }
  tokenFormat?: string
  status?: number
}

export function EnvatoDebugPanel() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const testConnection = async () => {
    setIsTesting(true)
    console.log("[v0] Testing Envato API connection...")

    try {
      const response = await fetch("/api/envato/test")
      const data = await response.json()

      console.log("[v0] Test result:", data)
      setTestResult(data)
    } catch (error) {
      console.error("[v0] Test failed:", error)
      setTestResult({
        success: false,
        error: "Failed to test connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">API Connection Status</h3>
        <Button size="sm" variant="outline" onClick={testConnection} disabled={isTesting}>
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <AlertDescription>
                <div className="font-semibold mb-1">{testResult.success ? testResult.message : testResult.error}</div>

                {testResult.user && (
                  <div className="text-sm space-y-1">
                    <div>Username: {testResult.user.username}</div>
                    <div>Email: {testResult.user.email}</div>
                  </div>
                )}

                {testResult.details && (
                  <div className="text-sm mt-2 p-2 bg-muted rounded">
                    <div className="font-mono text-xs break-all">{testResult.details}</div>
                  </div>
                )}

                {testResult.tokenFormat && <div className="text-sm mt-2">Token format: {testResult.tokenFormat}</div>}

                {!testResult.success && testResult.status && (
                  <div className="text-sm mt-2">HTTP Status: {testResult.status}</div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <div>• Rate limit: 120 requests/minute</div>
        <div>• Token should not include "Bearer " prefix</div>
        <div>• Check browser console for detailed logs</div>
      </div>
    </Card>
  )
}
