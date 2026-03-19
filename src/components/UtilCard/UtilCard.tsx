import { useState } from "@my-react/hooks";
import style from "./UtilCard.module.css"

interface UtilCardProps {
    alias: string;
}

export function UtilCard ({ alias }: UtilCardProps) {
    const images = [
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const goPrev = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const goNext = () => {
        if (activeIndex < images.length - 1) {
            setActiveIndex(activeIndex + 1);
        }
    };

    return(
        <div className={style.wrapper}>
        <div className={style.gallery}>
            <div className={style.sliderViewport}>
                <div
                    className={style.sliderTrack}
                    style={{ transform: `translateX(calc(${activeIndex} * -1 * (82% + 18px)))` }}
                >
                    {images.map((image, index) => (
                        <figure className={style.imageCard} key={`utility-image-${index}`}>
                            <img
                                src={image}
                                alt={`ЖК ${alias}: фото ${index + 1}`}
                                draggable="false"
                            />
                        </figure>
                    ))}
                </div>
            </div>

            {activeIndex > 0 && (
                <div className={`${style.navButtonWrap} ${style.prev}`}>
                    <button className={style.navButton} type="button" aria-label="Предыдущее фото" onClick={goPrev}>
                        <img className={style.arrowIcon} src="/svg/arrow.svg" alt="" aria-hidden="true" draggable="false" />
                    </button>
                </div>
            )}

            {activeIndex < images.length - 1 && (
                <div className={`${style.navButtonWrap} ${style.next}`}>
                    <button className={style.navButton} type="button" aria-label="Следующее фото" onClick={goNext}>
                        <img className={`${style.arrowIcon} ${style.arrowRight}`} src="/svg/arrow.svg" alt="" aria-hidden="true" draggable="false" />
                    </button>
                </div>
            )}
        </div>

        <div className={style.content}>
            <article className={style.descriptionCard}>
                <h1 className="fontHero">ЖК {alias}</h1>
                <p className="fontHero">
                    Большой квартал с архитектурой в теплых оттенках рядом с зелеными зонами и прогулочными
                    маршрутами. До станции МЦД и выезда на ключевые магистрали можно доехать за 7-10 минут.
                </p>
                <p className="fontHero">
                    Территория комплекса закрыта от машин. На первых этажах предусмотрены кафе, аптеки,
                    магазины и сервисы для ежедневных задач. Во дворах - игровые и спортивные пространства.
                </p>
                <p className="fontHero">
                    В проекте доступны студии и квартиры с 1-3 спальнями. Есть варианты с гардеробными,
                    мастер-спальнями и увеличенными окнами с видом на зелень и город.
                </p>
            </article>

            <aside className={style.sideInfo}>
                <article className={style.sideCard}>
                    <img
                        className={style.developerLogo}
                        src="/svg/logo.svg"
                        alt="Логотип застройщика"
                        draggable="false"
                    />
                    <div>
                        <p className={`${style.sideTitle} fontHero`}>ГК «ПИК»</p>
                        <p className={`${style.sideSubtitle} fontHero`}>Застройщик</p>
                    </div>
                </article>

                <article className={style.sideCard}>
                    <h2 className="fontHero">Транспорт рядом</h2>
                    <ul>
                        <li className="fontHero">м. Зеленоград, 7 мин.</li>
                        <li className="fontHero">Кутузовское ш., 5 мин.</li>
                        <li className="fontHero">Ленинградское ш., 18 мин.</li>
                        <li className="fontHero">Белорусский вокзал, 32 мин.</li>
                    </ul>
                </article>
            </aside>
        </div>
        </div>
    )
}