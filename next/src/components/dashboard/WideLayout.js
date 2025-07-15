import Main from "@/components/dashboard/Main";

export default function ({ children }) {
  return (
    <Main size={"none"}>
      {children}
    </Main>
  )
}