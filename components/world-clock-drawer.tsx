"use client"

import { useState, useEffect } from "react"
import { X, Clock, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TimezoneService, type TimeZoneData } from "@/lib/timezone-api"

interface WorldClockDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function WorldClockDrawer({ isOpen, onClose }: WorldClockDrawerProps) {
  const [timeZones, setTimeZones] = useState<TimeZoneData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTimes, setCurrentTimes] = useState<{ [key: string]: Date }>({})

  useEffect(() => {
    const loadTimezones = async () => {
      setLoading(true)
      try {
        const countries = await TimezoneService.getAllCountries()
        const timezoneData: TimeZoneData[] = countries.slice(0, 12).map((country) => ({
          timezone: country.timezone,
          country: country.name,
          city: country.capital,
          offset: country.offset,
          currentTime: new Date().toISOString(),
        }))
        setTimeZones(timezoneData)
      } catch (error) {
        console.error("Erreur lors du chargement des fuseaux horaires:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadTimezones()
    }
  }, [isOpen])

  useEffect(() => {
    const updateTimes = () => {
      const times: { [key: string]: Date } = {}
      timeZones.forEach((tz) => {
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        const targetTime = new Date(utc + tz.offset * 3600000)
        times[tz.timezone] = targetTime
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [timeZones])

  const filteredTimeZones = timeZones.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tz.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-playfair text-gray-900 dark:text-white">Horloges Mondiales</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-source-sans">
                  Fuseaux horaires en temps réel
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Time Zones List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des fuseaux horaires...</span>
              </div>
            ) : (
              filteredTimeZones.map((tz) => {
                const time = currentTimes[tz.timezone] || new Date()
                return (
                  <Card
                    key={tz.timezone}
                    className="hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold font-playfair text-gray-900 dark:text-white">{tz.city}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-source-sans">{tz.country}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            GMT{tz.offset >= 0 ? "+" : ""}
                            {tz.offset}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {time.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-source-sans">
                            {time.toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
