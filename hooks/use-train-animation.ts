"use client"

import { useEffect, useRef } from "react"
import { useYard } from "@/contexts/yard-context"
import * as d3 from "d3"

export function useTrainAnimation() {
  const { state, dispatch } = useYard()
  const animationRef = useRef<Map<string, d3.Timer>>(new Map())

  useEffect(() => {
    // Find trains that need to be animated
    const movingTrains = state.trains.filter((train) => train.status === "moving" && train.targetNode)

    movingTrains.forEach((train) => {
      // Skip if already animating
      if (animationRef.current.has(train.id)) return

      const currentNode = state.nodes.find((n) => n.id === train.currentNode)
      const targetNode = state.nodes.find((n) => n.id === train.targetNode)

      if (!currentNode || !targetNode) return

      // Find the path between nodes
      const path = findPath(currentNode, targetNode, state.edges, state.nodes)
      if (path.length === 0) return

      // Create animation
      const duration = 3000 // 3 seconds
      const startTime = Date.now()

      const timer = d3.timer(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Calculate position along path
        const position = interpolateAlongPath(path, progress)

        dispatch({
          type: "UPDATE_TRAIN_POSITION",
          trainId: train.id,
          position,
        })

        // Complete animation
        if (progress >= 1) {
          timer.stop()
          animationRef.current.delete(train.id)
          dispatch({
            type: "COMPLETE_TRAIN_MOVEMENT",
            trainId: train.id,
          })
          dispatch({
            type: "SET_ANIMATION_STATE",
            isAnimating: false,
          })
        }
      })

      animationRef.current.set(train.id, timer)
    })

    // Clean up stopped animations
    return () => {
      animationRef.current.forEach((timer) => timer.stop())
      animationRef.current.clear()
    }
  }, [state.trains, state.nodes, state.edges, dispatch])

  return null
}

function findPath(start: any, end: any, edges: any[], nodes: any[]): Array<{ x: number; y: number }> {
  // Simple pathfinding - in a real system, you'd use A* or similar
  // For now, find direct edge or go through interchange

  const directEdge = edges.find(
    (edge) => (edge.from === start.id && edge.to === end.id) || (edge.to === start.id && edge.from === end.id),
  )

  if (directEdge) {
    return directEdge.path
  }

  // Try to find path through interchange
  const interchangeNode = nodes.find((n) => n.type === "interchange")
  if (!interchangeNode) return []

  const toInterchange = edges.find(
    (edge) =>
      (edge.from === start.id && edge.to === interchangeNode.id) ||
      (edge.to === start.id && edge.from === interchangeNode.id),
  )

  const fromInterchange = edges.find(
    (edge) =>
      (edge.from === interchangeNode.id && edge.to === end.id) ||
      (edge.to === interchangeNode.id && edge.from === end.id),
  )

  if (toInterchange && fromInterchange) {
    return [...toInterchange.path, ...fromInterchange.path.slice(1)]
  }

  return []
}

function interpolateAlongPath(path: Array<{ x: number; y: number }>, progress: number): { x: number; y: number } {
  if (path.length === 0) return { x: 0, y: 0 }
  if (path.length === 1) return path[0]

  const totalLength = path.length - 1
  const segmentProgress = progress * totalLength
  const segmentIndex = Math.floor(segmentProgress)
  const segmentT = segmentProgress - segmentIndex

  if (segmentIndex >= path.length - 1) {
    return path[path.length - 1]
  }

  const start = path[segmentIndex]
  const end = path[segmentIndex + 1]

  return {
    x: start.x + (end.x - start.x) * segmentT,
    y: start.y + (end.y - start.y) * segmentT,
  }
}
