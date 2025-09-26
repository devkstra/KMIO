"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

// --- YARD LAYOUT DATA (Rebuilt for accuracy based on images) ---
const YARD_LAYOUT = {
    locations: {
        'entry-1': { x: 50, y: 220, name: "Entry Point 1" },
        'entry-2': { x: 50, y: 250, name: "Entry Point 2" },
        'acwp': { x: 200, y: 100, name: "Automatic Washing Plant" },
        'ibl-1': { x: 1850, y: 220, name: "Inspection Line 1" },
        'ibl-2': { x: 1850, y: 245, name: "Inspection Line 2" },
        'ibl-3': { x: 1850, y: 270, name: "Inspection Line 3" },
        'deep-cleaning': { x: 1850, y: 295, name: "Deep Cleaning" },
        'workshop-1': { x: 250, y: 500, name: "Workshop Bay 1" },
        'workshop-2': { x: 250, y: 525, name: "Workshop Bay 2" },
        'workshop-3': { x: 250, y: 550, name: "Workshop Bay 3" },
        'pit-wheel-lathe': { x: 250, y: 610, name: "Pit Wheel Lathe" },
        'shunting-neck-workshop': { x: 450, y: 515, name: "Workshop Shunting Neck" },
        'shunting-neck-main': { x: 1150, y: 450, name: "Main Shunting Neck" },
        'interchange': { x: 1300, y: 450, name: "Track Interchange" },
        'emergency-rerail': { x: 1650, y: 150, name: "Emergency Rerailing" },
        'siding-1': { x: 1850, y: 380, name: "Siding 1" },
        'siding-2': { x: 1850, y: 405, name: "Siding 2" },
        'siding-3': { x: 1850, y: 430, name: "Siding 3" },
        'siding-4': { x: 1850, y: 455, name: "Siding 4" },
        'siding-5': { x: 1850, y: 480, name: "Siding 5" },
        'siding-6': { x: 1850, y: 505, name: "Siding 6" },
        'siding-7': { x: 1850, y: 565, name: "Siding 7" },
        'siding-8': { x: 1850, y: 590, name: "Siding 8" },
        'siding-9': { x: 1850, y: 615, name: "Siding 9" },
        'siding-10': { x: 1850, y: 640, name: "Siding 10" },
        'siding-11': { x: 1850, y: 665, name: "Siding 11" },
        'siding-12': { x: 1850, y: 690, name: "Siding 12" },
        'test-track-start': { x: 500, y: 750, name: "Test Track" }
    },
    tracks: [
        // Entry & ACWP
        { id: "entry_track", path: [{x: 0, y: 220}, {x: 400, y: 220}, {x: 500, y: 250}, {x: 600, y: 350}, {x: 750, y: 450}] },
        { id: "acwp_track", path: [{x: 0, y: 100}, {x: 700, y: 100}, {x: 950, y: 250}, {x: 1100, y: 450}] },
        // Workshop & Test Track
        { id: "ws_neck_top", path: [{x:400, y:515}, {x:750, y:450}] },
        { id: "ws_1", path: [{x:100, y:500}, {x:400, y:500}] },
        { id: "ws_2", path: [{x:100, y:525}, {x:400, y:525}] },
        { id: "ws_3", path: [{x:100, y:550}, {x:400, y:550}] },
        { id: "pit_lathe_track", path: [{x:100, y:610}, {x:400, y:610}] },
        { id: "ws_neck_bottom", path: [{x:400, y:610}, {x:500, y:650}, {x:550, y:750}] },
        { id: "test_track", path: [{x:0, y:750}, {x:2000, y:750}] },
        // Main Line to Interchange
        { id: "main_line", path: [{x:750, y:450}, {x:1450, y:450}] },
        // Interchange to Inspection
        { id: "interchange_to_insp", path: [{x:1450, y:450}, {x:1550, y:350}, {x:1650, y:250}] },
        { id: "emergency_rerail", path: [{x:1650, y:250}, {x:1750, y:180}, {x:1900, y:150}] },
        { id: "insp_1", path: [{x:1650, y:250}, {x:2000, y:220}] },
        { id: "insp_2", path: [{x:1650, y:250}, {x:2000, y:245}] },
        { id: "insp_3", path: [{x:1650, y:250}, {x:2000, y:270}] },
        { id: "insp_4", path: [{x:1650, y:250}, {x:2000, y:295}] },
        // Interchange to Sidings
        { id: "interchange_to_sidings_top", path: [{x:1450, y:450}, {x:1550, y:420}, {x:1650, y:400}] },
        { id: "interchange_to_sidings_bottom", path: [{x:1450, y:450}, {x:1550, y:520}, {x:1650, y:580}] },
        // Sidings
        ...Array.from({ length: 6 }).map((_, i) => ({ id: `siding_t_${i}`, path: [{x:1650, y:400}, {x:2000, y:380 + i*25}] })),
        ...Array.from({ length: 6 }).map((_, i) => ({ id: `siding_b_${i}`, path: [{x:1650, y:580}, {x:2000, y:565 + i*25}] })),
    ],
};

// Types
export interface YardNode {
  id: string
  x: number
  y: number
  label: string
  type: "workshop" | "inspection" | "siding" | "interchange" | "entry" | "acwp" | "deep-cleaning" | "pit-wheel-lathe" | "shunting-neck" | "emergency-rerail" | "test-track-start"
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

const yardNodes: YardNode[] = Object.entries(YARD_LAYOUT.locations).map(([id, loc]) => {
    let type: YardNode['type'] = 'siding'; // default
    if (id.startsWith('workshop')) type = 'workshop';
    if (id.startsWith('ibl')) type = 'inspection';
    if (id.startsWith('interchange')) type = 'interchange';
    if (id.startsWith('acwp')) type = 'acwp';
    if (id.startsWith('deep-cleaning')) type = 'deep-cleaning';
    if (id.startsWith('pit-wheel-lathe')) type = 'pit-wheel-lathe';
    if (id.startsWith('shunting-neck')) type = 'shunting-neck';
    if (id.startsWith('emergency-rerail')) type = 'emergency-rerail';
    if (id.startsWith('entry')) type = 'entry';
    if (id.startsWith('test-track')) type = 'test-track-start';


    return {
      id,
      x: loc.x,
      y: loc.y,
      label: loc.name,
      type,
    };
});

const yardEdges: YardEdge[] = YARD_LAYOUT.tracks.map(track => {
    const fromNode = track.id.split('_')[0] || 'unknown';
    const toNode = track.id.split('_').pop() || 'unknown';
    return { from: fromNode, to: toNode, path: track.path };
});


const initialState: YardState = {
  nodes: yardNodes,
  trains: [
    { id: "Rake 01", currentNode: "siding-1", color: "#3b82f6", status: "idle" },
    { id: "Rake 02", currentNode: "siding-2", color: "#6366f1", status: "idle" },
    { id: "Rake 03", currentNode: "siding-3", color: "#8b5cf6", status: "idle" },
    { id: "Rake 04", currentNode: "siding-4", color: "#ec4899", status: "idle" },
    { id: "Rake 05", currentNode: "workshop-1", color: "#ef4444", status: "maintenance" },
    { id: "Rake 06", currentNode: "ibl-2", color: "#10b981", status: "idle" },
    { id: "Rake 07", currentNode: "siding-5", color: "#22c55e", status: "idle" },
    { id: "Rake 08", currentNode: "siding-6", color: "#84cc16", status: "idle" },
    { id: "Rake 09", currentNode: "siding-7", color: "#f59e0b", status: "idle" },
    { id: "Rake 10", currentNode: "siding-8", color: "#f97316", status: "idle" },
    { id: "Rake 11", currentNode: "siding-9", color: "#3b82f6", status: "idle" },
    { id: "Rake 12", currentNode: "siding-10", color: "#6366f1", status: "idle" },
    { id: "Rake 13", currentNode: "siding-11", color: "#8b5cf6", status: "idle" },
    { id: "Rake 14", currentNode: "siding-12", color: "#ec4899", status: "idle" },
    { id: "Rake 15", currentNode: "ibl-1", color: "#10b981", status: "idle" },
    { id: "Rake 16", currentNode: "acwp", color: "#f59e0b", status: "idle" },
    { id: "Rake 17", currentNode: "workshop-2", color: "#ef4444", status: "maintenance" },
    { id: "Rake 18", currentNode: "deep-cleaning", color: "#22c55e", status: "idle" },
    { id: "Rake 19", currentNode: "siding-1", color: "#84cc16", status: "idle" },
    { id: "Rake 20", currentNode: "siding-2", color: "#f97316", status: "idle" },
    { id: "Rake 21", currentNode: "siding-3", color: "#3b82f6", status: "idle" },
    { id: "Rake 22", currentNode: "siding-7", color: "#6366f1", status: "idle" },
    { id: "Rake 23", currentNode: "siding-8", color: "#8b5cf6", status: "idle" },
    { id: "Rake 24", currentNode: "shunting-neck-main", color: "#ec4899", status: "idle" },
    { id: "Rake 25", currentNode: "ibl-3", color: "#10b981", status: "idle" },
  ],
  edges: yardEdges,
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
