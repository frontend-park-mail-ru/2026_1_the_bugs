import { useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
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
            <input type="text" className={style.input} placeholder="" />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
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
            <input type="text" className={style.input} placeholder="" />
          </label>

          <label className={style.field}>
            <span>До</span>
            <input type="text" className={style.input} placeholder="" />
          </label>
        </div>
      </section>

      <div className={style.actions}>
        <Button variant="accent" type="button" className={style.saveBtn} onClick={onClose} text="Сохранить" />
      </div>
    </section>
  );
}
