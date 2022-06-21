export type ServiceInfo = { direction: string, nextDay: boolean }

export function runSmarts(service: string[]): ServiceInfo {
  // Todo: this probably won't cut it ;)
  return {
    direction: "no-idea",
    nextDay: true
  }
}
