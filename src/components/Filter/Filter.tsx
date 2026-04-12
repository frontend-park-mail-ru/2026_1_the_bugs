import { useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
import style from './Filter.module.css';
import type { IFilters } from 'src/types';

interface FilterProps {
    onClose: () => void;
    onOpenMore: () => void;
    onApply: (filters: IFilters) => void;
    setFilters: (filters: IFilters) => void;
    initialFilters?: IFilters;
}

const propertyTypes: { label: string; alias: string }[] = [
    { label: 'Квартира', alias: 'flat' },
    { label: 'Дом', alias: 'house' },
    { label: 'Апартаменты', alias: 'apartments' },
];
const roomOptions = ['0','1', '2', '3', '4', '5', '6+'];

export function Filter({ onClose, onOpenMore, onApply, initialFilters, setFilters }: FilterProps) {
    const [selectedType, setSelectedType] = useState(initialFilters?.category ?? '');
    const [selectedRoom, setSelectedRoom] = useState(
        initialFilters?.room_count != null
            ? (initialFilters.room_count >= 6 ? '6+' : String(initialFilters.room_count))
            : ''
    );
    const [minPrice, setMinPrice] = useState(
        initialFilters?.min_price != null ? String(initialFilters.min_price) : ''
    );
    const [maxPrice, setMaxPrice] = useState(
        initialFilters?.max_price != null ? String(initialFilters.max_price) : ''
    );

    // Кнопка сброса фильтров
    const handleReset = () => {
        setSelectedType('');
        setSelectedRoom('');
        setMinPrice('');
        setMaxPrice('');
        setFilters({
            category: undefined,
            room_count: undefined,
            min_price: undefined,
            max_price: undefined,
            min_square: undefined,
            max_square: undefined,
            min_flat_floor: undefined,
            max_flat_floor: undefined,
            min_building_floor: undefined,
            max_building_floor: undefined,
            facilities: undefined,
            not_first_floor: undefined,
            not_last_floor: undefined,
        });
    };

    const toNumberOrUndefined = (value: string): number | undefined => {
        if (!value) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : undefined;
    };

    const handleSave = () => {
        const minPriceValue = (document.getElementById('filter-min-price') as HTMLInputElement | null)?.value ?? '';
        const maxPriceValue = (document.getElementById('filter-max-price') as HTMLInputElement | null)?.value ?? '';
        const activeType = document.querySelector(`.${style.chip}.${style.chipActive}`) as HTMLElement | null;
        const activeRoom = document.querySelector(`.${style.roomChip}.${style.chipActive}`) as HTMLElement | null;

        const typeAlias = activeType?.dataset.typeAlias || undefined;
        const roomValue = activeRoom?.dataset.room || '';
        const roomNum = roomValue ? (roomValue === '6+' ? 6 : Number(roomValue)) : undefined;
        onApply({
            category: typeAlias,
            room_count: roomNum != null && !Number.isNaN(roomNum) ? roomNum : undefined,
            min_price: toNumberOrUndefined(minPriceValue),
            max_price: toNumberOrUndefined(maxPriceValue),
        });
        onClose();
    };

    return (
        <section className={style.panel}>
            <section className={style.section}>
                <Button 
                    variant="secondary" 
                    type="button" 
                    className={style.resetBtn} 
                    onClick={handleReset}
                    text="Сбросить фильтры"
                />
                <br/>
            </section>
            
            <section className={style.section}>
                <h3 className={style.sectionTitle}>Тип объекта</h3>
                <div className={style.chips}>
                    {propertyTypes.map(({ label, alias }) => (
                        <button
                            key={alias}
                            type="button"
                            data-type-alias={alias}
                            className={`${style.chip} ${selectedType === alias ? style.chipActive : ''}`}
                            onClick={() => setSelectedType(selectedType === alias ? '' : alias)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            <section className={style.section}>
                <h3 className={style.sectionTitle}>Цена</h3>
                <div className={style.priceRow}>
                    <label className={style.field}>
                        <span>от</span>
                        <input id="filter-min-price" type="number" className={style.input} value={minPrice} onInput={(e: any) => setMinPrice(e.target.value)} placeholder="0" />
                        <strong>₽</strong>
                    </label>

                    <label className={style.field}>
                        <span>до</span>
                        <input id="filter-max-price" type="number" className={style.input} value={maxPrice} onInput={(e: any) => setMaxPrice(e.target.value)} placeholder="∞" />
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
                            shape='round'
                            type="button"
                            data-room={room}
                            className={`${style.roomChip} ${selectedRoom === room ? style.chipActive : ''}`}
                            onClick={() => setSelectedRoom(selectedRoom === room ? '' : room)}
                            text={room}
                        />
                    ))}
                </div>
            </section>

            <div className={style.actions}>
                <Button type="button" variant="accent" className={style.saveBtn} onClick={handleSave} text="Сохранить" />
                или
                <Button variant="none" type="button" className={style.advancedBtn} onClick={onOpenMore} text="расширенные фильтры" />

            </div>
        </section>
    );
}