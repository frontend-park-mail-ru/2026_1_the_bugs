import { useState } from '@my-react/hooks';
import style from './FilterMore.module.css';

interface FilterMoreProps {
  onClose: () => void;
}

const propertyTypes = ['Квартира', 'Комната', 'Койко-место', 'Дом/дача', 'Коттедж', 'Таунхаус'];
const roomOptions = ['1', '2', '3', '4', '5', '6+'];
const amenities = ['Wi-Fi', 'Стиральная машина', 'Посудомоечная машина', 'Парковка', 'Кондиционер', 'Балкон'];
const floorFlags = ['Не первый', 'Не последний', 'Только последний'];

export function FilterMore({ onClose }: FilterMoreProps) {
  const [selectedType, setSelectedType] = useState('Квартира');
  const [selectedRooms, setSelectedRooms] = useState('2');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Wi-Fi', 'Парковка', 'Балкон']);
  const [selectedFloorFlags, setSelectedFloorFlags] = useState<string[]>([]);

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

  return (
    <section className={style.panel}>
      <section className={style.section}>
        <h3 className={style.title}>Тип объекта</h3>
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
        <h3 className={style.title}>Цена</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="text" className={style.input} placeholder="" />
            <strong>₽</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
            <strong>₽</strong>
          </label>
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Всего комнат</h3>
        <div className={style.chips}>
          {roomOptions.map((room) => (
            <button
              key={room}
              type="button"
              className={`${style.roomChip} ${selectedRooms === room ? style.chipActive : ''}`}
              onClick={() => setSelectedRooms(room)}
            >
              {room}
            </button>
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Площадь</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="text" className={style.input} placeholder="" />
            <strong>м²</strong>
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
            <strong>м²</strong>
          </label>
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Удобства</h3>
        <div className={style.chips}>
          {amenities.map((name) => (
            <button
              key={name}
              type="button"
              className={`${style.chip} ${selectedAmenities.includes(name) ? style.chipActive : ''}`}
              onClick={() => toggleAmenity(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этаж</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="text" className={style.input} placeholder="" />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
          </label>

          {floorFlags.map((item) => (
            <button
              key={item}
              type="button"
              className={`${style.chip} ${selectedFloorFlags.includes(item) ? style.chipActive : ''}`}
              onClick={() => toggleFloorFlag(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className={style.section}>
        <h3 className={style.title}>Этажей в доме</h3>
        <div className={style.inputRow}>
          <label className={style.field}>
            <span>От</span>
            <input type="text" className={style.input} placeholder="" />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
          </label>
        </div>
      </section>

      <div className={style.actions}>
        <button type="button" className={style.saveBtn} onClick={onClose}>
          Сохранить
        </button>
      </div>
    </section>
  );
}
