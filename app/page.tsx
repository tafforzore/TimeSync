"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Calendar, MapPin, Globe } from "lucide-react"
import { AppointmentModal } from "@/components/appointment-modal"
import { WorldClockDrawer } from "@/components/world-clock-drawer"

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userLocation, setUserLocation] = useState<string>("Paris, France")
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation("Votre localisation détectée")
        },
        () => {
          setUserLocation("Paris, France (par défaut)")
        },
      )
    }

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Clock className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black font-playfair text-foreground tracking-tight">TimeSync</h1>
                <p className="text-sm text-muted-foreground font-source-sans">Synchronisez le monde</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {userLocation}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Horloges Mondiales</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-5xl md:text-7xl font-black font-playfair text-foreground mb-6 tracking-tight">
            {currentTime.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-source-sans mb-2">
            {currentTime.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            Temps réel
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 fade-in-up stagger-1">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-playfair mb-2">Fuseaux Horaires</h3>
              <p className="text-muted-foreground font-source-sans">
                Visualisez l'heure dans le monde entier en temps réel
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 fade-in-up stagger-2">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold font-playfair mb-2">Planification</h3>
              <p className="text-muted-foreground font-source-sans">
                Organisez des rendez-vous internationaux facilement
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 fade-in-up stagger-3">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-playfair mb-2">Géolocalisation</h3>
              <p className="text-muted-foreground font-source-sans">Détection automatique de votre fuseau horaire</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center fade-in-up">
          <Button
            size="lg"
            onClick={() => setIsAppointmentModalOpen(true)}
            className="text-lg px-8 py-6 rounded-2xl font-source-sans font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Calendar className="mr-3 h-6 w-6" />
            Programmer un Rendez-vous
          </Button>
          <p className="text-muted-foreground mt-4 font-source-sans">
            Coordonnez vos réunions à travers les fuseaux horaires
          </p>
        </div>
      </main>

      <WorldClockDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Appointment Modal */}
      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
    </div>
  )
}
