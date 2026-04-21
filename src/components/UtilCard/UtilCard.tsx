import type { UtilityCompany } from "src/types";
import style from "./UtilCard.module.css"
import { UtilGallery } from "./UtilGallery";
import { UtilMap } from "./UtilMap";

interface UtilCardProps {
    alias: string;
    utilityCompany: UtilityCompany;
}
/** СТарница отображения компонентов ЖК */
export function UtilCard ({ utilityCompany }: UtilCardProps) {


    return(
        <div className={style.wrapper}>
            <UtilGallery key="UtilGallery" utilityCompany={utilityCompany} />

        <div className={style.content}>
            <article className={style.descriptionCard}>
                <h1 className="fontHero">ЖК "{utilityCompany.company_name}"</h1>
                <p className="fontHero">
                    {utilityCompany?.description}
                </p>
            </article>
            <aside className={style.sideInfo}>
                <article className={`${style.sideCard} ${style.companyCard}`}>
                    <img
                        className={style.developerLogo}
                        src={utilityCompany.developer?.avatar_url || "/svg/logo.svg"}
                        alt={`Логотип ${utilityCompany.developer.developer_name}`}
                        draggable="false"
                    />
                    <div>
                        <p className={`${style.sideTitle} fontHero`}>{utilityCompany.developer.developer_name}</p>
                        <p className={`${style.sideSubtitle} fontHero`}>Застройщик</p>
                    </div>
                </article>

                <article className={style.sideCard}>
                    <h2 className="fontHero">Информация о ЖК</h2>
                    <ul>
                        <li className={`${style.infoAddress} fontHero`}>{utilityCompany.address}</li>
                        <li className={`${style.infoPhone} fontHero`}>{utilityCompany.phone}</li>
                    </ul>
                </article>
            </aside>
        </div>
                    
            <UtilMap latitude={utilityCompany.geo.lat} longitude={utilityCompany.geo.lon} />
        </div>
    )
}