import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';

const ImageSlider = () => {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/listings', { params: { limit: 6, sort: 'popular' } });
        const rows = res?.data?.items || res?.data || [];
        setItems(Array.isArray(rows) ? rows : []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const slides = useMemo(() => items.map((l) => {
    const media = Array.isArray(l?.media) ? l.media : [];
    const img = media[0]?.url || '';
    return { id: l.id, img, price: l.priceAmount, currency: l.currency };
  }), [items]);

  return (
    <section className="py-2 bg-[var(--main-bg-color)] text-[var(--main-text-color)]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif text-center mb-6 text-[var(--bc)]">
          {t('Find the best deals')}
        </h2>

        {loading ? (
          <div className="w-full flex justify-center py-10">
            <span className="loading loading-spinner text-[var(--bc)] w-10 h-10" />
          </div>
        ) : slides.length > 0 ? (
          <div className="carousel mx-auto rounded-2xl shadow overflow-hidden w-[90vw] h-[22vh] sm:w-[80vw] sm:h-[26vh] md:w-[70vw] md:h-[30vh] lg:w-[60vw] lg:h-[35vh] xl:w-[50vw] xl:h-[38vh]">
            {slides.map((s, index) => {
              const prevIndex = (index - 1 + slides.length) % slides.length;
              const nextIndex = (index + 1) % slides.length;
              return (
                <div
                  id={`slide${index + 1}`}
                  key={s.id}
                  className="carousel-item relative w-full"
                >
                  {s.img ? (
                    <img src={s.img} alt={`listing-${s.id}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-base-200 flex items-center justify-center">{t('No Image')}</div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 pb-4">
                    <div className="badge badge-sm md:badge-md opacity-95">{s.price} {s.currency}</div>
                    <a className="btn btn-primary" href={`/listings/${s.id}`}>{t('View Listing')}</a>
                  </div>
                  <div className="absolute left-2 right-2 top-1/2 flex -translate-y-1/2 transform justify-between">
                    <a href={`#slide${prevIndex + 1}`} className="btn btn-circle">❮</a>
                    <a href={`#slide${nextIndex + 1}`} className="btn btn-circle">❯</a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-64 bg-base-200 rounded-2xl flex items-center justify-center">{t('No listings')}</div>
        )}
      </div>
    </section>
  );
};

export default ImageSlider;
