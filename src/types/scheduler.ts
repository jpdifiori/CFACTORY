export interface DayConfig {
    count: number
    hours: string[]
}

export interface ScheduleConfig {
    workdays: DayConfig
    weekends: DayConfig
}
