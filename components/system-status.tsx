"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApiIntegration } from "@/hooks/use-api-integration"
import { Activity, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"

export function SystemStatus() {
  const { yardStatus, error, fetchYardStatus } = useApiIntegration()

  useEffect(() => {
    fetchYardStatus()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchYardStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchYardStatus])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            System Status - Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchYardStatus} size="sm" className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!yardStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            Loading System Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Status
          {yardStatus.operational ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </CardTitle>
        <CardDescription>Real-time yard monitoring and infrastructure status</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Operational Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Operational Status:</span>
          <Badge variant={yardStatus.operational ? "default" : "destructive"}>
            {yardStatus.operational ? "Operational" : "Offline"}
          </Badge>
        </div>

        {/* Weather Conditions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Weather Conditions</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Condition:</span>
              <span className="capitalize">{yardStatus.weather.condition}</span>
            </div>
            <div className="flex justify-between">
              <span>Temperature:</span>
              <span>{yardStatus.weather.temperature}°C</span>
            </div>
            <div className="flex justify-between">
              <span>Humidity:</span>
              <span>{yardStatus.weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span>Wind Speed:</span>
              <span>{yardStatus.weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Infrastructure</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Tracks:</span>
              <span>
                {yardStatus.infrastructure.tracks.operational}/{yardStatus.infrastructure.tracks.total} operational
              </span>
            </div>
            <div className="flex justify-between">
              <span>Signals:</span>
              <span>
                {yardStatus.infrastructure.signals.operational}/{yardStatus.infrastructure.signals.total} operational
              </span>
            </div>
            <div className="flex justify-between">
              <span>Power Status:</span>
              <Badge variant="outline" className="text-xs">
                {yardStatus.infrastructure.power.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Voltage:</span>
              <span>{yardStatus.infrastructure.power.voltage}V</span>
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Capacity Utilization</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Occupied:</span>
              <span>
                {yardStatus.capacity.occupied}/{yardStatus.capacity.totalSpots}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Utilization:</span>
              <span>{yardStatus.capacity.utilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${yardStatus.capacity.utilization}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {yardStatus.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Alerts</h4>
            {yardStatus.alerts.map((alert) => (
              <div key={alert.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{alert.type.toUpperCase()}</span>
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-1">{alert.message}</p>
                <p className="text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(yardStatus.timestamp).toLocaleTimeString()}
          </span>
          <Button onClick={fetchYardStatus} size="sm" variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
