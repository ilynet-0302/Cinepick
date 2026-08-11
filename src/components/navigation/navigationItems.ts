import { Bookmark, Compass, Home, Sparkles, UserRound } from "lucide-react";

export const navigationItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/pick", label: "Pick for me", icon: Sparkles },
  { to: "/library", label: "My library", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: UserRound },
];
