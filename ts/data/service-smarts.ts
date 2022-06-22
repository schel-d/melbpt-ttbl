import { Service } from "./timetable"

export type ServiceInfo = { direction: string, nextDay: boolean }

export function runSmarts(service: Service): ServiceInfo {
  // Todo: this probably won't cut it ;)
  return {
    direction: "no-idea",
    nextDay: service.nextDay
  }
}
