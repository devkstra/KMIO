"use client"

import { useState, useCallback } from "react"
import { useYard } from "@/contexts/yard-context"

interface OptimizationResult {
  assignments: Array<{
    trainId: string
    targetNode: string
    priority: number
    estimatedTime: number
    reason: string
  }>
  metadata: {
    optimizationTime: number
    algorithm: string
    confidence: number
  }
}

interface YardStatus {
  operational: boolean
  weather: {
    condition: string
    temperature: number
    humidity: number
    windSpeed: number
  }
  infrastructure: {
    tracks: { total: number; operational: number; maintenance: number }
    signals: { total: number; operational: number; faults: number }
    power: { status: string; voltage: number; consumption: number }
  }
  capacity: {
    totalSpots: number
    occupied: number
    available: number
    utilization: number
  }
  alerts: Array<{
    id: string
    type: string
    severity: string
    message: string
    timestamp: string
  }>
}

export function useApiIntegration() {
  const { state, dispatch } = useYard()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [yardStatus, setYardStatus] = useState<YardStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestOptimization = useCallback(
    async (constraints?: any) => {
      setIsOptimizing(true)
      setError(null)

      try {
        const response = await fetch("/api/optimize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trains: state.trains.map((train) => ({
              id: train.id,
              currentNode: train.currentNode,
              status: train.status,
            })),
            constraints,
          }),
        })

        if (!response.ok) {
          throw new Error("Optimization request failed")
        }

        const result = await response.json()
        setOptimizationResult(result)

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)
        console.error("Optimization error:", err)
        return null
      } finally {
        setIsOptimizing(false)
      }
    },
    [state.trains],
  )

  const applyOptimizationResult = useCallback(
    (result: OptimizationResult) => {
      result.assignments.forEach((assignment) => {
        dispatch({
          type: "MOVE_TRAIN",
          trainId: assignment.trainId,
          targetNode: assignment.targetNode,
        })
      })
    },
    [dispatch],
  )

  const fetchYardStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/yard-status")

      if (!response.ok) {
        throw new Error("Failed to fetch yard status")
      }

      const status = await response.json()
      setYardStatus(status)

      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error("Yard status error:", err)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isOptimizing,
    optimizationResult,
    yardStatus,
    error,

    // Actions
    requestOptimization,
    applyOptimizationResult,
    fetchYardStatus,
    clearError,
  }
}
