import { useState } from 'the-react/hooks';
import style from './Filter.module.css';

interface FilterProps {
    onClose: () => void;
    onOpenMore: () => void;
}

const propertyTypes = ['Квартира', 'Комната', 'Койко-место', 'Дом/дача', 'Коттедж', 'Таунхаус'];
const roomOptions = ['1', '2', '3', '4', '5', '6+'];

export function Filter({ onClose, onOpenMore }: FilterProps) {
    const [selectedType, setSelectedType] = useState('Квартира');
    const [selectedRoom, setSelectedRoom] = useState('2');
    const [minPrice, setMinPrice] = useState('35000');
    const [maxPrice, setMaxPrice] = useState('65000');

    return (
        <section className={style.panel}>

            <section className={style.section}>
                <h3 className={style.sectionTitle}>Тип объекта</h3>
                <div className={style.chips}>
                    {propertyTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={`${style.chip} ${selectedType === type ? style.chipActive : ''}`}
                            onClick={() => setSelectedType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </section>

            <section className={style.section}>
                <h3 className={style.sectionTitle}>Цена</h3>
                <div className={style.priceRow}>
                    <label className={style.field}>
                        <span>от</span>
                        <input type="text" className={style.input} value={minPrice} onInput={(e: any) => setMinPrice(e.target.value)} />
                        <strong>₽</strong>
                    </label>

                    <label className={style.field}>
                        <span>до</span>
                        <input type="text" className={style.input} value={maxPrice} onInput={(e: any) => setMaxPrice(e.target.value)} />
                        <strong>₽</strong>
                    </label>
                </div>
            </section>

            <section className={style.section}>
                <h3 className={style.sectionTitle}>Всего комнат</h3>
                <div className={style.rooms}>
                    {roomOptions.map((room) => (
                        <button
                            key={room}
                            type="button"
                            className={`${style.roomChip} ${selectedRoom === room ? style.chipActive : ''}`}
                            onClick={() => setSelectedRoom(room)}
                        >
                            {room}
                        </button>
                    ))}
                </div>
            </section>

            <div className={style.actions}>
                <button type="button" className={style.saveBtn} onClick={onClose}>
                    Сохранить
                </button>
                или
                <button type="button" className={style.advancedBtn} onClick={onOpenMore}>
                    расширенные фильтры
                </button>
            </div>
        </section>
    );
}