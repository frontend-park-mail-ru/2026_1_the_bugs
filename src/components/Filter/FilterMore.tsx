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
const roomOptions = ['0','1', '2', '3', '4', '5', '6+'];
const amenities: { label: string; alias: string }[] = [
    { alias: 'wifi', label: 'Wi-Fi' },
    { alias: 'parking', label: 'Парковка' },
    { alias: 'conditioner', label: 'Кондиционер' },
    { alias: 'dishwasher', label: 'Посудомойка' },
    { alias: 'elevator', label: 'Лифт' },
    { alias: 'concierge', label: 'Консьерж' },
    { alias: 'tv', label: 'Телевизор' },
    { alias: 'fridge', label: 'Холодильник' },
    { alias: 'microwave', label: 'Микроволновка' },
    { alias: 'stove', label: 'Электроплита' },
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
    const readInput = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
    const activeType = document.querySelector(`.${style.chip}[data-type-alias].${style.chipActive}`) as HTMLElement | null;
    const activeRoom = document.querySelector(`.${style.roomChip}.${style.chipActive}`) as HTMLElement | null;
    const selectedAmenityNodes = document.querySelectorAll(`.${style.chip}[data-amenity-alias].${style.chipActive}`);
    const selectedFloorNodes = document.querySelectorAll(`.${style.chip}[data-floor-flag].${style.chipActive}`);

    const roomValue = activeRoom?.dataset.room || '';
    const roomCount = roomValue ? (roomValue === '6+' ? 6 : Number(roomValue)) : undefined;
    const selectedAmenitiesFromDom = Array.from(selectedAmenityNodes)
      .map((node) => (node as HTMLElement).dataset.amenityAlias)
      .filter((value): value is string => Boolean(value));
    const selectedFloorFlagsFromDom = Array.from(selectedFloorNodes)
      .map((node) => (node as HTMLElement).dataset.floorFlag)
      .filter((value): value is string => Boolean(value));

    onApply({
      category: activeType?.dataset.typeAlias || undefined,
      room_count: roomCount,
      min_price: toNumberOrUndefined(readInput('filter-more-min-price')),
      max_price: toNumberOrUndefined(readInput('filter-more-max-price')),
      min_square: toNumberOrUndefined(readInput('filter-more-min-square')),
      max_square: toNumberOrUndefined(readInput('filter-more-max-square')),
      min_flat_floor: toNumberOrUndefined(readInput('filter-more-min-flat-floor')),
      max_flat_floor: toNumberOrUndefined(readInput('filter-more-max-flat-floor')),
      min_building_floor: toNumberOrUndefined(readInput('filter-more-min-building-floor')),
      max_building_floor: toNumberOrUndefined(readInput('filter-more-max-building-floor')),
      facilities: selectedAmenitiesFromDom.length > 0 ? selectedAmenitiesFromDom : undefined,
      not_first_floor: selectedFloorFlagsFromDom.includes('not_first_floor') || undefined,
      not_last_floor: selectedFloorFlagsFromDom.includes('not_last_floor') || undefined,
    });
    onClose();
  };

  return (
    <section className={style.panel}>
      <section className={style.section}>
        <h3 className={style.title}>Тип объекта</h3>
        <div className={style.chips}>
          {propertyTypes.map(({ label, alias }) => (
            <Button
              key={alias}
              variant='none'
              type="button"
              data-type-alias={alias}
              className={`${style.chip} ${selectedType === alias ? style.chipActive : ''}`}
              onClick={() => setSelectedType(selectedType === alias ? '' : alias)}
              text={label}
            />
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Цена</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input id="filter-more-min-price" type="number" className={style.input} value={minPrice} onInput={(e: any) => setMinPrice(e.target.value)} />
            <strong>₽</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input id="filter-more-max-price" type="number" className={style.input} value={maxPrice} onInput={(e: any) => setMaxPrice(e.target.value)} />
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
              data-room={room}
              className={`${style.roomChip} ${selectedRooms === room ? style.chipActive : ''}`}
              onClick={() => setSelectedRooms(selectedRooms === room ? '' : room)}
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
            <input id="filter-more-min-square" type="number" className={style.input} value={minSquare} onInput={(e: any) => setMinSquare(e.target.value)} />
            <strong>м²</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input id="filter-more-max-square" type="number" className={style.input} value={maxSquare} onInput={(e: any) => setMaxSquare(e.target.value)} />
            <strong>м²</strong>
          </label>
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Удобства</h3>
        <div className={style.chips}>
          {amenities.map(({ label, alias }) => (
            <Button
              key={alias}
              variant='none'
              type="button"
              data-amenity-alias={alias}
              className={`${style.chip} ${selectedAmenities.includes(alias) ? style.chipActive : ''}`}
              onClick={() => toggleAmenity(alias)}
              text={label}
            />
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этаж</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input id="filter-more-min-flat-floor" type="number" className={style.input} value={minFlatFloor} onInput={(e: any) => setMinFlatFloor(e.target.value)} />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input id="filter-more-max-flat-floor" type="number" className={style.input} value={maxFlatFloor} onInput={(e: any) => setMaxFlatFloor(e.target.value)} />
          </label>

          {floorFlags.map((item) => (
            <button
              key={item}
              variant='none'
              type="button"
              data-floor-flag={item === 'Не первый' ? 'not_first_floor' : 'not_last_floor'}
              className={`${style.chip} ${selectedFloorFlags.includes(item) ? style.chipActive : ''}`}
              onClick={() => toggleFloorFlag(item)}
            > {item}</button>
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этажей в доме</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input id="filter-more-min-building-floor" type="number" className={style.input} value={minBuildingFloor} onInput={(e: any) => setMinBuildingFloor(e.target.value)} />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input id="filter-more-max-building-floor" type="number" className={style.input} value={maxBuildingFloor} onInput={(e: any) => setMaxBuildingFloor(e.target.value)} />
          </label>
        </div>
      </section>

      <div className={style.actions}>
        <Button variant="accent" type="button" className={style.saveBtn} onClick={handleSave} text="Сохранить" />
      </div>
    </section>
  );
}
