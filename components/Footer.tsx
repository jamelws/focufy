"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "✅ Te has suscrito con éxito" });
        e.currentTarget.reset();
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: "❌ Error: " + error.error });
      }
    } catch (err) {
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      setMessage({ type: "error", text: errorMessage || "❌ Error desconocido" });
    }

    setTimeout(() => setMessage(null), 4000); // Oculta mensaje después de 4s
  };

  
  return (
    <footer className="bg-[#111] text-gray-300 text-sm px-6 py-20 mt-[-50] rounded-t-[50px] relative">
      <div className="max-w-6xl mx-auto">
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-10">
          <Image
            src="/focu_whitw_02w.png"
            alt="Focufy"
            className="w-[30%] max-w-none object-contain"
            width={300}
            height={100}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between flex-wrap gap-8">
          
          <div className="flex-1 min-w-[250px]">
            <p className="mb-4 font-familjen uppercase tracking-wide">
              {t("footer.newsletter")}
            </p>
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-3 w-[300px]"
            >
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t("footer.email")}
                  required
                  className="w-full bg-transparent border-b border-gray-400 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 rounded-xl p-5"
                />
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" className="accent-purple-500" />
                  {t("footer.subscribe")}
                </label>

                <button
                  type="submit"
                  className="bg-[#c5b9ff] text-black px-6 py-1 rounded-full hover:bg-purple-400 transition self-start"
                >
                  {t("footer.submit")}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Links */}
          <div className="flex-1 min-w-[150px]">
            <h6 className="font-bold mb-2 uppercase">{t("footer.quickLinks")}</h6>
            <ul className="space-y-1">
              <li><a href="#hero">{t("footer.quickLinksItems.0")}</a></li>
              <li><a href="#about">{t("footer.quickLinksItems.1")}</a></li>
              <li><a href="#somos">{t("footer.quickLinksItems.2")}</a></li>
              <li><a href="#ready">{t("footer.quickLinksItems.3")}</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="flex-1 min-w-[150px]">
            <h6 className="font-bold mb-2 uppercase">{t("footer.social")}</h6>
            <ul className="space-y-1">
              <li>{t("footer.socialItems.0")}</li>
              <li>{t("footer.socialItems.1")}</li>
              <li>{t("footer.socialItems.2")}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex-1 min-w-[150px]">
            <h6 className="font-bold mb-2 uppercase">{t("footer.contact")}</h6>            
          </div>

          {/* Policy */}
          <div className="flex-1 min-w-[150px]">
            <h6 className="font-bold mb-2 uppercase">{t("footer.policy")}</h6>
            <ul className="space-y-1">
              <li>{t("footer.policyItems.0")}</li>
              <li>{t("footer.policyItems.1")}</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
