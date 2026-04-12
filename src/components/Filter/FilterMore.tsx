import { useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
import style from './FilterMore.module.css';
import type { IFilters } from 'src/types';

interface FilterMoreProps {
  onClose: () => void;
  onApply: (filters: IFilters) => void;
  initialFilters?: IFilters;
}

const propertyTypes: { label: string; alias: string }[] = [
  { label: 'Квартира', alias: 'flat' },
  { label: 'Дом', alias: 'house' },
  { label: 'Апартаменты', alias: 'apartments' },
];
const roomOptions = ['1', '2', '3', '4', '5', '6+'];
const amenities: { label: string; alias: string }[] = [
  { label: 'Wi-Fi', alias: 'wifi' },
  { label: 'Стиральная машина', alias: 'washing-machine' },
  { label: 'Посудомоечная машина', alias: 'dishwasher' },
  { label: 'Парковка', alias: 'parking' },
  { label: 'Кондиционер', alias: 'conditioner' },
  { label: 'Лифт', alias: 'elevator' },
];
const floorFlags = ['Не первый', 'Не последний'];

export function FilterMore({ onClose, onApply, initialFilters }: FilterMoreProps) {
  const [selectedType, setSelectedType] = useState(initialFilters?.category ?? '');
  const [selectedRooms, setSelectedRooms] = useState(
    initialFilters?.room_count != null
      ? (initialFilters.room_count >= 6 ? '6+' : String(initialFilters.room_count))
      : ''
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters?.facilities ?? []);
  const [selectedFloorFlags, setSelectedFloorFlags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(initialFilters?.min_price != null ? String(initialFilters.min_price) : '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.max_price != null ? String(initialFilters.max_price) : '');
  const [minSquare, setMinSquare] = useState(initialFilters?.min_square != null ? String(initialFilters.min_square) : '');
  const [maxSquare, setMaxSquare] = useState(initialFilters?.max_square != null ? String(initialFilters.max_square) : '');
  const [minFlatFloor, setMinFlatFloor] = useState(initialFilters?.min_flat_floor != null ? String(initialFilters.min_flat_floor) : '');
  const [maxFlatFloor, setMaxFlatFloor] = useState(initialFilters?.max_flat_floor != null ? String(initialFilters.max_flat_floor) : '');
  const [minBuildingFloor, setMinBuildingFloor] = useState(
    initialFilters?.min_building_floor != null ? String(initialFilters.min_building_floor) : ''
  );
  const [maxBuildingFloor, setMaxBuildingFloor] = useState(
    initialFilters?.max_building_floor != null ? String(initialFilters.max_building_floor) : ''
  );

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== name));
      return;
    }

    setSelectedAmenities([...selectedAmenities, name]);
  };

  const toggleFloorFlag = (name: string) => {
    if (selectedFloorFlags.includes(name)) {
      setSelectedFloorFlags(selectedFloorFlags.filter((item) => item !== name));
      return;
    }

    setSelectedFloorFlags([...selectedFloorFlags, name]);
  };

  const toNumberOrUndefined = (value: string): number | undefined => {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const handleSave = () => {
    const roomCount = selectedRooms
      ? (selectedRooms === '6+' ? 6 : Number(selectedRooms))
      : undefined;

    onApply({
      category: selectedType || undefined,
      room_count: roomCount,
      min_price: toNumberOrUndefined(minPrice),
      max_price: toNumberOrUndefined(maxPrice),
      min_square: toNumberOrUndefined(minSquare),
      max_square: toNumberOrUndefined(maxSquare),
      min_flat_floor: toNumberOrUndefined(minFlatFloor),
      max_flat_floor: toNumberOrUndefined(maxFlatFloor),
      min_building_floor: toNumberOrUndefined(minBuildingFloor),
      max_building_floor: toNumberOrUndefined(maxBuildingFloor),
      facilities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      not_first_floor: selectedFloorFlags.includes('Не первый') || undefined,
      not_last_floor: selectedFloorFlags.includes('Не последний') || undefined,
    });
    onClose();
  };

  return (
    <section className={style.panel}>
      <section className={style.section}>
        <h3 className={style.title}>Тип объекта</h3>
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
        <h3 className={style.title}>Цена</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="number" className={style.input} value={minPrice} onInput={(e: any) => setMinPrice(e.target.value)} />
            <strong>₽</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="number" className={style.input} value={maxPrice} onInput={(e: any) => setMaxPrice(e.target.value)} />
            <strong>₽</strong>
          </label>
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Всего комнат</h3>
        <div className={style.chips}>
          {roomOptions.map((room) => (
            <Button
              key={room}
              variant='none'
              type="button"
              className={`${style.roomChip} ${selectedRooms === room ? style.chipActive : ''}`}
              onClick={() => setSelectedRooms(room)}
              text={room}
            />
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Площадь</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="number" className={style.input} value={minSquare} onInput={(e: any) => setMinSquare(e.target.value)} />
            <strong>м²</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="number" className={style.input} value={maxSquare} onInput={(e: any) => setMaxSquare(e.target.value)} />
            <strong>м²</strong>
          </label>
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Удобства</h3>
        <div className={style.chips}>
          {amenities.map((name) => (
            <Button
              key={name}
              variant='none'
              type="button"
              className={`${style.chip} ${selectedAmenities.includes(name) ? style.chipActive : ''}`}
              onClick={() => toggleAmenity(name)}
              text={name}
            />
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этаж</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="number" className={style.input} value={minFlatFloor} onInput={(e: any) => setMinFlatFloor(e.target.value)} />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="number" className={style.input} value={maxFlatFloor} onInput={(e: any) => setMaxFlatFloor(e.target.value)} />
          </label>

          {floorFlags.map((item) => (
            <Button
              key={item}
              variant='none'
              type="button"
              className={`${style.chip} ${selectedFloorFlags.includes(item) ? style.chipActive : ''}`}
              onClick={() => toggleFloorFlag(item)}
              text={item}
            />
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этажей в доме</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="number" className={style.input} value={minBuildingFloor} onInput={(e: any) => setMinBuildingFloor(e.target.value)} />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="number" className={style.input} value={maxBuildingFloor} onInput={(e: any) => setMaxBuildingFloor(e.target.value)} />
          </label>
        </div>
      </section>

      <div className={style.actions}>
        <Button variant="accent" type="button" className={style.saveBtn} onClick={onClose} text="Сохранить" />
      </div>
    </section>
  );
}
