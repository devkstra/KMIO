"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

// Types
export interface YardNode {
  id: string
  x: number
  y: number
  label: string
  type: "workshop" | "inspection" | "siding" | "interchange" | "entry"
}

export interface Train {
  id: string
  currentNode: string
  targetNode?: string
  color: string
  status: "idle" | "moving" | "maintenance"
  position?: { x: number; y: number }
}

export interface YardEdge {
  from: string
  to: string
  path: Array<{ x: number; y: number }>
}

interface YardState {
  nodes: YardNode[]
  trains: Train[]
  edges: YardEdge[]
  isAnimating: boolean
}

type YardAction =
  | { type: "MOVE_TRAIN"; trainId: string; targetNode: string }
  | { type: "UPDATE_TRAIN_POSITION"; trainId: string; position: { x: number; y: number } }
  | { type: "COMPLETE_TRAIN_MOVEMENT"; trainId: string }
  | { type: "SET_ANIMATION_STATE"; isAnimating: boolean }

const initialState: YardState = {
  nodes: [
    // Workshop area
    { id: "workshop", x: 100, y: 200, label: "Workshop", type: "workshop" },
    { id: "entry_point", x: 50, y: 250, label: "Entry Point", type: "entry" },

    // Track interchange
    { id: "interchange", x: 400, y: 200, label: "Track Interchange", type: "interchange" },

    // Inspection areas
    { id: "inspection_1", x: 650, y: 150, label: "Inspection Line 1", type: "inspection" },
    { id: "inspection_2", x: 650, y: 180, label: "Inspection Line 2", type: "inspection" },
    { id: "inspection_3", x: 650, y: 210, label: "Inspection Line 3", type: "inspection" },

    // Sidings (12 sidings, 2 trains each)
    { id: "siding_1a", x: 750, y: 120, label: "Siding 1A", type: "siding" },
    { id: "siding_1b", x: 780, y: 120, label: "Siding 1B", type: "siding" },
    { id: "siding_2a", x: 750, y: 140, label: "Siding 2A", type: "siding" },
    { id: "siding_2b", x: 780, y: 140, label: "Siding 2B", type: "siding" },
    { id: "siding_3a", x: 750, y: 160, label: "Siding 3A", type: "siding" },
    { id: "siding_3b", x: 780, y: 160, label: "Siding 3B", type: "siding" },
    { id: "siding_4a", x: 750, y: 180, label: "Siding 4A", type: "siding" },
    { id: "siding_4b", x: 780, y: 180, label: "Siding 4B", type: "siding" },
  ],
  trains: [
    { id: "TRAIN_001", currentNode: "workshop", color: "#3b82f6", status: "idle" },
    { id: "TRAIN_002", currentNode: "siding_1a", color: "#ef4444", status: "idle" },
    { id: "TRAIN_003", currentNode: "siding_2a", color: "#10b981", status: "idle" },
    { id: "TRAIN_004", currentNode: "inspection_1", color: "#f59e0b", status: "maintenance" },
  ],
  edges: [
    // Main line connections
    {
      from: "entry_point",
      to: "workshop",
      path: [
        { x: 50, y: 250 },
        { x: 75, y: 225 },
        { x: 100, y: 200 },
      ],
    },
    {
      from: "workshop",
      to: "interchange",
      path: [
        { x: 100, y: 200 },
        { x: 250, y: 200 },
        { x: 400, y: 200 },
      ],
    },

    // Interchange to inspection lines
    {
      from: "interchange",
      to: "inspection_1",
      path: [
        { x: 400, y: 200 },
        { x: 525, y: 175 },
        { x: 650, y: 150 },
      ],
    },
    {
      from: "interchange",
      to: "inspection_2",
      path: [
        { x: 400, y: 200 },
        { x: 525, y: 190 },
        { x: 650, y: 180 },
      ],
    },
    {
      from: "interchange",
      to: "inspection_3",
      path: [
        { x: 400, y: 200 },
        { x: 525, y: 205 },
        { x: 650, y: 210 },
      ],
    },

    // Inspection to sidings
    {
      from: "inspection_1",
      to: "siding_1a",
      path: [
        { x: 650, y: 150 },
        { x: 700, y: 135 },
        { x: 750, y: 120 },
      ],
    },
    {
      from: "inspection_1",
      to: "siding_1b",
      path: [
        { x: 650, y: 150 },
        { x: 715, y: 135 },
        { x: 780, y: 120 },
      ],
    },
    {
      from: "inspection_2",
      to: "siding_2a",
      path: [
        { x: 650, y: 180 },
        { x: 700, y: 160 },
        { x: 750, y: 140 },
      ],
    },
    {
      from: "inspection_2",
      to: "siding_2b",
      path: [
        { x: 650, y: 180 },
        { x: 715, y: 160 },
        { x: 780, y: 140 },
      ],
    },
    {
      from: "inspection_3",
      to: "siding_3a",
      path: [
        { x: 650, y: 210 },
        { x: 700, y: 185 },
        { x: 750, y: 160 },
      ],
    },
    {
      from: "inspection_3",
      to: "siding_3b",
      path: [
        { x: 650, y: 210 },
        { x: 715, y: 185 },
        { x: 780, y: 160 },
      ],
    },

    // Additional siding connections
    {
      from: "inspection_3",
      to: "siding_4a",
      path: [
        { x: 650, y: 210 },
        { x: 700, y: 195 },
        { x: 750, y: 180 },
      ],
    },
    {
      from: "inspection_3",
      to: "siding_4b",
      path: [
        { x: 650, y: 210 },
        { x: 715, y: 195 },
        { x: 780, y: 180 },
      ],
    },

    // Reverse connections for bidirectional movement
    {
      from: "siding_1a",
      to: "inspection_1",
      path: [
        { x: 750, y: 120 },
        { x: 700, y: 135 },
        { x: 650, y: 150 },
      ],
    },
    {
      from: "siding_2a",
      to: "inspection_2",
      path: [
        { x: 750, y: 140 },
        { x: 700, y: 160 },
        { x: 650, y: 180 },
      ],
    },
  ],
  isAnimating: false,
}

function yardReducer(state: YardState, action: YardAction): YardState {
  switch (action.type) {
    case "MOVE_TRAIN":
      return {
        ...state,
        trains: state.trains.map((train) =>
          train.id === action.trainId ? { ...train, targetNode: action.targetNode, status: "moving" } : train,
        ),
        isAnimating: true,
      }

    case "UPDATE_TRAIN_POSITION":
      return {
        ...state,
        trains: state.trains.map((train) =>
          train.id === action.trainId ? { ...train, position: action.position } : train,
        ),
      }

    case "COMPLETE_TRAIN_MOVEMENT":
      return {
        ...state,
        trains: state.trains.map((train) =>
          train.id === action.trainId
            ? {
                ...train,
                currentNode: train.targetNode || train.currentNode,
                targetNode: undefined,
                status: "idle",
                position: undefined,
              }
            : train,
        ),
      }

    case "SET_ANIMATION_STATE":
      return {
        ...state,
        isAnimating: action.isAnimating,
      }

    default:
      return state
  }
}

const YardContext = createContext<{
  state: YardState
  dispatch: React.Dispatch<YardAction>
} | null>(null)

export function YardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(yardReducer, initialState)

  return <YardContext.Provider value={{ state, dispatch }}>{children}</YardContext.Provider>
}

export function useYard() {
  const context = useContext(YardContext)
  if (!context) {
    throw new Error("useYard must be used within a YardProvider")
  }
  return context
}
