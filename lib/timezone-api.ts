export interface Country {
  name: string
  code: string
  timezone: string
  offset: number
  capital: string
}

export interface TimeZoneData {
  timezone: string
  country: string
  city: string
  offset: number
  currentTime: string
}

// Service pour récupérer les pays et fuseaux horaires
export class TimezoneService {
  private static readonly WORLD_TIME_API = "http://worldtimeapi.org/api"
  private static readonly REST_COUNTRIES_API = "https://restcountries.com/v3.1"

  // Récupérer tous les fuseaux horaires disponibles
  static async getAvailableTimezones(): Promise<string[]> {
    try {
      const response = await fetch(`${this.WORLD_TIME_API}/timezone`)
      return await response.json()
    } catch (error) {
      console.error("Erreur lors de la récupération des fuseaux horaires:", error)
      return this.getFallbackTimezones()
    }
  }

  // Récupérer l'heure actuelle pour un fuseau horaire
  static async getCurrentTime(timezone: string): Promise<TimeZoneData | null> {
    try {
      const response = await fetch(`${this.WORLD_TIME_API}/timezone/${timezone}`)
      const data = await response.json()

      return {
        timezone: data.timezone,
        country: this.extractCountryFromTimezone(timezone),
        city: this.extractCityFromTimezone(timezone),
        offset: data.utc_offset_hours || 0,
        currentTime: data.datetime,
      }
    } catch (error) {
      console.error(`Erreur pour le fuseau ${timezone}:`, error)
      return null
    }
  }

  // Rechercher des pays par nom
  static async searchCountries(query: string): Promise<Country[]> {
    try {
      const response = await fetch(`${this.REST_COUNTRIES_API}/name/${query}`)
      const countries = await response.json()

      return countries.slice(0, 10).map((country: any) => ({
        name: country.name.common,
        code: country.cca2,
        timezone: country.timezones?.[0] || "UTC",
        offset: this.calculateOffset(country.timezones?.[0]),
        capital: country.capital?.[0] || country.name.common,
      }))
    } catch (error) {
      console.error("Erreur lors de la recherche de pays:", error)
      return []
    }
  }

  // Récupérer tous les pays
  static async getAllCountries(): Promise<Country[]> {
    try {
      const response = await fetch(`${this.REST_COUNTRIES_API}/all?fields=name,cca2,timezones,capital`)
      const countries = await response.json()

      return countries
        .map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
          timezone: country.timezones?.[0] || "UTC",
          offset: this.calculateOffset(country.timezones?.[0]),
          capital: country.capital?.[0] || country.name.common,
        }))
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error("Erreur lors de la récupération des pays:", error)
      return this.getFallbackCountries()
    }
  }

  // Méthodes utilitaires privées
  private static extractCountryFromTimezone(timezone: string): string {
    const parts = timezone.split("/")
    return parts[0].replace("_", " ")
  }

  private static extractCityFromTimezone(timezone: string): string {
    const parts = timezone.split("/")
    return parts[parts.length - 1].replace("_", " ")
  }

  private static calculateOffset(timezone?: string): number {
    if (!timezone) return 0
    try {
      const date = new Date()
      const utc = date.getTime() + date.getTimezoneOffset() * 60000
      const targetTime = new Date(utc + this.getTimezoneOffset(timezone) * 3600000)
      return Math.round((targetTime.getTime() - utc) / 3600000)
    } catch {
      return 0
    }
  }

  private static getTimezoneOffset(timezone: string): number {
    // Mapping basique des fuseaux horaires courants
    const offsets: { [key: string]: number } = {
      "Europe/London": 1,
      "Europe/Paris": 2,
      "Europe/Berlin": 2,
      "Africa/Cairo": 3,
      "Europe/Moscow": 4,
      "Asia/Dubai": 5,
      "Asia/Karachi": 6,
      "Asia/Bangkok": 7,
      "Asia/Shanghai": 8,
      "Asia/Tokyo": 9,
      "Australia/Sydney": 10,
      "Pacific/Auckland": 12,
    }
    return offsets[timezone] || 0
  }

  private static getFallbackTimezones(): string[] {
    return [
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Africa/Cairo",
      "Europe/Moscow",
      "Asia/Dubai",
      "Asia/Karachi",
      "Asia/Bangkok",
      "Asia/Shanghai",
      "Asia/Tokyo",
      "Australia/Sydney",
      "Pacific/Auckland",
    ]
  }

  private static getFallbackCountries(): Country[] {
    return [
      { name: "Royaume-Uni", code: "GB", timezone: "Europe/London", offset: 1, capital: "Londres" },
      { name: "France", code: "FR", timezone: "Europe/Paris", offset: 2, capital: "Paris" },
      { name: "Allemagne", code: "DE", timezone: "Europe/Berlin", offset: 2, capital: "Berlin" },
      { name: "Égypte", code: "EG", timezone: "Africa/Cairo", offset: 3, capital: "Le Caire" },
      { name: "Russie", code: "RU", timezone: "Europe/Moscow", offset: 4, capital: "Moscou" },
      { name: "Émirats Arabes Unis", code: "AE", timezone: "Asia/Dubai", offset: 5, capital: "Dubaï" },
      { name: "Pakistan", code: "PK", timezone: "Asia/Karachi", offset: 6, capital: "Karachi" },
      { name: "Thaïlande", code: "TH", timezone: "Asia/Bangkok", offset: 7, capital: "Bangkok" },
      { name: "Chine", code: "CN", timezone: "Asia/Shanghai", offset: 8, capital: "Pékin" },
      { name: "Japon", code: "JP", timezone: "Asia/Tokyo", offset: 9, capital: "Tokyo" },
      { name: "Australie", code: "AU", timezone: "Australia/Sydney", offset: 10, capital: "Sydney" },
      { name: "Nouvelle-Zélande", code: "NZ", timezone: "Pacific/Auckland", offset: 12, capital: "Auckland" },
    ]
  }
}
