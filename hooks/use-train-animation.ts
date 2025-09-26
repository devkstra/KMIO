"use client"

import { useEffect, useRef } from "react"
import { useYard } from "@/contexts/yard-context"
import * as d3 from "d3"
import { YARD_LAYOUT } from "@/lib/yard-layout"

export function useTrainAnimation() {
  const { state, dispatch } = useYard()
  const animationRef = useRef<Map<string, d3.Timer>>(new Map())

  useEffect(() => {
    const movingTrains = state.trains.filter(
      (train) => train.status === "moving" && train.targetNode
    )

    movingTrains.forEach((train) => {
      if (animationRef.current.has(train.id) || !train.targetNode) return

      const path = findPath(train.currentNode, train.targetNode)
      if (path.length < 2) {
        console.warn(`No valid path found for train ${train.id} from ${train.currentNode} to ${train.targetNode}`);
        // Immediately complete movement if path is invalid to prevent getting stuck
        dispatch({ type: "COMPLETE_TRAIN_MOVEMENT", trainId: train.id });
        return;
      }
      
      const duration = 3000 // 3 seconds
      const startTime = Date.now()

      const timer = d3.timer(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const position = interpolateAlongPath(path, progress)

        dispatch({
          type: "UPDATE_TRAIN_POSITION",
          trainId: train.id,
          position,
        })

        if (progress >= 1) {
          timer.stop()
          animationRef.current.delete(train.id)
          dispatch({
            type: "COMPLETE_TRAIN_MOVEMENT",
            trainId: train.id,
          })
          
          const stillAnimating = state.trains.some(t => t.id !== train.id && t.status === 'moving');
          if (!stillAnimating) {
            dispatch({
              type: "SET_ANIMATION_STATE",
              isAnimating: false,
            })
          }
        }
      })

      animationRef.current.set(train.id, timer)
    })

    return () => {
      animationRef.current.forEach((timer) => timer.stop())
      animationRef.current.clear()
    }
  }, [state.trains, dispatch])

  return null
}

function findPath(startNodeId: string, endNodeId: string): Array<{ x: number; y: number }> {
    const startNode = YARD_LAYOUT.locations[startNodeId as keyof typeof YARD_LAYOUT.locations];
    const endNode = YARD_LAYOUT.locations[endNodeId as keyof typeof YARD_LAYOUT.locations];
    const interchange = { x: 900, y: 350 };

    if (!startNode || !endNode) return [];
    
    // Create a plausible path: start -> interchange -> end for visualization
    return [
      { x: startNode.x, y: startNode.y },
      interchange,
      { x: endNode.x, y: endNode.y }
    ];
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
