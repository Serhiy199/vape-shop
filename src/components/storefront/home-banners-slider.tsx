"use client";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type HomeBanner = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
};

export function HomeBannersSlider({ banners }: { banners: HomeBanner[] }) {
  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="home-banners-slider" aria-label="Промо-банери">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        navigation
        pagination={{
          clickable: true,
        }}
        grabCursor
        watchOverflow
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
        }}
        className="home-banners-slider__swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <a
              href={banner.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="home-banners-slider__card"
              aria-label={banner.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt={banner.title} />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
