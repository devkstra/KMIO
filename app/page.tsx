"use client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { YardVisualization } from "@/components/yard-visualization"
import { TrainControlPanel } from "@/components/train-control-panel"
import { OptimizationPanel } from "@/components/optimization-panel"
import { SystemStatus } from "@/components/system-status"
import { YardProvider } from "@/contexts/yard-context"

export default function HomePage() {
  return (
    <YardProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Muttom Metro Yard - Digital Twin</h1>
            <p className="text-muted-foreground">Real-time visualization and intelligent train management system</p>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Tabs defaultValue="control" className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="control">Control</TabsTrigger>
                  <TabsTrigger value="optimize">AI</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>

                <TabsContent value="control" className="mt-4">
                  <Card className="h-[calc(100vh-200px)] p-4 overflow-y-auto">
                    <TrainControlPanel />
                  </Card>
                </TabsContent>

                <TabsContent value="optimize" className="mt-4">
                  <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
                    <OptimizationPanel />
                  </div>
                </TabsContent>

                <TabsContent value="status" className="mt-4">
                  <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
                    <SystemStatus />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Yard Visualization */}
            <div className="lg:col-span-3">
              <Card className="h-full p-4">
                <YardVisualization />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </YardProvider>
  )
}
