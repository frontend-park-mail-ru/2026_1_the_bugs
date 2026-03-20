import { useState } from "@my-react/hooks";
import type { UtilityCompany } from "src/types";
import style from "./UtilCard.module.css"

interface UtilCardProps {
    alias: string;
    utilityCompany?: UtilityCompany;
}

export function UtilCard ({ alias, utilityCompany }: UtilCardProps) {
    const images = utilityCompany?.photos
        ? [...utilityCompany.photos]
              .sort((a, b) => a.order - b.order)
              .map((photo) => photo.img_url)
              .filter(Boolean)
        : [];
    const hasImages = images.length > 0;
    const companyAlias = utilityCompany?.alias || alias;
    const companyName = utilityCompany?.company_name || "Застройщик";
    const companyAddress = utilityCompany?.address || "Адрес уточняется";
    const companyPhone = utilityCompany?.phone || "Телефон уточняется";
    const companyGeo = utilityCompany?.geo;

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
                {hasImages ? (
                    <div
                        className={style.sliderTrack}
                        style={{ transform: `translateX(calc(${activeIndex} * -1 * (82% + 18px)))` }}
                    >
                        {images.map((image, index) => (
                            <figure className={style.imageCard} key={`utility-image-${index}`}>
                                <img
                                    src={image}
                                    alt={`ЖК ${companyAlias}: фото ${index + 1}`}
                                    draggable="false"
                                />
                            </figure>
                        ))}
                    </div>
                ) : (
                    <figure className={style.imageCard}>
                        <p className={`${style.emptyPhotoMessage} fontHero`}>Нет фото</p>
                    </figure>
                )}
            </div>

            {hasImages && activeIndex > 0 && (
                <div className={`${style.navButtonWrap} ${style.prev}`}>
                    <button className={style.navButton} type="button" aria-label="Предыдущее фото" onClick={goPrev}>
                        <img className={style.arrowIcon} src="/svg/arrow.svg" alt="" aria-hidden="true" draggable="false" />
                    </button>
                </div>
            )}

            {hasImages && activeIndex < images.length - 1 && (
                <div className={`${style.navButtonWrap} ${style.next}`}>
                    <button className={style.navButton} type="button" aria-label="Следующее фото" onClick={goNext}>
                        <img className={`${style.arrowIcon} ${style.arrowRight}`} src="/svg/arrow.svg" alt="" aria-hidden="true" draggable="false" />
                    </button>
                </div>
            )}
        </div>

        <div className={style.content}>
            <article className={style.descriptionCard}>
                <h1 className="fontHero">ЖК {companyAlias}</h1>
                <p className="fontHero">
                    Адрес комплекса: {companyAddress}
                </p>
                <p className="fontHero">
                    Контактный телефон: {companyPhone}
                </p>
                {companyGeo && (
                    <p className="fontHero">
                        Координаты: {companyGeo.lat}, {companyGeo.lon}
                    </p>
                )}
            </article>

            <aside className={style.sideInfo}>
                <article className={style.sideCard}>
                    <img
                        className={style.developerLogo}
                        src={utilityCompany?.avatar_url || "/svg/logo.svg"}
                        alt={`Логотип ${companyName}`}
                        draggable="false"
                    />
                    <div>
                        <p className={`${style.sideTitle} fontHero`}>{companyName}</p>
                        <p className={`${style.sideSubtitle} fontHero`}>Застройщик</p>
                    </div>
                </article>

                <article className={style.sideCard}>
                    <h2 className="fontHero">Информация о ЖК</h2>
                    <ul>
                        <li className="fontHero">Alias: {companyAlias}</li>
                        <li className="fontHero">Адрес: {companyAddress}</li>
                        <li className="fontHero">Телефон: {companyPhone}</li>
                        {companyGeo && (
                            <li className="fontHero">Geo: {companyGeo.lat}, {companyGeo.lon}</li>
                        )}
                    </ul>
                </article>
            </aside>
        </div>
        </div>
    )
}