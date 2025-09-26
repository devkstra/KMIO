"use client"

import { useEffect, useRef } from "react"
import { useYard } from "@/contexts/yard-context"
import { useTrainAnimation } from "@/hooks/use-train-animation"
import * as d3 from "d3"
import { YARD_LAYOUT } from "@/lib/yard-layout" // We'll create this file next

export function YardVisualization() {
  const svgRef = useRef<SVGSVGElement>(null)
  const { state } = useYard()
  useTrainAnimation() // This hook will handle the animation logic

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const g = svg.select<SVGGElement>(".main-group")
    
    // Update train positions
    const trainSelection = g.selectAll(".train-group").data(state.trains, (d: any) => d.id)

    // Exit old trains
    trainSelection.exit().remove()

    // Enter new trains
    const trainEnter = trainSelection
      .enter()
      .append("g")
      .attr("class", "train-group")
      .attr("id", (d) => `train-${d.id}`)

    trainEnter
      .append("rect")
      .attr("x", -30)
      .attr("y", -8)
      .attr("width", 60)
      .attr("height", 16)
      .attr("rx", 4)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)

    trainEnter
      .append("text")
      .attr("x", 0)
      .attr("y", 4)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text((d) => d.id)

    // Update all trains
    trainSelection
      .merge(trainEnter as any)
      .attr("transform", (d) => {
        if (d.position) {
          return `translate(${d.position.x}, ${d.position.y})`
        }
        const node = state.nodes.find((n) => n.id === d.currentNode)
        return `translate(${node?.x || 0}, ${node?.y || 0})`
      })
      .select("rect")
      .attr("fill", (d) => d.color)

  }, [state.trains, state.nodes])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    const mainGroup = svg.append("g").attr("class", "main-group")

    // Draw Interchanges (grey boxes)
    mainGroup
      .selectAll(".interchange")
      .data(YARD_LAYOUT.interchanges)
      .enter()
      .append("rect")
      .attr("class", "interchange")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", "#a0aec0")

    // Draw Tracks
    mainGroup
      .selectAll(".track")
      .data(YARD_LAYOUT.tracks)
      .enter()
      .append("path")
      .attr("class", "track")
      .attr("d", (d) => {
        const lineGenerator = d3
          .line<{ x: number; y: number }>()
          .x((p) => p.x)
          .y((p) => p.y)
          .curve(d3.curveBasis)
        return lineGenerator(d.path) || ""
      })
      .attr("stroke", (d) => (d.id === "emergency_rerail" ? "#E53E3E" : "#4a5568"))
      .attr("stroke-width", 2)
      .attr("fill", "none")

    // Draw Labels
    mainGroup
      .selectAll(".label")
      .data(YARD_LAYOUT.labels)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => d.fill || "#718096")
      .attr("font-size", (d) => d.size)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text((d) => d.text)

    // Add zoom and pan functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on("zoom", (event) => {
      mainGroup.attr("transform", event.transform)
    });
    
    svg.call(zoom);

  }, [])


  return (
    <div className="w-full h-full p-4 bg-gray-50 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Kochi Metro Muttom Yard</h2>
        <p className="text-sm text-gray-600">
          Interactive digital twin of the yard layout.
        </p>
      </div>
      <div className="flex-grow border rounded-lg bg-white overflow-hidden shadow-sm">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 2000 800" />
      </div>
    </div>
  )
}