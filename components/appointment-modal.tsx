"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Send, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ParticipantManager } from "./participant-manager"

interface Participant {
  id: string
  name: string
  email: string
  country: {
    name: string
    code: string
    timezone: string
    offset: number
    capital: string
  }
  localTime?: string
}

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (participants.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un participant.",
        variant: "destructive",
      })
      return
    }

    // Simuler l'envoi d'emails avec conversion des heures
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`)

    // Mettre à jour les heures locales des participants
    const updatedParticipants = participants.map((participant) => ({
      ...participant,
      localTime: calculateLocalTime(participant.country, appointmentDateTime),
    }))

    toast({
      title: "Rendez-vous programmé !",
      description: `${updatedParticipants.length} invitation(s) envoyée(s) avec les heures locales correspondantes.`,
    })

    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
    })
    setParticipants([])
    onClose()
  }

  const calculateLocalTime = (country: any, appointmentTime: Date): string => {
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const appointmentDateTime = formData.date && formData.time ? new Date(`${formData.date}T${formData.time}`) : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold font-playfair text-gray-900 dark:text-white">
                Programmer un Rendez-vous
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300 font-source-sans">
                Coordonnez vos réunions à travers les fuseaux horaires
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                Titre du rendez-vous
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Réunion équipe internationale..."
                className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="date"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="time" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Heure
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Détails du rendez-vous, ordre du jour, liens de connexion..."
              rows={4}
              className="rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Participants</h3>
            </div>
            <ParticipantManager
              participants={participants}
              onParticipantsChange={setParticipants}
              appointmentTime={appointmentDateTime}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 px-6 rounded-xl font-source-sans font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="h-12 px-8 rounded-xl font-source-sans font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Send className="mr-2 h-5 w-5" />
              Envoyer les Invitations
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
