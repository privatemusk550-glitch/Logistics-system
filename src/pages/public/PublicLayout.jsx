import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Header from "@/components/layout/Header"

export default function PublicLayout() {

  useEffect(() => {
    const addScript = document.createElement("script")
    addScript.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    addScript.async = true
    document.body.appendChild(addScript)

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      )
    }
  }, [])

  setTimeout(() => {
  const select = document.querySelector(".goog-te-combo")
  if (select) {
    select.value = navigator.language.split("-")[0]
    select.dispatchEvent(new Event("change"))
  }
}, 2000)


  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
