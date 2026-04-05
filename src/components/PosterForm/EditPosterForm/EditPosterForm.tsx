import { useState, useEffect } from '@my-react/hooks';
import { useNavigate } from '@my-react/router-dom/hooks';
import { getDevelopers, getComplexesByDeveloper } from '../../../services/complex';
import { updatePoster } from '../../../services/posters'; // предположительно есть такой сервис
import type { CreatePosterField, StepValidationResult } from '../validation';
import { validateStep } from '../validation';
import {
  INITIAL_CREATE_POSTER_FORM,
  TOTAL_CREATE_POSTER_STEPS,
  type CreatePosterFormData,
  type CreatePosterStep,
  type UploadedImage,
} from '../../../types/posterCreate';
import type { ApartmentDetails } from '../../../types';
import styles from '../PosterForm.module.css';
import {
  collectErrorsUpToStep,
  FEATURE_OPTIONS,
  HOUSING_OPTIONS,
  mapToPayload,
  ROOM_COUNT_TO_ROOM_LABEL,
  ROOM_OPTIONS,
  STEP_ERROR_FIELDS,
  STEP_TITLES,
} from '../common';
import { OpenStreetMapPicker, type LeafletAddressSuggestion } from '../OpenStreetMapPicker/OpenStreetMapPicker';
import { Field } from '../Field/Field';

// ---- вспомогательные функции и типы ----
function normalizeAddressForCompare(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

interface AddressSuggestionCandidate {
  typedAddress: string;
  suggestion: LeafletAddressSuggestion;
}

interface AddressLookupState {
  query: string;
  recognized: boolean;
}

// ---- преобразование данных из API в форму ----
function apartmentDetailsToFormData(poster: ApartmentDetails): CreatePosterFormData {
  const images = poster.images.map((img, idx) => ({
    name: img.img_url.split('/').pop() || img.img_url,
    previewUrl: img.img_url,
    file: null,
    order: idx,
  }));

  const features = poster.facilities?.map((val) => val.alias) ?? [];

  return {
    housingType: poster.category.alias,
    address: poster.city + (poster?.district ? ', '+ poster.district: '') +', '+poster.address,
    floor: poster.flat.floor.toString(),
    floorCount: poster.floor_count.toString(),
    flatNumber: poster.flat.flat_number.toString(),
    complex: poster.company?.id?.toString() || '',
    complexName: poster.company?.company_name || '', 
    roomCount: ROOM_COUNT_TO_ROOM_LABEL[poster.flat.flat_category],
    area: poster.area.toString(),
    images,
    features,
    description: poster.description,
    price: poster.price.toString(),
  };
}

interface EditPosterFormProps {
  poster: ApartmentDetails;
}

export function EditPosterForm({ poster }: EditPosterFormProps) {
  const navigate = useNavigate();

  // ---- состояния для формы и валидации ----
  const [form, setForm] = useState<CreatePosterFormData>(INITIAL_CREATE_POSTER_FORM);
  const [formDraft] = useState<CreatePosterFormData>({ ...INITIAL_CREATE_POSTER_FORM });
  const [errors, setErrors] = useState<Partial<Record<CreatePosterField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    poster.building_geo ? { latitude: poster.building_geo.lat, longitude: poster.building_geo.lon } : null
  );
  const [isPublished, setIsPublished] = useState(false);
  const [updatedAlias, setUpdatedAlias] = useState<string | null>(null);

  // ---- состояния для застройщиков и ЖК ----
  const [developers, setDevelopers] = useState<{ developer_id: number; developer_name: string }[]>([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  const [developersError, setDevelopersError] = useState<string | null>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<number | null>(null);
  const [complexes, setComplexes] = useState<{ id: number; company_name: string }[]>([]);
  const [isLoadingComplexes, setIsLoadingComplexes] = useState(false);
  const [complexesError, setComplexesError] = useState<string | null>(null);
  const [isDeveloperMenuOpen, setIsDeveloperMenuOpen] = useState(false);
  const [isComplexMenuOpen, setIsComplexMenuOpen] = useState(false);

  // ---- состояния для адреса ----
  const [isAddressManualInput, setIsAddressManualInput] = useState(false);
  const [addressSuggestionCandidate, setAddressSuggestionCandidate] = useState<AddressSuggestionCandidate | null>(null);
  const [addressLookupState, setAddressLookupState] = useState<AddressLookupState | null>(null);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [addressConfirmationError, setAddressConfirmationError] = useState<string | null>(null);

  // ---- фотографии ----
  const [draggingPhotoIndex, setDraggingPhotoIndex] = useState<number | null>(null);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);

  // ---- все шаги видны сразу (редактирование) ----
  const visibleSteps = TOTAL_CREATE_POSTER_STEPS;
  const [validatedUpToStep] = useState(TOTAL_CREATE_POSTER_STEPS); // все шаги уже «пройдены»

  // ---- загрузка списка застройщиков ----
  useEffect(() => {
    setIsLoadingDevelopers(true);
    getDevelopers()
      .then((data) => {
        setDevelopers(data.developers || []);
        setDevelopersError(null);
      })
      .catch(() => setDevelopersError('Ошибка загрузки списка застройщиков'))
      .finally(() => setIsLoadingDevelopers(false));
  }, []);

  // ---- загрузка ЖК при выборе застройщика ----
  useEffect(() => {
    if (selectedDeveloperId == null) {
      setComplexes([]);
      setComplexesError(null);
      return;
    }
    setIsLoadingComplexes(true);
    getComplexesByDeveloper(selectedDeveloperId)
      .then((data) => {
        setComplexes(data.utility_companies || []);
        setComplexesError(null);
      })
      .catch(() => setComplexesError('Ошибка загрузки списка ЖК'))
      .finally(() => setIsLoadingComplexes(false));
  }, [selectedDeveloperId]);

  // ---- инициализация формы данными из poster ----
  useEffect(() => {
    const initialData = apartmentDetailsToFormData(poster);
    // заполняем formDraft и form
    Object.assign(formDraft, initialData);
    setForm({ ...formDraft });

    // устанавливаем выбранного застройщика (если есть)
    if (poster.company?.id) {
      setSelectedDeveloperId(poster.company.id);
    }
    // если есть координаты – оставляем
    if (poster.building_geo) {
      setCoordinates({ latitude: poster.building_geo.lat, longitude: poster.building_geo.lon });
    }
    // сбрасываем подтверждение адреса (адрес уже есть)
    setIsAddressConfirmed(true);
  }, [poster]);

  // ---- синхронизация complex при загрузке списка ЖК ----
  useEffect(() => {
    if (complexes.length > 0 && form.complex) {
      const exists = complexes.some((c) => c.id.toString() === form.complex);
      if (!exists) {
        // если сохранённый ЖК не найден в списке – сбрасываем
        updateField('complex', '');
      }
    }
  }, [complexes]);

  // ---- обновление поля формы ----
  const updateField = (field: Exclude<CreatePosterField, 'features' | 'images'>, value: string) => {
    formDraft[field] = value;
    setForm({ ...formDraft });
    if (errors[field]) {
      const nextErrors = { ...errors };
      delete nextErrors[field];
      setErrors(nextErrors);
    }
  };

  // ---- выбор застройщика ----
  const onSelectDeveloper = (developerId: number | null) => {
    setSelectedDeveloperId(developerId);
    const developerName = developerId == null
      ? ''
      : developers.find((d) => d.developer_id === developerId)?.developer_name || '';
    updateField('complexName', developerName);
    // сбрасываем выбранный ЖК
    updateField('complex', '');
    setIsDeveloperMenuOpen(false);
    setIsComplexMenuOpen(false);
  };

  // ---- выбор ЖК ----
  const onSelectComplex = (complexId: string) => {
    updateField('complex', complexId);
    setIsComplexMenuOpen(false);
  };

  // ---- обработка адреса ----
  const onAddressInput = (value: string) => {
    setIsAddressManualInput(true);
    setIsAddressConfirmed(false);
    setAddressConfirmationError(null);
    setAddressSuggestionCandidate(null);
    setAddressLookupState(null);
    updateField('address', value);
  };

  const onAddressPickedFromMap = (value: string) => {
    setIsAddressManualInput(false);
    setIsAddressConfirmed(false);
    setAddressConfirmationError(null);
    setAddressSuggestionCandidate(null);
    setAddressLookupState(null);
    updateField('address', value);
  };

  const onResolveTypedAddress = (query: string, suggestion: LeafletAddressSuggestion | null) => {
    const normalizedCurrent = normalizeAddressForCompare(formDraft.address);
    const normalizedQuery = normalizeAddressForCompare(query);
    if (!normalizedCurrent || normalizedCurrent !== normalizedQuery) return;

    if (!suggestion?.fullAddress.trim()) {
      setAddressLookupState({ query, recognized: false });
      setAddressSuggestionCandidate(null);
      setIsAddressConfirmed(false);
      return;
    }

    const normalizedTyped = normalizeAddressForCompare(query);
    const normalizedLeaflet = normalizeAddressForCompare(suggestion.fullAddress);

    if (!normalizedLeaflet || normalizedTyped === normalizedLeaflet) {
      setAddressLookupState({ query, recognized: true });
      setAddressSuggestionCandidate(null);
      setIsAddressConfirmed(false);
      return;
    }

    setAddressConfirmationError(null);
    setIsAddressConfirmed(false);
    setAddressLookupState({ query, recognized: true });
    setAddressSuggestionCandidate({
      typedAddress: query,
      suggestion,
    });
  };

  const confirmAddress = () => {
    if (!addressSuggestionCandidate) return;
    setAddressConfirmationError(null);
    setIsAddressConfirmed(true);
    setAddressLookupState({ query: addressSuggestionCandidate.suggestion.fullAddress, recognized: true });
    updateField('address', addressSuggestionCandidate.suggestion.fullAddress);
  };

  // ---- особенности (features) ----
  const toggleFeature = (featureValue: string) => {
    const hasFeature = formDraft.features.includes(featureValue);
    const nextFeatures = hasFeature
      ? formDraft.features.filter((v) => v !== featureValue)
      : [...formDraft.features, featureValue];
    formDraft.features = nextFeatures;
    setForm({ ...formDraft });
    if (errors.features) {
      const nextErrors = { ...errors };
      delete nextErrors.features;
      setErrors(nextErrors);
    }
  };

  // ---- работа с фотографиями (drag&drop, порядок) ----
  const appendPhotos = async (files: File[]) => {
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isAllowedType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isAllowedSize = file.size <= 10 * 1024 * 1024;
      return isAllowedType && isAllowedSize;
    });

    if (validFiles.length === 0) {
      setErrors({ ...errors, images: 'Можно загрузить только JPEG/PNG до 10 Мб' });
      return;
    }

    const uploaded: UploadedImage[] = [];
    for (const file of validFiles) {
      uploaded.push({
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        file,
      });
    }

    formDraft.images = [...formDraft.images, ...uploaded];
    setForm({ ...formDraft });

    const nextErrors = { ...errors };
    delete nextErrors.images;
    setErrors(nextErrors);
  };

  const onPhotoInput = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    await appendPhotos(files);
    e.target.value = '';
  };

  const onUploadDragEnter = (e: any) => {
    e.preventDefault();
    setIsUploadDragActive(true);
  };

  const onUploadDragOver = (e: any) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsUploadDragActive(true);
  };

  const onUploadDragLeave = (e: any) => {
    e.preventDefault();
    setIsUploadDragActive(false);
  };

  const onUploadDrop = async (e: any) => {
    e.preventDefault();
    setIsUploadDragActive(false);
    const files = Array.from(e.dataTransfer?.files || []) as File[];
    await appendPhotos(files);
  };

  const onPhotoDragStart = (index: number) => setDraggingPhotoIndex(index);
  const onPhotoDragEnd = () => setDraggingPhotoIndex(null);
  const onPhotoDragOver = (e: any) => e.preventDefault();

  const onPhotoDrop = (targetIndex: number, e: any) => {
    e.preventDefault();
    if (draggingPhotoIndex === null || draggingPhotoIndex === targetIndex) {
      setDraggingPhotoIndex(null);
      return;
    }
    const nextImages = [...formDraft.images];
    const [moved] = nextImages.splice(draggingPhotoIndex, 1);
    nextImages.splice(targetIndex, 0, moved);
    formDraft.images = nextImages;
    setForm({ ...formDraft });
    setDraggingPhotoIndex(null);
  };

  const removePhoto = (indexToRemove: number, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const nextImages = formDraft.images.filter((_, idx) => idx !== indexToRemove);
    formDraft.images = nextImages;
    setForm({ ...formDraft });
    setDraggingPhotoIndex(null);
  };

  const openPhotoDialog = () => {
    document.getElementById('photoUpload')?.click();
  };

  // ---- валидация и сохранение ----
  const applyValidation = (validation: StepValidationResult) => {
    setErrors(validation.errors);
    return validation.isValid;
  };

  const onSubmit = async () => {
    // дополнительная валидация адреса для редактирования
    let addressError: string | null = null;
    const normalizedCurrent = normalizeAddressForCompare(form.address);
    const isLookupActual =
      !!addressLookupState &&
      normalizeAddressForCompare(addressLookupState.query) === normalizedCurrent;
    const hasAddressToConfirm =
      !!addressSuggestionCandidate &&
      normalizeAddressForCompare(form.address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress);

    if (!isLookupActual || !addressLookupState?.recognized) {
      addressError = 'Укажите корректный адрес';
    } else if (hasAddressToConfirm && !isAddressConfirmed) {
      addressError = 'Подтвердите адрес, чтобы сохранить объявление';
    }

    setAddressConfirmationError(addressError);
    if (addressError) {
      setErrors({ ...errors, address: addressError });
      return;
    }

    const validation = validateStep(TOTAL_CREATE_POSTER_STEPS, formDraft);
    if (!applyValidation(validation)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = mapToPayload(formDraft, coordinates);
      const response = await updatePoster(poster.alias, payload);
      setUpdatedAlias(response.alias || poster.alias);
      setIsPublished(true);
    // } catch (error: any) {
    //   setSubmitError(error?.message || 'Не удалось сохранить изменения');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- успешное сохранение ----
  if (isPublished) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <h2 className={styles.successTitle}>Объявление обновлено</h2>
          <p>Изменения сохранены и доступны для просмотра.</p>
          <div className={styles.nav}>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              type="button"
              onClick={() => navigate('/')}
            >
              На главную
            </button>
            {updatedAlias && (
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                type="button"
                onClick={() => navigate(`/posters/${updatedAlias}`)}
              >
                Открыть объявление
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- основной рендер (все шаги видны) ----
  const addressFieldErrors = addressConfirmationError === 'Укажите корректный адрес'
    ? { ...errors, address: addressConfirmationError }
    : errors;

  // собираем ошибки для текущего шага (всех)
  const cumulativeErrors = collectErrorsUpToStep(visibleSteps, formDraft);
  const fieldsUpToCurrentStep = (Array.from({ length: visibleSteps }, (_, i) => i + 1) as CreatePosterStep[])
    .flatMap((step) => STEP_ERROR_FIELDS[step]);
  const currentStepErrorMessages = fieldsUpToCurrentStep
    .map((field) => cumulativeErrors[field])
    .filter((msg): msg is string => !!msg);
  if (addressConfirmationError) currentStepErrorMessages.push(addressConfirmationError);
  const hasCurrentStepErrors = validatedUpToStep >= visibleSteps && currentStepErrorMessages.length > 0;

  const selectedDeveloperName = selectedDeveloperId == null
    ? ''
    : developers.find((d) => d.developer_id === selectedDeveloperId)?.developer_name || '';
  const selectedComplexName = form.complex
    ? complexes.find((c) => c.id === Number(form.complex))?.company_name || ''
    : '';

  return (
    <div className={styles.container}>
      {/* Шаг 1: Тип жилья и адрес */}
      <div className={`${styles.grid} ${styles.stepSection}`}>
        <div className={styles.fullWidth}>
          <h3 className={styles.sectionTitle}>{`Шаг 1: ${STEP_TITLES[0]}`}</h3>
        </div>
        <div className={`${styles.group} ${styles.fullWidth}`}>
          <label className={styles.label}>Тип жилья</label>
          <div className={`${styles.housingTypeGroup} ${errors.housingType ? styles.choiceGroupError : ''}`}>
            {Object.entries(HOUSING_OPTIONS).map(([key, option]) => (
              <button
                key={key}
                type="button"
                className={`${styles.housingTypeButton} ${form.housingType === key ? styles.housingTypeButtonActive : ''}`}
                onClick={() => updateField('housingType', key)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.fullWidth}>
          <OpenStreetMapPicker
            key="osm-picker"
            address={form.address}
            onPickAddress={onAddressPickedFromMap}
            onPickCoordinates={(lat, lng) => setCoordinates({ latitude: lat, longitude: lng })}
            onResolveTypedAddress={onResolveTypedAddress}
          />
        </div>
        <div className={styles.fullWidth}>
          <Field
            field="address"
            label="Адрес"
            value={form.address}
            errors={addressFieldErrors}
            onChange={(_, value) => onAddressInput(value)}
            showErrorText={false}
            placeholder="Например: Москва, ул. Ленина, 10"
          />
          {addressSuggestionCandidate &&
            normalizeAddressForCompare(form.address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress) && (
              <div className={`${styles.addressSuggestion} ${addressConfirmationError === 'Подтвердите адрес, чтобы перейти к следующему шагу' ? styles.addressSuggestionError : ''}`}>
                <p className={styles.addressSuggestionTitle}>Мы определили адрес. Подтвердите, что это ваш адрес:</p>
                <div className={styles.addressSuggestionGrid}>
                  {addressSuggestionCandidate.suggestion.city && <span>Город: {addressSuggestionCandidate.suggestion.city}</span>}
                  {addressSuggestionCandidate.suggestion.district && <span>Район: {addressSuggestionCandidate.suggestion.district}</span>}
                  {addressSuggestionCandidate.suggestion.street && <span>Улица: {addressSuggestionCandidate.suggestion.street}</span>}
                  {addressSuggestionCandidate.suggestion.house && <span>Дом: {addressSuggestionCandidate.suggestion.house}</span>}
                </div>
                <div className={styles.addressSuggestionValue}>{addressSuggestionCandidate.suggestion.fullAddress}</div>
                <div className={styles.addressSuggestionActions}>
                  <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={confirmAddress}>
                    Да, это мой адрес
                  </button>
                  {isAddressConfirmed && <span className={styles.addressConfirmedBadge}>Адрес подтвержден</span>}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Шаг 2: Этаж, этажность, номер, застройщик, ЖК */}
      <div className={`${styles.grid} ${styles.stepTwoRow} ${styles.stepSection}`}>
        <div className={styles.fullWidth}>
          <h3 className={styles.sectionTitle}>{`Шаг 2: ${STEP_TITLES[1]}`}</h3>
        </div>
        <Field key="field-floor" field="floor" label="Этаж квартиры" value={form.floor} errors={errors} onChange={updateField} />
        <Field  key="field-floorCount"  field="floorCount" label="Этажей в доме" value={form.floorCount} errors={errors} onChange={updateField}/>
        <Field  key="field-flatNumber"   field="flatNumber" label="Номер квартиры" value={form.flatNumber} errors={errors} onChange={updateField} />

        {/* Застройщик */}
        <div className={`${styles.group} ${styles.stepSelectGroup}`}>
          <label className={styles.label}>Застройщик</label>
          <div className={styles.customSelect} data-custom-select="developer">
            <button
              type="button"
              className={`${styles.customSelectButton} ${errors.complexName ? styles.selectError : ''} ${isDeveloperMenuOpen ? styles.customSelectButtonOpen : ''}`}
              disabled={isLoadingDevelopers}
              onClick={() => setIsDeveloperMenuOpen(!isDeveloperMenuOpen)}
            >
              <span className={`${styles.customSelectValue} ${selectedDeveloperName ? '' : styles.customSelectPlaceholder}`}>
                {selectedDeveloperName || 'Выберите застройщика'}
              </span>
              <span className={styles.stepSelectArrow}>▾</span>
            </button>
            {isDeveloperMenuOpen && (
              <div className={styles.customSelectMenu}>
                <button
                  type="button"
                  className={`${styles.customSelectOption} ${!selectedDeveloperName ? styles.customSelectOptionActive : ''}`}
                  onClick={() => onSelectDeveloper(null)}
                >
                  Выберите застройщика
                </button>
                {developers.map((dev) => (
                  <button
                    key={dev.developer_id}
                    type="button"
                    className={`${styles.customSelectOption} ${selectedDeveloperId === dev.developer_id ? styles.customSelectOptionActive : ''}`}
                    onClick={() => onSelectDeveloper(dev.developer_id)}
                  >
                    {dev.developer_name}
                  </button>
                ))}
                {!isLoadingDevelopers && developers.length === 0 && <div className={styles.customSelectEmpty}>Список застройщиков пуст</div>}
              </div>
            )}
          </div>
          {isLoadingDevelopers && <span className={styles.selectHint}>Загружаем список застройщиков...</span>}
          {developersError && <span className={styles.error}>{developersError}</span>}
          {errors.complexName && <span className={styles.error}>{errors.complexName}</span>}
        </div>

        {/* Жилой комплекс */}
        <div className={`${styles.group} ${styles.stepSelectGroup}`}>
          <label className={styles.label}>ЖК</label>
          <div className={styles.customSelect} data-custom-select="complex">
            <button
              type="button"
              className={`${styles.customSelectButton} ${errors.complex ? styles.selectError : ''} ${isComplexMenuOpen ? styles.customSelectButtonOpen : ''}`}
              disabled={isLoadingComplexes || selectedDeveloperId == null}
              onClick={() => setIsComplexMenuOpen(!isComplexMenuOpen)}
            >
              <span className={`${styles.customSelectValue} ${selectedComplexName ? '' : styles.customSelectPlaceholder}`}>
                {selectedComplexName || (selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК')}
              </span>
              <span className={styles.stepSelectArrow}>▾</span>
            </button>
            {isComplexMenuOpen && (
              <div className={styles.customSelectMenu}>
                <button
                  type="button"
                  className={`${styles.customSelectOption} ${!selectedComplexName ? styles.customSelectOptionActive : ''}`}
                  onClick={() => onSelectComplex('')}
                >
                  {selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК'}
                </button>
                {complexes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.customSelectOption} ${form.complex === String(c.id) ? styles.customSelectOptionActive : ''}`}
                    onClick={() => onSelectComplex(String(c.id))}
                  >
                    {c.company_name}
                  </button>
                ))}
                {!isLoadingComplexes && selectedDeveloperId != null && complexes.length === 0 && (
                  <div className={styles.customSelectEmpty}>Для этого застройщика пока нет ЖК</div>
                )}
              </div>
            )}
          </div>
          {isLoadingComplexes && <span className={styles.selectHint}>Загружаем список ЖК...</span>}
          {complexesError && <span className={styles.error}>{complexesError}</span>}
          {errors.complex && <span className={styles.error}>{errors.complex}</span>}
        </div>
      </div>

      {/* Шаг 3: Комнаты и площадь */}
      <div className={`${styles.grid} ${styles.stepThreeRow} ${styles.stepSection}`}>
        <div className={styles.fullWidth}>
          <h3 className={styles.sectionTitle}>{`Шаг 3: ${STEP_TITLES[2]}`}</h3>
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Всего комнат</label>
          <div className={`${styles.roomCountGroup} ${errors.roomCount ? styles.choiceGroupError : ''}`}>
            {ROOM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.roomCountButton} ${form.roomCount === option ? styles.roomCountButtonActive : ''}`}
                onClick={() => updateField('roomCount', option)}
              >
                {option === '0' ? 'Студия' : option}
              </button>
            ))}
          </div>
        </div>
        <Field field="area" key='area' label="Площадь (м²)" value={form.area} errors={errors} onChange={updateField} />
      </div>

      {/* Шаг 4: Фотографии */}
      <div className={`${styles.group} ${styles.stepSection}`}>
        <h3 className={styles.sectionTitle}>{`Шаг 4: ${STEP_TITLES[3]}`}</h3>
        <div
          className={`${styles.uploadBox} ${isUploadDragActive ? styles.uploadBoxDragActive : ''} ${errors.images ? styles.choiceGroupError : ''}`}
          onDragEnter={onUploadDragEnter}
          onDragOver={onUploadDragOver}
          onDragLeave={onUploadDragLeave}
          onDrop={onUploadDrop}
        >
          <div className={styles.uploadControls}>
            <input id="photoUpload" className={styles.fileInput} type="file" accept="image/jpeg,image/png" multiple onChange={onPhotoInput} />
            <button type="button" className={styles.uploadButton} onClick={openPhotoDialog}>Загрузите фото</button>
            <span className={styles.uploadHint}>или перетащите JPEG, PNG до 10 Мб каждый</span>
          </div>
          {form.images.length > 0 && (
            <div className={styles.photoThumbGrid}>
              {form.images.map((image, idx) => (
                <div
                  key={`photo-${idx}`}
                  className={`${styles.photoThumb} ${draggingPhotoIndex === idx ? styles.photoThumbDragging : ''}`}
                  draggable
                  onDragStart={() => onPhotoDragStart(idx)}
                  onDragEnd={onPhotoDragEnd}
                  onDragOver={onPhotoDragOver}
                  onDrop={(e: any) => onPhotoDrop(idx, e)}
                >
                  {idx === 0 && <span className={styles.mainPhotoBadge}>Главное фото</span>}
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoOverlayText}>Удерживайте, чтобы перетащить</span>
                    <button type="button" className={styles.photoRemoveButton} onClick={(e: any) => removePhoto(idx, e)}>x</button>
                  </div>
                  <img src={image.previewUrl} alt={image.name} draggable="false" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Шаг 5: Особенности, описание, цена */}
      <div className={`${styles.group} ${styles.stepSection}`}>
        <h3 className={styles.sectionTitle}>{`Шаг 5: ${STEP_TITLES[4]}`}</h3>
        <label className={styles.label}>Особенности квартиры</label>
        <div className={`${styles.featureGrid} ${errors.features ? styles.choiceGroupError : ''}`}>
          {FEATURE_OPTIONS.map((feature) => (
            <button
              key={feature.value}
              type="button"
              className={`${styles.housingTypeButton} ${form.features.includes(feature.value) ? styles.housingTypeButtonActive : ''}`}
              onClick={() => toggleFeature(feature.value)}
            >
              {feature.label}
            </button>
          ))}
        </div>
        <label className={styles.label} htmlFor="description">Описание объявления</label>
        <textarea
          id="description"
          className={`${styles.textarea} ${styles.descTextarea} ${errors.description ? styles.textareaError : ''}`}
          placeholder="Опишите преимущества квартиры, инфраструктуру и условия сделки"
          value={form.description}
          onInput={(e: any) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
            updateField('description', target.value);
          }}
        >
          {form.description}
        </textarea>
        <div className={styles.priceFieldWrap}>
          <Field field="price" key='price' label="Цена (руб)" value={form.price} errors={errors} onChange={updateField} />
        </div>
        {submitError && <div className={styles.submitError}>{submitError}</div>}
      </div>
      <div className={styles.nav}>
        <div className={styles.nextButtonWrap}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          {hasCurrentStepErrors && (
            <div className={styles.errorHintWrap}>
              <span className={styles.errorHintIcon}>!</span>
              <div className={styles.errorHintPopup}>
                {currentStepErrorMessages.map((msg, i) => (
                  <div key={`error-${i}`}>{msg}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}