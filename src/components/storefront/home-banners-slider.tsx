"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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

  const hasNavigation = banners.length > 1;

  return (
    <section className="home-banners-slider" aria-label="Промо-банери">
      {hasNavigation ? (
        <>
          <button
            type="button"
            className="home-banners-slider__button home-banners-slider__button--prev"
            aria-label="Попередній банер"
          >
            <ChevronLeftIcon aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className="home-banners-slider__button home-banners-slider__button--next"
            aria-label="Наступний банер"
          >
            <ChevronRightIcon aria-hidden="true" className="size-5" />
          </button>
        </>
      ) : null}
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        navigation={
          hasNavigation
            ? {
                nextEl: ".home-banners-slider__button--next",
                prevEl: ".home-banners-slider__button--prev",
              }
            : false
        }
        pagination={{
          clickable: true,
        }}
        grabCursor
        watchOverflow
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 8,
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
