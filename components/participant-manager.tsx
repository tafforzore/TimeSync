"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Search, User, Mail, Globe, Clock } from "lucide-react"
import { TimezoneService, type Country } from "@/lib/timezone-api"

interface Participant {
  id: string
  name: string
  email: string
  country: Country
  localTime?: string
}

interface ParticipantManagerProps {
  participants: Participant[]
  onParticipantsChange: (participants: Participant[]) => void
  appointmentTime?: Date
}

export function ParticipantManager({ participants, onParticipantsChange, appointmentTime }: ParticipantManagerProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    countryCode: "",
  })

  useEffect(() => {
    const loadCountries = async () => {
      const allCountries = await TimezoneService.getAllCountries()
      setCountries(allCountries)
      setFilteredCountries(allCountries.slice(0, 20))
    }
    loadCountries()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = countries
        .filter(
          (country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.capital.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 10)
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries(countries.slice(0, 20))
    }
  }, [searchQuery, countries])

  const calculateLocalTime = (country: Country, appointmentTime: Date): string => {
    const utc = appointmentTime.getTime() + appointmentTime.getTimezoneOffset() * 60000
    const localTime = new Date(utc + country.offset * 3600000)
    return localTime.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.email || !newParticipant.countryCode) return

    const selectedCountry = countries.find((c) => c.code === newParticipant.countryCode)
    if (!selectedCountry) return

    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      email: newParticipant.email,
      country: selectedCountry,
      localTime: appointmentTime ? calculateLocalTime(selectedCountry, appointmentTime) : undefined,
    }

    onParticipantsChange([...participants, participant])
    setNewParticipant({ name: "", email: "", countryCode: "" })
  }

  const removeParticipant = (id: string) => {
    onParticipantsChange(participants.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Ajouter un participant</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Nom complet</Label>
              <Input
                placeholder="John Doe"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pays / Fuseau horaire</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un pays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <Select
              value={newParticipant.countryCode}
              onValueChange={(value) => setNewParticipant((prev) => ({ ...prev, countryCode: value }))}
            >
              <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Sélectionner un pays" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                {filteredCountries.map((country) => (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {country.name} - {country.capital}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        GMT{country.offset >= 0 ? "+" : ""}
                        {country.offset}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={addParticipant}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!newParticipant.name || !newParticipant.email || !newParticipant.countryCode}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter le participant
          </Button>
        </CardContent>
      </Card>

      {/* Liste des participants */}
      {participants.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            Participants ({participants.length})
          </h3>

          {participants.map((participant) => (
            <Card
              key={participant.id}
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{participant.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {participant.country.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {participant.localTime && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Heure locale: {participant.localTime}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
