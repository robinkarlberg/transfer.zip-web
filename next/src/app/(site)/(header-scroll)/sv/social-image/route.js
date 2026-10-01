import { ImageResponse } from "next/og"

const size = { width: 1200, height: 630 }
export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "60px 64px",
          color: "white",
          background: "linear-gradient(150deg, #155dfc 0%, #2b7fff 55%, #8ec5ff 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 720 }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Transfer.zip</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 68, fontSize: 76, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-3px" }}>
            <span>Skicka stora filer.</span>
            <span>Enkelt.</span>
          </div>
          <div style={{ marginTop: 32, fontSize: 32 }}>Snabb och säker fildelning.</div>
        </div>
        <svg width="360" height="400" viewBox="0 0 360 400" style={{ position: "absolute", right: 48, top: 94 }}>
          <path d="M24 132 338 18 238 318 170 202Z" fill="white" />
          <path d="m170 202 168-184-100 300Z" fill="#dbeafe" />
          <path d="M170 202 338 18 145 229Z" fill="#8ec5ff" />
          <path d="m145 229 25-27 18 99Z" fill="white" />
          <path d="M38 300h72l24 24v70H38Z" fill="white" />
          <path d="M110 300v24h24" fill="#dbeafe" />
          <path d="M56 346h58v32H56Z" fill="none" stroke="#2b7fff" strokeWidth="5" />
          <path d="m56 375 17-16 12 10 12-12 17 18" fill="none" stroke="#2b7fff" strokeWidth="5" />
        </svg>
      </div>
    ),
    size,
  )
}
