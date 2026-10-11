import { beforeEach, describe, expect, it, vi } from "vitest"
import { LANGUAGE_HEADER, PATH_HEADER } from "@/lib/i18n/language"

const { state, auth } = vi.hoisted(() => ({ state: {}, auth: vi.fn() }))
vi.mock("next/headers", () => ({
  headers: async () => new Headers(state.headers),
  cookies: async () => ({ get: () => state.cookie ? { value: state.cookie } : undefined }),
}))
vi.mock("react", () => ({ cache: fn => fn }))
vi.mock("@/lib/server/wrappers/auth", () => ({ useServerAuth: auth }))
import { getLanguage } from "@/lib/server/language"

beforeEach(() => {
  state.headers = {}
  state.cookie = undefined
  auth.mockReset().mockResolvedValue(null)
})

describe("server language precedence", () => {
  it("keeps public pages independent of the account, without looking up the session", async () => {
    state.headers = { [PATH_HEADER]: "/", [LANGUAGE_HEADER]: "en" }
    state.cookie = "sv"
    auth.mockResolvedValue({ user: { language: "sv" } })
    expect(await getLanguage()).toBe("en")
    expect(auth).not.toHaveBeenCalled()
  })

  it.each(["/app/settings", "/onboarding-pro", "/onboarding-team", "/team-paused"])("uses account preferences on %s", async path => {
    state.headers = { [PATH_HEADER]: path, [LANGUAGE_HEADER]: "en" }
    auth.mockResolvedValue({ user: { language: "sv" } })
    expect(await getLanguage()).toBe("sv")
  })

  it("uses the requested language for an older account without a preference", async () => {
    state.headers = { [PATH_HEADER]: "/app", [LANGUAGE_HEADER]: "sv" }
    auth.mockResolvedValue({ user: {} })
    expect(await getLanguage()).toBe("sv")
  })

  it("uses a shared link's language without querying the sender or receiver's account", async () => {
    state.headers = { [PATH_HEADER]: "/transfer/example", [LANGUAGE_HEADER]: "sv" }
    state.cookie = "en"
    expect(await getLanguage()).toBe("sv")
    expect(auth).not.toHaveBeenCalled()
  })
})
