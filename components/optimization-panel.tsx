"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApiIntegration } from "@/hooks/use-api-integration"
import { Loader2, Zap, CheckCircle, AlertTriangle } from "lucide-react"

export function OptimizationPanel() {
  const { isOptimizing, optimizationResult, error, requestOptimization, applyOptimizationResult, clearError } =
    useApiIntegration()

  const [showResult, setShowResult] = useState(false)

  const handleOptimize = async () => {
    const result = await requestOptimization()
    if (result && result.success) {
      setShowResult(true)
    }
  }

  const handleApplyOptimization = () => {
    if (optimizationResult) {
      applyOptimizationResult(optimizationResult)
      setShowResult(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI Optimization
        </CardTitle>
        <CardDescription>Intelligent train scheduling and yard optimization</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button onClick={handleOptimize} disabled={isOptimizing} className="w-full">
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>

          {showResult && optimizationResult && (
            <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Optimization Complete</span>
              </div>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span className="font-medium">{optimizationResult.metadata.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-medium">{optimizationResult.metadata.optimizationTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-medium">{Math.round(optimizationResult.metadata.confidence * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommended Assignments:</h4>
                {optimizationResult.assignments.map((assignment, index) => (
                  <div key={index} className="text-xs p-2 bg-white border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{assignment.trainId}</span>
                        <span className="text-muted-foreground"> → {assignment.targetNode}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        P{assignment.priority}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">{assignment.reason}</div>
                    <div className="text-muted-foreground">
                      Est. time: {Math.floor(assignment.estimatedTime / 60)}m {assignment.estimatedTime % 60}s
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApplyOptimization} size="sm" className="flex-1">
                  Apply Assignments
                </Button>
                <Button onClick={() => setShowResult(false)} variant="outline" size="sm" className="flex-1">
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Considers current train positions and status</div>
          <div>• Optimizes for efficiency and safety</div>
          <div>• Accounts for maintenance schedules</div>
          <div>• Balances yard capacity utilization</div>
        </div>
      </CardContent>
    </Card>
  )
}
