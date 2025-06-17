export const IS_DEV = process.env.NODE_ENV == "development"

export const resp = (json) => {
  if (typeof (json) === "string") {
    return { success: false, message: json }
  }
  else {
    return { success: true, ...json }
  }
}

export const createCookieParams = () => {
  return (
    { domain: process.env.COOKIE_DOMAIN, httpOnly: true, secure: !IS_DEV, sameSite: "strict", expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000) }
  )
}

export const fetchScreenshot = async (url) => {
  try {
    const response = await fetch(`${process.env.BOT_API_URL}/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);
    return data
  } catch (error) {
    return resp(error.message);
  }
}