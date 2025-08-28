"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface TimeZone {
  city: string
  country: string
  offset: string
  timezone: string
}

const timeZones: TimeZone[] = [
  { city: "Londres", country: "Royaume-Uni", offset: "GMT+0", timezone: "Europe/London" },
  { city: "Paris", country: "France", offset: "GMT+1", timezone: "Europe/Paris" },
  { city: "Le Caire", country: "Égypte", offset: "GMT+2", timezone: "Africa/Cairo" },
  { city: "Moscou", country: "Russie", offset: "GMT+3", timezone: "Europe/Moscow" },
  { city: "Dubaï", country: "EAU", offset: "GMT+4", timezone: "Asia/Dubai" },
  { city: "Karachi", country: "Pakistan", offset: "GMT+5", timezone: "Asia/Karachi" },
  { city: "Dhaka", country: "Bangladesh", offset: "GMT+6", timezone: "Asia/Dhaka" },
  { city: "Bangkok", country: "Thaïlande", offset: "GMT+7", timezone: "Asia/Bangkok" },
  { city: "Pékin", country: "Chine", offset: "GMT+8", timezone: "Asia/Shanghai" },
  { city: "Tokyo", country: "Japon", offset: "GMT+9", timezone: "Asia/Tokyo" },
  { city: "Sydney", country: "Australie", offset: "GMT+10", timezone: "Australia/Sydney" },
  { city: "Nouméa", country: "Nouvelle-Calédonie", offset: "GMT+11", timezone: "Pacific/Noumea" },
  { city: "Auckland", country: "Nouvelle-Zélande", offset: "GMT+12", timezone: "Pacific/Auckland" },
]

export function WorldClock() {
  const [times, setTimes] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: { [key: string]: string } = {}
      timeZones.forEach((tz) => {
        const time = new Date().toLocaleTimeString("fr-FR", {
          timeZone: tz.timezone,
          hour12: false,
        })
        newTimes[tz.timezone] = time
      })
      setTimes(newTimes)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-montserrat flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horloge Mondiale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeZones.map((tz) => (
            <div key={tz.timezone} className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{tz.city}</h3>
                  <p className="text-sm text-muted-foreground">{tz.country}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{tz.offset}</span>
              </div>
              <div className="text-2xl font-mono font-bold text-primary">{times[tz.timezone] || "--:--:--"}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
