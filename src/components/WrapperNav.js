"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar-any-page";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const noNavbarPages = ["/"];

  if (noNavbarPages.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
