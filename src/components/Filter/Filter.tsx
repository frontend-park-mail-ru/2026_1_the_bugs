import { useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
import style from './Filter.module.css';
import type { IFilters } from 'src/types';

interface FilterProps {
    onClose: () => void;
    onOpenMore: () => void;
    onApply: (filters: IFilters) => void;
    initialFilters?: IFilters;
}

const propertyTypes: { label: string; alias: string }[] = [
    { label: 'Квартира', alias: 'flat' },
    { label: 'Дом', alias: 'house' },
    { label: 'Апартаменты', alias: 'apartments' },
];
const roomOptions = ['1', '2', '3', '4', '5', '6+'];

export function Filter({ onClose, onOpenMore, onApply, initialFilters }: FilterProps) {
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

    const handleSave = () => {
        const roomNum = selectedRoom
            ? (selectedRoom === '6+' ? 6 : parseInt(selectedRoom, 10))
            : undefined;
        const minPriceNum = minPrice ? parseInt(minPrice, 10) : undefined;
        const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : undefined;
        onApply({
            category: selectedType || undefined,
            room_count: roomNum != null && !Number.isNaN(roomNum) ? roomNum : undefined,
            min_price: minPriceNum != null && !Number.isNaN(minPriceNum) ? minPriceNum : undefined,
            max_price: maxPriceNum != null && !Number.isNaN(maxPriceNum) ? maxPriceNum : undefined,
        });
        onClose();
    };

    return (
        <section className={style.panel}>

            <section className={style.section}>
                <h3 className={style.sectionTitle}>Тип объекта</h3>
                <div className={style.chips}>
                    {propertyTypes.map(({ label, alias }) => (
                        <button
                            key={alias}
                            type="button"
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
                        <input type="number" className={style.input} value={minPrice} onInput={(e: any) => setMinPrice(e.target.value)} placeholder="0" />
                        <strong>₽</strong>
                    </label>

                    <label className={style.field}>
                        <span>до</span>
                        <input type="number" className={style.input} value={maxPrice} onInput={(e: any) => setMaxPrice(e.target.value)} placeholder="∞" />
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