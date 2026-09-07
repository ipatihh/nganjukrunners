"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const sliderImages = [
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCB1s4r4C4qF1L-MZHhvEU37kXocI6TR0jSQNjPjBvGsaYSSiAyHJ407E5ooeRsfPeh7kEdMBtZIjrJxKkTl5etZS8ObCysBPlF24HU_v0s87Eit_ggVLcWKgcTW9jaOt2HGTScn9yV29FmohDhlk2-u6VtxT4VF0DfYUGoU3t3KFph3I5qaJYeYcxVmE/s5472/IMG_4342.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQeAhUNlFGJK0Zeu7T3bkoyf3zOqG4EgSl0e0QpzWKKHvwZ32HH2vFi32VtHkDqQerHLsLL45vQgvMyMXPcyg_xNYgKDV_HYxDRhSmvwwcX0M1wPrbE0bgHTGo17oETA83_1uPOjT-v5HIcqBQP3wLPw0RVIi99eqzF63myGwKwe4LOxPLFpZHGzjjz_U/s5472/IMG_7606.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiE6pTY8R8CsnY-vHkWbNNNK1C8xjee5pdM1jtlGxGxwQMDTmGH4Df9b6LOfThfRXvG7Q3KOSFGc-hk1X64oZ-KYcpMs4XQpXVwZvZJ3JGujR5g2JXxJKlhdV4AP9zP0xzZ6MmsV6kNQhvFjAQ4c5XMn9vWPgzt9uJS0v-NTDHSgwT_DItH2Bfiz5E2YnI/s6048/PLA_6573.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHg2W6NhUeBOySzkW2b6PgwWvlTQs5-VWFBAaqN-Ku9btOVkabqlQo08gvnzhNw5nIpO_jGMI3H03EHAkLFJCUf3nUu2OR_KEsF3IQSJHsqV2LZdI3tK3TfvgnjBG4pFxxXy7ARRHG5bmQZvB-osQQyJFRvy74vY7AiiNd5WRMLxUQHD3EoSXQAcCdu28/s6000/PLA07458.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjBAE3jp1vtV1ZnP_3epGEL4DawWrzKjUXdxRVCzeE1zImbPn_ktfOc-dHHO4yz3v_8a8u-kV-bm0NHrbvGJOQyWVoDNlIFsjYQ-1n4qL0J_fAI3B9qVTZyAt_PaW9O2sahBcY-jSjbhSlCDSOSSck6ZRgHmRTvW6wEpPBW19cGb_8fK3Ps-Aw2lGVz1q4/s6000/PLA06740.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQxNjt1lxWylEutch7cA6A04m3RMu9-GL3M5q_80DMJbsOHGx0kW7Drbu_EidDWGPgd6vteWzEZ4CiQtyoVosdpa6swcEWHHBkiBQ-q9CczVGJaWzXAmw1vjCsEATQ85mek-HLZBzivBK3pPtrZkiyPZ2Dwa7n0Y82AvGxPe5dVkznu1Bro5HuoXSME3w/s5472/IMG_0885.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiarmrK0i-2Rx8S4zvc43y2RVfXW3YTY06RtF19PKMGRikZ8Z-HEUosX3qyFMBJjSVbjgEq4gIzbfQFpNIg2LwGMl1xcrUoJ7r3JvBI8SVF3NwnttzQWPMk8090dF6ZVYJ4RmKzu5jQTY-vvyA1W4gzZ2_Am1ueh67sIpmbMACFO4tTQAO5Vk60on2saJU/s4288/WIM_8223.jpeg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg7B6-4zV_C0mMRauZwUFOyEen_jfF-J4yPIacB2r9Wqx-J0E8swsruavuFqBLf4Lir5sBWjgxQC2eJrO6Bp6uzm0_QR1UorX8ippuLUqqkl3mjbquZ5MxiSO0_vb7J9n5W7896ZludaRmrZjm9oXrap0mm67kmn8B6F830pGOCn8jDXEb_yb1imxcW4V0/s8064/IMG_1540.jpeg",
];

export default function HeroSlider() {
  return (
    <section id="hero" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#fbfbfb] text-neutral-900 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Text Grid */}
        <div className="w-full lg:w-1/2 text-left order-2 lg:order-1 flex flex-col justify-center">
          <span className="text-sky-500 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-4">
            Nganjuk Runners Community
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 italic tracking-tight uppercase">
            Lari Bareng, <br className="hidden sm:inline" />
            <span className="text-neutral-500 font-normal">Seduluran</span> <br />
            Selawase.
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 mb-8 max-w-md leading-relaxed">
            Komunitas lari terbesar di Nganjuk. Mari ciptakan jejak sehat di setiap sudut Kota Angin bersama kami.
          </p>
          <div className="flex gap-4">
            <Link
              href="/registrasi"
              className="inline-block bg-sky-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all hover:bg-sky-600 active:scale-95 text-center transition-all"
            >
              Gabung Sekarang
            </Link>
            <Link
              href="/anggota"
              className="inline-block border border-neutral-200 text-neutral-900 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 text-center"
            >
              Lihat Anggota
            </Link>
          </div>
        </div>

        {/* Right Slider */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <div className="relative w-full h-[300px] sm:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.05)] border border-neutral-100 bg-neutral-50">
            <Swiper
              loop={true}
              grabCursor={true}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                bulletClass: "swiper-pagination-bullet !bg-neutral-300 !opacity-50",
                bulletActiveClass: "swiper-pagination-bullet-active !bg-sky-500 !opacity-100 !w-6 !rounded-md transition-all duration-300",
              }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              modules={[Autoplay, EffectFade, Pagination, Navigation]}
              className="w-full h-full hero-swiper"
            >
              {sliderImages.map((src, index) => (
                <SwiperSlide key={index} className="w-full h-full relative">
                  <Image
                    src={src}
                    alt={`NJR Photo ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover w-full h-full select-none"
                    priority={index === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
