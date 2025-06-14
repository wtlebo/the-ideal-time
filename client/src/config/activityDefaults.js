export const activityDefaults = {
  carDriving: {
    displayName: 'Classic Car Driving',
    relevantFactors: {
      tide: false,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [60, 90],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 15],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 75],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 5],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: false
  },
  cookout: {
    displayName: 'Cookout',
    relevantFactors: {
      tide: false,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [65, 90],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 10],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 28],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 10],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [1020, 1200], // 5:00 PM to 8:00 PM
    requireDaylight: false
  },
  hiking: {
    displayName: 'Hiking',
    relevantFactors: {
      tide: false,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [50, 80],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 20],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 100],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 15],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [480, 1080], // 8:00 AM to 6:00 PM
    requireDaylight: false
  },
  kayaking: {
    displayName: 'Kayaking',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [5, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [75, 100],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 10],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 80],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 20],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: true
  },
  motorboating: {
    displayName: 'Motorboating',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [6, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [60, 100],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 15],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 90],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 30],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: true
  },
  paddleboarding: {
    displayName: 'Paddleboarding',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [5, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [60, 110],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 8],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 80],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 40],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: true
  },
  polarplunging: {
    displayName: 'Polar Plunging',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [7, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [10, 120],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 15],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 100],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 50],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: false
  },
  running: {
    displayName: 'Running',
    relevantFactors: {
      tide: false,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [20, 80],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 15],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 100],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 20],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: false
  },
  sailing: {
    displayName: 'Sailing',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [40, 100],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [10, 30],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 80],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 30],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: true
  },
  starGazing: {
    displayName: 'Star Gazing',
    relevantFactors: {
      tide: false,
      temperature: false,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [50, 100],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 20],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 10],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 10],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [1260, 1439], // 9:00 PM to 11:59 PM
    requireDaylight: false
  },
  sunbathing: {
    displayName: 'Sunbathing',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [-2, 15],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [70, 100],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [0, 20],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 25],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 10],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [600, 1020], // 10:00 AM to 5:00 PM
    requireDaylight: false
  },
  surfing: {
    displayName: 'Surfing',
    relevantFactors: {
      tide: true,
      temperature: true,
      windSpeed: true,
      skyCover: true,
      precipChance: true,
      daylight: true
    },
    tideMin: -2,
    tideMax: 15,
    tideRange: [4, 10],
    temperatureMin: 0,
    temperatureMax: 120,
    temperatureRange: [50, 90],
    windSpeedMin: 0,
    windSpeedMax: 40,
    windSpeedRange: [5, 20],
    skyCoverMin: 0,
    skyCoverMax: 100,
    skyCoverRange: [0, 100],
    precipChanceMin: 0,
    precipChanceMax: 100,
    precipChanceRange: [0, 20],
    daylightMin: 0, // 12:00 AM
    daylightMax: 1439, // 11:59 PM
    daylightRange: [360, 1200], // 6:00 AM to 8:00 PM
    requireDaylight: true
  }
};
