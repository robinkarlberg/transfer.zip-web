import { AB_TEST_COOKIE_PREFIX } from "../abtests";

async function getCookieServer(name, cookies) {
  return cookies.get(name)
}

/**
 * Used by clients
 * @param {*} name 
 */
export async function getAbTestServer(test, cookies) {
  try {
    return (await getCookieServer(`${AB_TEST_COOKIE_PREFIX}${test.name}`, cookies))?.value
  }
  catch {
    // fail silently
    return null
  }
}

export function abTest(test, req, res) {
  const { name, variants } = test
  const cookieName = `${AB_TEST_COOKIE_PREFIX}${name}`
  let variant = req.cookies.get(cookieName);
  if (!variant) {
    const random = Math.random();
    let cumulativeChance = 0;
    for (const variantOption of variants) {
      cumulativeChance += variantOption.chance;
      if (random < cumulativeChance) {
        variant = variantOption.value;
        break;
      }
    }
  }

  // Floating point rounding can make the last boundary slightly below 1 (e.g., 0.9999999999999999)
  // Won't happen (?) but I'll guard against it anyway (!)
  if (!variant) variant = variants[0]

  if (!req.cookies.get(cookieName)) {
    res.cookies.set(cookieName, variant, {
      httpOnly: false,  // allow clients to read it (for umami events etc.)
      secure: !(process.env.NODE_ENV == "development"),
      sameSite: "lax",
      path: "/",
      maxAge: test.age
    })
  }
  return variant;
}