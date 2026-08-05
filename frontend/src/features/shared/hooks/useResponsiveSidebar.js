import { useState } from "react"

export function useResponsiveSidebar() {
  const [menuOpen, setMenuOpen] =
    useState(false)

  const openMenu = () =>
    setMenuOpen(true)

  const closeMenu = () =>
    setMenuOpen(false)

  const toggleMenu = () =>
    setMenuOpen((current) => !current)

  return {
    menuOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}