"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MenuItem = {
  name: string;
  description: string;
  price: string;
  prices?: { label: string; value: string; _id?: string }[];
  badge?: "Best Seller" | "Premium" | "New";
  image?: string;
};

type Category = {
  id: string;
  title: string;
  imageLabel: string;
  image?: string;
  items: MenuItem[];
};

type Notice = {
  icon: string;
  text: string;
  order: number;
  isActive: boolean;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu", { next: { revalidate: 60 } });
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("MENU DATA IS NOT ARRAY:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("MENU LOAD ERROR:", error);
        setCategories([]);
      }
    }

    loadMenu();
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json();

        if (Array.isArray(data.notices)) {
          setNotices(
            data.notices
              .filter((item: Notice) => item.isActive !== false)
              .sort((a: Notice, b: Notice) => a.order - b.order)
          );
        }
      } catch (error) {
        console.error("SETTINGS LOAD ERROR:", error);
        setNotices([]);
      }
    }

    loadSettings();
  }, []);

  const defaultProductImage = "/product-default.jpg";

  const openingHours = [
    { day: "Monday", label: "04:00 PM - 03:00 AM" },
    { day: "Tuesday", label: "04:00 PM - 03:00 AM" },
    { day: "Wednesday", label: "04:00 PM - 04:00 AM" },
    { day: "Thursday", label: "04:00 PM - 04:00 AM" },
    { day: "Friday", label: "02:00 PM - 05:00 AM" },
    { day: "Saturday", label: "02:00 PM - 05:00 AM" },
    { day: "Sunday", label: "03:00 PM - 04:00 AM" },
  ];

  return (
    <main className="min-h-screen bg-[#5f6168] px-1 py-3 text-black sm:px-3 sm:py-6">
      <div
        id="top"
        className="mx-auto w-full max-w-[470px] rounded-[24px] bg-[#ececec] p-2 shadow-2xl ring-1 ring-black/10 sm:p-3"
      >
        <div
          className="overflow-hidden rounded-[18px] border border-black/10"
          style={{
            background:
              "linear-gradient(135deg, #efefef 0%, #e8e8e8 35%, #f5f5f5 50%, #e2e2e2 100%)",
          }}
        >
          <section className="px-4 pb-5 pt-7 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-[#b89245]" />
              <span className="text-[20px] text-[#b89245]">✦</span>
              <span className="h-px w-16 bg-[#b89245]" />
            </div>

            <h1
              className="text-[42px] leading-none text-black"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Fajka Bar
            </h1>

            <div className="mx-auto mt-5 h-px w-40 bg-[#b89245]" />

            <div className="mx-auto mt-6 max-w-[350px] rounded-[22px] border border-[#b89245]/45 bg-white/45 px-4 py-5 shadow-sm">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-14 bg-[#b89245]" />
                <span className="text-[18px] font-bold tracking-[0.32em] text-[#b89245]">
                  UWAGA
                </span>
                <span className="h-px w-14 bg-[#b89245]" />
              </div>

              <div className="space-y-4 text-left">
                {notices.map((notice, index) => (
                  <div key={index}>
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b89245]/50 text-[18px] text-[#b89245]">
                        {notice.icon}
                      </div>

                      <p
                        className="text-[14px] leading-5 text-black/80"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {notice.text}
                      </p>
                    </div>

                    {index !== notices.length - 1 && (
                      <div className="mt-4 h-px bg-[#b89245]/35" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="sticky top-0 z-20 border-y border-black/10 bg-[#ececec]/95 px-3 py-2 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto">
              <a
                href="#top"
                className="whitespace-nowrap rounded-full bg-black px-3 py-2 text-[11px] font-bold text-white"
              >
                Main Menu
              </a>

              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="whitespace-nowrap rounded-full border border-black/15 bg-white px-3 py-2 text-[11px] font-bold text-black"
                >
                  {category.title}
                </a>
              ))}

              <a
                href="#contact"
                className="whitespace-nowrap rounded-full border border-black/15 bg-white px-3 py-2 text-[11px] font-bold text-black"
              >
                Contact
              </a>
            </div>
          </section>

          <section className="px-4 pb-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="group relative block aspect-square overflow-hidden rounded-[6px] border border-black/10 bg-black shadow-md"
                >
                  <Image
                    src={category.image || defaultProductImage}
                    alt={category.title}
                    fill
                    className="object-cover opacity-100 transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 430px) 50vw, 200px"
                  />

                  <div className="absolute inset-0 bg-black/5" />

                  <div className="absolute inset-0 flex items-end justify-center p-3 text-center">
                    <span
                      className="text-[17px] font-bold uppercase leading-5 tracking-wide text-white drop-shadow-lg"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {category.imageLabel}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="space-y-4 px-3 pb-6">
            {categories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="rounded-[10px] bg-[#e7e7e7] px-2 py-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-2">
                  <h2
                    className="text-[40px] font-black leading-none text-black sm:text-[52px]"
                    style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
                  >
                    {category.title}
                  </h2>

                  <a
                    href="#top"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-semibold text-black/70 shadow-sm"
                  >
                    <span>↑</span>
                    <span>Menu</span>
                  </a>
                </div>

                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={`${category.id}-${index}`}
                      className="flex items-start gap-3 rounded-[10px] border border-black/10 bg-[#efefef] px-2 py-2 shadow-[0_1px_0_rgba(0,0,0,0.05)]"
                    >
                      <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[10px] border border-black/15 bg-white">
                        <Image
                          src={item.image || defaultProductImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="74px"
                        />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className="text-[18px] font-black leading-6 text-black"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {item.name}
                          </h3>

                          {item.badge && (
                            <span
                              className={`rounded-full px-2 py-[2px] text-[10px] font-bold uppercase ${
                                item.badge === "Premium"
                                  ? "bg-amber-500 text-white"
                                  : item.badge === "Best Seller"
                                  ? "bg-green-600 text-white"
                                  : "bg-sky-600 text-white"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-4 text-black/60">
                          {item.description}
                        </p>
                      </div>

                      <div className="min-w-[96px] shrink-0 pt-1 text-right">
                        {item.prices && item.prices.length > 0 ? (
                          <div className="flex flex-col items-end gap-1.5">
                            {item.price && (
                              <div
                                className="text-[18px] font-bold leading-none text-[#ff6d6d]"
                                style={{ fontFamily: "Georgia, serif" }}
                              >
                                {item.price}
                              </div>
                            )}

                            {item.prices.map((priceOption, priceIndex) => (
                              <div
                                key={priceOption._id || priceIndex}
                                className="flex w-[82px] items-center justify-between rounded-full border border-[#b89245]/40 bg-white px-2.5 py-1 shadow-sm"
                              >
                                <span className="text-[10px] font-black text-black/55">
                                  {priceOption.label}
                                </span>

                                <span
                                  className="text-[13px] font-bold leading-none text-[#b89245]"
                                  style={{ fontFamily: "Georgia, serif" }}
                                >
                                  {priceOption.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span
                            className="text-[18px] font-bold text-[#ff6d6d]"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {item.price}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </section>

          <section className="px-4 pb-8 text-center">
            <p
              className="mx-auto max-w-[290px] text-[14px] font-semibold leading-5"
              style={{ fontFamily: "Georgia, serif" }}
            >
              W weekendy i święta do każdego rachunku doliczamy 10% opłaty
              serwisowej.
            </p>

            <a
              href="#top"
              className="mt-4 inline-flex items-center gap-2 underline"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <span className="text-[24px] leading-none">↑</span>
              <span className="text-[22px] font-bold">Main Menu</span>
            </a>

            <a
              href="https://maps.google.com/?q=Żurawia+22+Warszawa"
              target="_blank"
              rel="noreferrer"
              className="mt-5 block overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-sm"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,#dfe7ef,#f8f8f8,#dcdcdc)] text-center text-[14px] font-semibold text-black/60">
                Tap for map & directions
              </div>
            </a>

            <div className="mt-7">
              <h3
                className="mb-4 text-[20px] font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Opening Hours
              </h3>

              <div className="space-y-2">
                {openingHours.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between rounded-[12px] border border-black/10 bg-white/80 px-4 py-3 shadow-sm"
                  >
                    <span
                      className="text-[17px] font-bold text-black"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.day}
                    </span>

                    <span className="rounded-full bg-black px-3 py-1 text-[12px] font-semibold text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="contact"
              className="mt-8 space-y-1 text-[16px] font-bold leading-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p className="text-[18px]">Get in Touch!</p>
              <p>Fajka Bar</p>
              <p>Żurawia 22, 00-515</p>
              <p>Warszawa</p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <a
                href="tel:+48000000000"
                className="inline-flex items-center gap-3 rounded-full border border-black/15 bg-white px-5 py-3 text-[15px] font-bold shadow-sm"
              >
                <span>📞</span>
                <span>Call Us</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-xl text-white shadow-sm">
                  ◎
                </div>
                <span
                  className="text-[20px] font-bold underline"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Fajka bar
                </span>
              </a>

              <a
                href="https://maps.google.com/?q=Żurawia+22+Warszawa"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-black/15 bg-black px-5 py-3 text-[15px] font-bold text-white shadow-sm"
              >
                <span>📍</span>
                <span>Get Directions</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}