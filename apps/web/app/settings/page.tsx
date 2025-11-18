import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  description: "Personalize your Investing101 experience",
};

export default function SettingsPage() {
  redirect("/profile/settings");
}
