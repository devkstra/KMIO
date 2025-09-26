"use client"

import { useEffect, useRef, useCallback } from "react"
import { useYard } from "@/contexts/yard-context"
import { useTrainAnimation } from "@/hooks/use-train-animation"
import * as d3 from "d3"

export function YardVisualization() {
  const svgRef = useRef<SVGSVGElement>(null)
  const { state, dispatch } = useYard()

  useTrainAnimation()

  const initializeVisualization = useCallback(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 1000
    const height = 500
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    // Enhanced scales to better match the yard layout
    const xScale = d3
      .scaleLinear()
      .domain([0, 900])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([80, 320])
      .range([margin.top, height - margin.bottom])

    // Add zoom and pan functionality
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Create main group
    const g = svg.append("g")

    // Clear previous render
    g.selectAll(".track").remove()
    g.selectAll(".node").remove()
    g.selectAll(".label").remove()

    // Define the yard layout based on the image
    const layout = {
      nodes: {
        entry: { x: 50, y: 250 },
        interchangeStart: { x: 400, y: 250 },
        interchangeEnd: { x: 500, y: 250 },
        workshopSwitch: { x: 150, y: 250 },
        inspectionSwitch: { x: 600, y: 250 },
        sidingsSwitch: { x: 700, y: 250 },
      },
      tracks: [
        // Main Line
        { id: "main-1", path: [{ x: 50, y: 250 }, { x: 400, y: 250 }] },
        { id: "interchange", path: [{ x: 400, y: 250 }, { x: 500, y: 250 }] },
        { id: "main-2", path: [{ x: 500, y: 250 }, { x: 950, y: 250 }] },

        // Workshop Tracks
        { id: "ws-1", path: [{ x: 150, y: 250 }, { x: 250, y: 220 }, { x: 350, y: 220 }] },
        { id: "ws-2", path: [{ x: 150, y: 250 }, { x: 250, y: 235 }, { x: 350, y: 235 }] },
        { id: "ws-3", path: [{ x: 150, y: 250 }, { x: 250, y: 250 }, { x: 350, y: 250 }] },
        { id: "ws-lathe", path: [{ x: 150, y: 250 }, { x: 250, y: 280 }, { x: 350, y: 280 }] },
        { id: "ws-shunt", path: [{ x: 150, y: 250 }, { x: 250, y: 300 }, { x: 350, y: 300 }] },
        { id: "test-track", path: [{ x: 100, y: 350 }, { x: 700, y: 350 }] },

        // Inspection Tracks
        { id: "insp-1", path: [{ x: 600, y: 250 }, { x: 680, y: 200 }, { x: 780, y: 200 }] },
        { id: "insp-2", path: [{ x: 600, y: 250 }, { x: 680, y: 220 }, { x: 780, y: 220 }] },
        { id: "insp-3", path: [{ x: 600, y: 250 }, { x: 680, y: 240 }, { x: 780, y: 240 }] },
        
        // Sidings
        ...Array.from({ length: 12 }, (_, i) => ({
          id: `siding-${i + 1}`,
          path: [
            { x: 700, y: 250 },
            { x: 780, y: 150 + i * 15 },
            { x: 900, y: 150 + i * 15 },
          ],
        })),

        // Emergency Line
        { id: "emergency", path: [{ x: 550, y: 250 }, { x: 650, y: 150 }, { x: 800, y: 120 }] },
      ],
      labels: [
        { text: "Entry Point", x: 50, y: 240, anchor: "start" },
        { text: "WORKSHOP", x: 250, y: 200, anchor: "middle", size: "14px", weight: "bold" },
        { text: "Track Interchange", x: 450, y: 240, anchor: "middle" },
        { text: "Inspection Bay", x: 730, y: 180, anchor: "middle", size: "14px", weight: "bold" },
        { text: "Sidings", x: 840, y: 130, anchor: "middle", size: "14px", weight: "bold" },
        { text: "Test Track", x: 400, y: 365, anchor: "middle" },
        { text: "Emergency Routing Line", x: 725, y: 130, anchor: "middle", color: "#dc3545" },
      ],
    }

    const trackGroup = g.append("g").attr("class", "tracks")
    const nodeGroup = g.append("g").attr("class", "nodes")
    const labelGroup = g.append("g").attr("class", "labels")

    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Draw tracks
    layout.tracks.forEach((track) => {
      trackGroup
        .append("path")
        .datum(track.path)
        .attr("d", line)
        .attr("stroke", track.id === "emergency" ? "#dc3545" : "#495057")
        .attr("stroke-width", track.id === "emergency" ? 2 : 4)
        .attr("stroke-dasharray", track.id === "emergency" ? "5,5" : "none")
        .attr("fill", "none")
    })

    // Draw nodes (switches)
    Object.values(layout.nodes).forEach((node) => {
      nodeGroup
        .append("circle")
        .attr("cx", xScale(node.x))
        .attr("cy", yScale(node.y))
        .attr("r", 6)
        .attr("fill", "#ffc107")
        .attr("stroke", "#343a40")
        .attr("stroke-width", 2)
    })

    // Draw labels
    layout.labels.forEach((label) => {
      labelGroup
        .append("text")
        .attr("x", xScale(label.x))
        .attr("y", yScale(label.y))
        .attr("text-anchor", label.anchor || "start")
        .attr("font-size", label.size || "10px")
        .attr("font-weight", label.weight || "normal")
        .attr("fill", label.color || "#343a40")
        .text(label.text)
    })

    // Train rendering (can be enhanced later)
    const trainGroup = g.append("g").attr("class", "trains")
    state.trains.forEach((train) => {
      const currentNode = state.nodes.find((n) => n.id === train.currentNode)
      if (!currentNode) return

      const x = train.position?.x || currentNode.x
      const y = train.position?.y || currentNode.y

      trainGroup
        .append("rect")
        .attr("x", xScale(x) - 8)
        .attr("y", yScale(y) - 4)
        .attr("width", 16)
        .attr("height", 8)
        .attr("fill", train.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
    })
  }, [state])

  useEffect(() => {
    initializeVisualization()
  }, [initializeVisualization])

  const getNodeColor = (type: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "#28a745"
      case "moving":
        return "#007bff"
      case "maintenance":
        return "#ffc107"
      default:
        return "#6c757d"
    }
  }

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kochi Metro Muttom Yard</h2>
          <p className="text-sm text-gray-600">
            Interactive yard layout - Scroll to zoom, drag to pan | Scale: 1:1000
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
            Real-time updates
          </div>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <svg ref={svgRef} width="100%" height="500" viewBox="0 0 1000 500" className="w-full" />
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <h4 className="font-semibold mb-2">Node Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-yellow-500 border border-gray-600"></div>
              <span>Workshop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 border border-gray-600 rounded-full"></div>
              <span>Inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 border border-gray-600 rounded-full"></div>
              <span>Siding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 border border-gray-600 transform rotate-45"></div>
              <span>Interchange</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Train Status</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Moving</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
