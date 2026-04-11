import { useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
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
                        <Button
                            key={type}
                            variant='none'
                            type="button"
                            className={`${style.chip} ${selectedType === type ? style.chipActive : ''}`}
                            onClick={() => setSelectedType(type)}
                            text={type}
                        />
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
                        <Button
                            key={room}
                            variant='none'
                            type="button"
                            className={`${style.roomChip} ${selectedRoom === room ? style.chipActive : ''}`}
                            onClick={() => setSelectedRoom(room)}
                            text={room}
                        />
                    ))}
                </div>
            </section>

            <div className={style.actions}>
                <Button variant="accent" type="button" className={style.saveBtn} onClick={onClose} text="Сохранить" />
                или
                <Button variant="none" type="button" className={style.advancedBtn} onClick={onOpenMore} text="расширенные фильтры" />
            </div>
        </section>
    );
}