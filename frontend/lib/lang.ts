// English section lives under /en. Everything else is Arabic (RTL).
export function isEnglishPath(pathname: string | null | undefined): boolean {
  return !!pathname && (pathname === "/en" || pathname.startsWith("/en/"));
}
