"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useYard } from "@/contexts/yard-context"
import { useState } from "react"

export function TrainControlPanel() {
  const { state, dispatch } = useYard()
  const [selectedTrain, setSelectedTrain] = useState<string>("")
  const [targetNode, setTargetNode] = useState<string>("")

  const handleMoveTrain = () => {
    if (selectedTrain && targetNode) {
      dispatch({ type: "MOVE_TRAIN", trainId: selectedTrain, targetNode })
      setSelectedTrain("")
      setTargetNode("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-green-500"
      case "moving":
        return "bg-blue-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Train Control Panel</h2>

        {/* Animation Status */}
        {state.isAnimating && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 font-medium">Train movement in progress...</span>
            </div>
          </div>
        )}

        {/* Train List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Trains</h3>
          {state.trains.map((train) => {
            const currentNode = state.nodes.find((n) => n.id === train.currentNode)
            const targetNode = train.targetNode ? state.nodes.find((n) => n.id === train.targetNode) : null

            return (
              <div key={train.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: train.color }} />
                  <div>
                    <div className="font-medium text-sm">{train.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {currentNode?.label}
                      {targetNode && (
                        <span className="text-blue-600">
                          {" → "}
                          {targetNode.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={`text-white ${getStatusColor(train.status)}`}>
                    {train.status}
                  </Badge>
                  {train.status === "moving" && <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Movement Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Move Train</h3>

          <Select value={selectedTrain} onValueChange={setSelectedTrain}>
            <SelectTrigger>
              <SelectValue placeholder="Select train" />
            </SelectTrigger>
            <SelectContent>
              {state.trains
                .filter((t) => t.status === "idle")
                .map((train) => (
                  <SelectItem key={train.id} value={train.id}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: train.color }} />
                      <span>{train.id}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={targetNode} onValueChange={setTargetNode}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {state.nodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getNodeTypeColor(node.type) }} />
                    <span>{node.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleMoveTrain}
            disabled={!selectedTrain || !targetNode || state.isAnimating}
            className="w-full"
          >
            {state.isAnimating ? "Moving..." : "Move Train"}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => dispatch({ type: "MOVE_TRAIN", trainId: "TRAIN_001", targetNode: "inspection_1" })}
            disabled={state.isAnimating || state.trains.find((t) => t.id === "TRAIN_001")?.status !== "idle"}
          >
            Send TRAIN_001 to Inspection
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => dispatch({ type: "MOVE_TRAIN", trainId: "TRAIN_002", targetNode: "workshop" })}
            disabled={state.isAnimating || state.trains.find((t) => t.id === "TRAIN_002")?.status !== "idle"}
          >
            Send TRAIN_002 to Workshop
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => dispatch({ type: "MOVE_TRAIN", trainId: "TRAIN_003", targetNode: "siding_1b" })}
            disabled={state.isAnimating || state.trains.find((t) => t.id === "TRAIN_003")?.status !== "idle"}
          >
            Move TRAIN_003 to Siding 1B
          </Button>
        </div>

        {/* System Status */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">System Status</h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total Trains:</span>
              <span className="font-medium">{state.trains.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Idle:</span>
              <span className="font-medium text-green-600">
                {state.trains.filter((t) => t.status === "idle").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Moving:</span>
              <span className="font-medium text-blue-600">
                {state.trains.filter((t) => t.status === "moving").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance:</span>
              <span className="font-medium text-yellow-600">
                {state.trains.filter((t) => t.status === "maintenance").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  function getNodeTypeColor(type: string) {
    switch (type) {
      case "workshop":
        return "#ffc107"
      case "inspection":
        return "#17a2b8"
      case "siding":
        return "#28a745"
      case "interchange":
        return "#dc3545"
      case "entry":
        return "#6f42c1"
      default:
        return "#6c757d"
    }
  }
}
