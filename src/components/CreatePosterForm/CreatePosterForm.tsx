import { useState, useEffect } from '@my-react/hooks';
import type * as React from 'react';
import { getDevelopers, getComplexesByDeveloper } from '../../services/complex';
import { useNavigate } from '@my-react/router-dom/hooks';
import { createPoster } from '../../services/posters';
import type { CreatePosterField, StepValidationResult } from './validation';
import { validateStep } from './validation';
import {
  INITIAL_CREATE_POSTER_FORM,
  TOTAL_CREATE_POSTER_STEPS,
  type CreatePosterFormData,
  type CreatePosterPayload,
  type CreatePosterStep,
  type UploadedImage
} from '../../types/posterCreate';
import styles from './CreatePosterForm.module.css';
import { OpenStreetMapPicker, type LeafletAddressSuggestion } from './OpenStreetMapPicker';

const STEP_TITLES = [
  'Тип и адрес',
  'Этаж и ЖК',
  'Комнаты и площадь',
  'Фотографии',
  'Особенности и цена'
];

const HOUSING_OPTIONS = ['Квартира'];
const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6+'];
const FEATURE_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'parking', label: 'Парковка' },
  { value: 'conditioner', label: 'Кондиционер' },
  { value: 'dishwasher', label: 'Посудомоечная машина' },
  { value: 'balcony', label: 'Балкон' },
  { value: 'wardrobe', label: 'Гардеробная' },
  { value: 'pets', label: 'Можно с животными' }
];

const STEP_ERROR_FIELDS: Record<CreatePosterStep, CreatePosterField[]> = {
  1: ['housingType', 'address'],
  2: ['floor', 'floorCount', 'flatNumber', 'complexName'],
  3: ['roomCount', 'area'],
  4: ['images'],
  5: ['features', 'description', 'price']
};

function nextStep(step: CreatePosterStep): CreatePosterStep {
  return Math.min(step + 1, TOTAL_CREATE_POSTER_STEPS) as CreatePosterStep;
}

function collectErrorsUpToStep(step: CreatePosterStep, data: CreatePosterFormData) {
  const nextErrors: Partial<Record<CreatePosterField, string>> = {};
  for (let i = 1; i <= step; i++) {
    Object.assign(nextErrors, validateStep(i as CreatePosterStep, data).errors);
  }
  return nextErrors;
}

function isDistrictChunk(value: string) {
  const normalized = value.toLowerCase();
  return normalized.includes('район') || normalized.includes('р-н') || normalized.includes('мкр');
}

function splitAddressParts(fullAddress: string) {
  const normalizedFullAddress = fullAddress.trim();
  const parts = fullAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: undefined as string | undefined, district: undefined as string | undefined, address: '' };
  }

  if (parts.length === 1) {
    return { city: undefined as string | undefined, district: undefined as string | undefined, address: normalizedFullAddress };
  }

  const city = parts[0];
  let district: string | undefined;
  let rest = parts.slice(1);

  if (rest[0] && isDistrictChunk(rest[0])) {
    district = rest[0];
    rest = rest.slice(1);
  }

  return {
    city: city || undefined,
    district,
    address: rest.length > 0 ? rest.join(', ') : normalizedFullAddress
  };
}

function mapToPayload(
  form: CreatePosterFormData,
  coordinates: { latitude: number; longitude: number } | null,
  developerId: number | null
): CreatePosterPayload {
  const parsedAddress = splitAddressParts(form.address.trim());
  const roomCountNumber = form.roomCount === '6+' ? 6 : Number(form.roomCount);
  const flatNumber = form.flatNumber.trim() ? Number(form.flatNumber) : 0;
  const imagePayload: CreatePosterPayload['images'] = form.images.map((image, index) => ({
    file: image.file,
    order: index + 1
  }));

  return {
    title: `${form.housingType.trim()} ${form.address.trim()}`,
    category: form.housingType.trim(),
    ...(parsedAddress.city ? { city: parsedAddress.city } : {}),
    district: parsedAddress.district,
    address: parsedAddress.address,
    ...(coordinates ? { lat: coordinates.latitude, lon: coordinates.longitude } : {}),
    price: Number(form.price),
    area: Number(form.area),
    floor_count: Number(form.floorCount),
    description: form.description.trim(),
    features: form.features,
    flat: {
      flat_category: `${form.roomCount.trim()}-комнатная`,
      flat_number: flatNumber,
      floor: Number(form.floor),
      rooms: roomCountNumber
    },
    images: imagePayload,
    developer_id: developerId ?? undefined,
    utility_company_id: form.complex ? Number(form.complex) : undefined
  };
}

interface InputProps {
  field: Exclude<CreatePosterField, 'features' | 'images'>;
  label: string;
  value: string;
  errors: Partial<Record<CreatePosterField, string>>;
  onChange: (field: Exclude<CreatePosterField, 'features' | 'images'>, value: string) => void;
  showErrorText?: boolean;
  placeholder?: string;
  type?: 'text' | 'email';
}

function Field({ field, label, value, errors, onChange, showErrorText = true, placeholder, type = 'text' }: InputProps) {
  const error = errors[field];
  const isAddressField = field === 'address';
  const className = [
    styles.input,
    isAddressField ? styles.addressInput : '',
    error ? styles.inputError : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={field}>{label}</label>
      <input
        id={field}
        className={className}
        type={type}
        value={value}
        placeholder={placeholder ?? ''}
        onInput={(e: any) => onChange(field, e.target.value)}
      />
      {showErrorText && error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

interface AddressSuggestionCandidate {
  typedAddress: string;
  suggestion: LeafletAddressSuggestion;
}

interface AddressLookupState {
  query: string;
  recognized: boolean;
}

function normalizeAddressForCompare(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

export function CreatePosterForm() {
  const [complexes, setComplexes] = useState<{ id: number; company_name: string }[]>([]);
  const [isLoadingComplexes, setIsLoadingComplexes] = useState(false);
  const [complexesError, setComplexesError] = useState<string | null>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<number | null>(null);

  // Загрузка ЖК при выборе застройщика
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
      .catch(() => {
        setComplexesError('Ошибка загрузки списка ЖК');
      })
      .finally(() => setIsLoadingComplexes(false));
  }, [selectedDeveloperId]);
      const [developers, setDevelopers] = useState<{ developer_id: number; developer_name: string }[]>([]);
      const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
      const [developersError, setDevelopersError] = useState<string | null>(null);

      useEffect(() => {
        setIsLoadingDevelopers(true);
        getDevelopers()
          .then((data) => {
            setDevelopers(data.developers || []);
            setDevelopersError(null);
          })
          .catch(() => {
            setDevelopersError('Ошибка загрузки списка ЖК');
          })
          .finally(() => setIsLoadingDevelopers(false));
      }, []);
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState<CreatePosterStep>(1);
  const [form, setForm] = useState<CreatePosterFormData>(INITIAL_CREATE_POSTER_FORM);
  const [formDraft] = useState<CreatePosterFormData>({ ...INITIAL_CREATE_POSTER_FORM });
  const [errors, setErrors] = useState<Partial<Record<CreatePosterField, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [createdAlias, setCreatedAlias] = useState<string | null>(null);
  const [validatedUpToStep, setValidatedUpToStep] = useState(0);
  const [draggingPhotoIndex, setDraggingPhotoIndex] = useState<number | null>(null);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);
  const [isDeveloperMenuOpen, setIsDeveloperMenuOpen] = useState(false);
  const [isComplexMenuOpen, setIsComplexMenuOpen] = useState(false);
  const [isAddressManualInput, setIsAddressManualInput] = useState(false);
  const [addressSuggestionCandidate, setAddressSuggestionCandidate] = useState<AddressSuggestionCandidate | null>(null);
  const [addressLookupState, setAddressLookupState] = useState<AddressLookupState | null>(null);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [addressConfirmationError, setAddressConfirmationError] = useState<string | null>(null);
  const shouldHighlightAddressAsInvalid = addressConfirmationError === 'Укажите корректный адрес';
  const shouldHighlightAddressConfirmation = addressConfirmationError === 'Подтвердите адрес, чтобы перейти к следующему шагу';
  const addressFieldErrors = shouldHighlightAddressAsInvalid
    ? { ...errors, address: addressConfirmationError }
    : errors;

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-custom-select="developer"]')) {
        setIsDeveloperMenuOpen(false);
      }
      if (!target?.closest('[data-custom-select="complex"]')) {
        setIsComplexMenuOpen(false);
      }
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, []);

  const selectedDeveloperName = selectedDeveloperId == null
    ? ''
    : developers.find((developer) => developer.developer_id === selectedDeveloperId)?.developer_name || '';
  const selectedComplexName = form.complex
    ? complexes.find((complex) => complex.id === Number(form.complex))?.company_name || ''
    : '';

  const onSelectDeveloper = (developerId: number | null) => {
    setSelectedDeveloperId(developerId);
    updateField('complexName', developerId == null
      ? ''
      : developers.find((developer) => developer.developer_id === developerId)?.developer_name || '');
    // Сбросить выбранный ЖК при смене застройщика
    updateField('complex', '');
    setIsDeveloperMenuOpen(false);
    setIsComplexMenuOpen(false);
  };

  const onSelectComplex = (complexId: string) => {
    updateField('complex', complexId);
    setIsComplexMenuOpen(false);
  };

  const updateField = (field: Exclude<CreatePosterField, 'features' | 'images'>, value: string) => {
    formDraft[field] = value;
    setForm({ ...formDraft });
    if (errors[field]) {
      const nextErrors = { ...errors };
      delete nextErrors[field];
      setErrors(nextErrors);
    }
  };

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
    if (!isAddressManualInput) return;

    const normalizedCurrent = normalizeAddressForCompare(formDraft.address);
    const normalizedQuery = normalizeAddressForCompare(query);
    if (!normalizedCurrent || normalizedCurrent !== normalizedQuery) {
      return;
    }

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
      suggestion
    });
  };

  const confirmAddress = () => {
    if (!addressSuggestionCandidate) return;
    setAddressConfirmationError(null);
    setIsAddressConfirmed(true);
    setAddressLookupState({ query: addressSuggestionCandidate.suggestion.fullAddress, recognized: true });
    updateField('address', addressSuggestionCandidate.suggestion.fullAddress);
  };

  const toggleFeature = (featureValue: string) => {
    const hasFeature = formDraft.features.includes(featureValue);
    const nextFeatures = hasFeature
      ? formDraft.features.filter((value) => value !== featureValue)
      : [...formDraft.features, featureValue];

    formDraft.features = nextFeatures;
    setForm({ ...formDraft });
    if (errors.features) {
      const nextErrors = { ...errors };
      delete nextErrors.features;
      setErrors(nextErrors);
    }
  };

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
        file
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
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
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

  const onPhotoDragStart = (index: number) => {
    setDraggingPhotoIndex(index);
  };

  const onPhotoDragEnd = () => {
    setDraggingPhotoIndex(null);
  };

  const onPhotoDragOver = (e: any) => {
    e.preventDefault();
  };

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
    const nextImages = formDraft.images.filter((_, index) => index !== indexToRemove);
    formDraft.images = nextImages;
    setForm({ ...formDraft });
    setDraggingPhotoIndex(null);
  };

  const openPhotoDialog = () => {
    const input = document.getElementById('photoUpload') as HTMLInputElement | null;
    input?.click();
  };

  const applyValidation = (validation: StepValidationResult) => {
    setErrors(validation.errors);
    return validation.isValid;
  };

  const onNext = () => {
    setValidatedUpToStep(Math.max(validatedUpToStep, visibleSteps));
    const nextErrors = collectErrorsUpToStep(visibleSteps, formDraft);
    let addressError: string | null = null;

    if (visibleSteps === 1 && !nextErrors.address) {
      const normalizedCurrentAddress = normalizeAddressForCompare(form.address);
      const isLookupActual =
        !!addressLookupState
        && normalizeAddressForCompare(addressLookupState.query) === normalizedCurrentAddress;
      const hasAddressToConfirm =
        !!addressSuggestionCandidate
        && normalizeAddressForCompare(form.address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress);

      if (!isLookupActual || !addressLookupState?.recognized) {
        addressError = 'Укажите корректный адрес';
      } else if (hasAddressToConfirm && !isAddressConfirmed) {
        addressError = 'Подтвердите адрес, чтобы перейти к следующему шагу';
      }
    }

    setAddressConfirmationError(addressError);

    if (addressError === 'Укажите корректный адрес') {
      nextErrors.address = addressError;
    }

    const isValid = Object.keys(nextErrors).length === 0 && !addressError;
    setErrors(nextErrors);
    if (!isValid) return;

    setSubmitError(null);
    setVisibleSteps(nextStep(visibleSteps));
  };

  const onSubmit = async () => {
    setValidatedUpToStep(TOTAL_CREATE_POSTER_STEPS);
    const validation = validateStep(TOTAL_CREATE_POSTER_STEPS, formDraft);
    if (!applyValidation(validation)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = mapToPayload(formDraft, coordinates, selectedDeveloperId);
      const response = await createPoster(payload);
      const alias = response.alias || '';
      setIsPublished(true);
      setCreatedAlias(alias || null);
    } catch (error: any) {
      setSubmitError(error?.message || 'Не удалось опубликовать объявление');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPublished) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <h2 className={styles.successTitle}>Объявление опубликовано</h2>
          <p>Ваше объявление сохранено и доступно для просмотра.</p>
          <div className={styles.nav}>
            <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={() => navigate('/')}>
              На главную
            </button>
            {createdAlias && (
              <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => navigate(`/posters/${createdAlias}`)}>
                Открыть объявление
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {visibleSteps >= 1 && (
        <div className={`${styles.grid} ${styles.stepSection}`}>
          <div className={styles.fullWidth}>
            <h3 className={styles.sectionTitle}>{`Шаг 1: ${STEP_TITLES[0]}`}</h3>
          </div>
          <div className={`${styles.group} ${styles.fullWidth}`}>
            <label className={styles.label}>Тип жилья</label>
            <div className={`${styles.housingTypeGroup} ${errors.housingType ? styles.choiceGroupError : ''}`}>
              {HOUSING_OPTIONS.map((option, index) => {
                const isActive = form.housingType === option;
                return (
                  <button
                    key={`housing-option-${index.toString()}`}
                    type="button"
                    className={`${styles.housingTypeButton} ${isActive ? styles.housingTypeButtonActive : ''}`}
                    onClick={() => updateField('housingType', option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.fullWidth}>
            <OpenStreetMapPicker
              key="osm-picker"
              address={form.address}
              onPickAddress={onAddressPickedFromMap}
              onPickCoordinates={(latitude, longitude) => setCoordinates({ latitude, longitude })}
              onResolveTypedAddress={onResolveTypedAddress}
            />
          </div>
          <div className={styles.fullWidth}>
            <Field
              key="field-address"
              field="address"
              label="Адрес"
              value={form.address}
              errors={addressFieldErrors}
              onChange={(_, value) => onAddressInput(value)}
              showErrorText={false}
              placeholder="Например: Москва, ул. Ленина, 10"
            />
            {addressSuggestionCandidate && normalizeAddressForCompare(form.address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress) && (
              <div className={`${styles.addressSuggestion} ${shouldHighlightAddressConfirmation ? styles.addressSuggestionError : ''}`}>
                <p className={styles.addressSuggestionTitle}>Мы определили адрес. Подтвердите, что это ваш адрес:</p>
                <div className={styles.addressSuggestionGrid}>
                  {addressSuggestionCandidate.suggestion.city && (
                    <span className={styles.addressSuggestionItem}>Город: {addressSuggestionCandidate.suggestion.city}</span>
                  )}
                  {addressSuggestionCandidate.suggestion.district && (
                    <span className={styles.addressSuggestionItem}>Район: {addressSuggestionCandidate.suggestion.district}</span>
                  )}
                  {addressSuggestionCandidate.suggestion.street && (
                    <span className={styles.addressSuggestionItem}>Улица: {addressSuggestionCandidate.suggestion.street}</span>
                  )}
                  {addressSuggestionCandidate.suggestion.house && (
                    <span className={styles.addressSuggestionItem}>Дом: {addressSuggestionCandidate.suggestion.house}</span>
                  )}
                </div>
                <div className={styles.addressSuggestionValue}>{addressSuggestionCandidate.suggestion.fullAddress}</div>
                <div className={styles.addressSuggestionActions}>
                  <button type="button" className={`${styles.button} ${styles.buttonPrimary} ${styles.addressConfirmButton}`} onClick={confirmAddress}>
                    Да, это мой адрес
                  </button>
                  {isAddressConfirmed && <span className={styles.addressConfirmedBadge}>Адрес подтвержден</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {visibleSteps >= 2 && (
        <div className={`${styles.grid} ${styles.stepTwoRow} ${styles.stepSection}`}>
          <div className={styles.fullWidth}>
            <h3 className={styles.sectionTitle}>{`Шаг 2: ${STEP_TITLES[1]}`}</h3>
          </div>
          <Field key="field-floor" field="floor" label="Этаж квартиры" value={form.floor} errors={errors} onChange={updateField} showErrorText={false} />
          <Field key="field-floor-count" field="floorCount" label="Этажей в доме" value={form.floorCount} errors={errors} onChange={updateField} showErrorText={false} />
          <Field key="field-flat-number" field="flatNumber" label="Номер квартиры" value={form.flatNumber} errors={errors} onChange={updateField} showErrorText={false} />
          <div className={`${styles.group} ${styles.stepSelectGroup}`}>
             <label className={styles.label} htmlFor="complexName">Застройщик</label>
             <div className={styles.customSelect} data-custom-select="developer">
               <button
                 id="complexName"
                 type="button"
                 className={`${styles.customSelectButton} ${errors.complexName ? styles.selectError : ''} ${isDeveloperMenuOpen ? styles.customSelectButtonOpen : ''}`}
                 disabled={isLoadingDevelopers}
                 onClick={() => setIsDeveloperMenuOpen(!isDeveloperMenuOpen)}
               >
                 <span
                   className={`${styles.customSelectValue} ${selectedDeveloperName ? '' : styles.customSelectPlaceholder}`}
                   title={selectedDeveloperName || 'Выберите застройщика'}
                 >
                   {selectedDeveloperName || 'Выберите застройщика'}
                 </span>
                 <span className={styles.stepSelectArrow} aria-hidden="true">▾</span>
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
                   {developers.map((developer) => (
                     <button
                       key={developer.developer_id}
                       type="button"
                       className={`${styles.customSelectOption} ${selectedDeveloperId === developer.developer_id ? styles.customSelectOptionActive : ''}`}
                       onClick={() => onSelectDeveloper(developer.developer_id)}
                     >
                       {developer.developer_name}
                     </button>
                   ))}
                   {!isLoadingDevelopers && developers.length === 0 && (
                     <div className={styles.customSelectEmpty}>Список застройщиков пока пуст</div>
                   )}
                 </div>
               )}
             </div>
             {isLoadingDevelopers && <span className={styles.selectHint}>Загружаем список застройщиков...</span>}
             {!isLoadingDevelopers && developers.length === 0 && !developersError && (
               <span className={styles.selectHint}>Список застройщиков пока пуст</span>
             )}
             {developersError && <span className={styles.error}>{developersError}</span>}
             {errors.complexName && <span className={styles.error}>{errors.complexName}</span>}
          </div>
          <div className={`${styles.group} ${styles.stepSelectGroup}`}>
            <label className={styles.label} htmlFor="complex">ЖК</label>
            <div className={styles.customSelect} data-custom-select="complex">
              <button
                id="complex"
                type="button"
                className={`${styles.customSelectButton} ${errors.complex ? styles.selectError : ''} ${isComplexMenuOpen ? styles.customSelectButtonOpen : ''}`}
                disabled={isLoadingComplexes || selectedDeveloperId == null}
                onClick={() => setIsComplexMenuOpen(!isComplexMenuOpen)}
              >
                <span
                  className={`${styles.customSelectValue} ${selectedComplexName ? '' : styles.customSelectPlaceholder}`}
                  title={selectedComplexName || (selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК')}
                >
                  {selectedComplexName || (selectedDeveloperId == null ? 'Сначала выберите застройщика' : 'Выберите ЖК')}
                </span>
                <span className={styles.stepSelectArrow} aria-hidden="true">▾</span>
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
                  {complexes.map((complex) => (
                    <button
                      key={complex.id}
                      type="button"
                      className={`${styles.customSelectOption} ${form.complex === String(complex.id) ? styles.customSelectOptionActive : ''}`}
                      onClick={() => onSelectComplex(String(complex.id))}
                    >
                      {complex.company_name}
                    </button>
                  ))}
                  {!isLoadingComplexes && selectedDeveloperId != null && complexes.length === 0 && (
                    <div className={styles.customSelectEmpty}>Для этого застройщика пока нет ЖК</div>
                  )}
                </div>
              )}
            </div>
            {isLoadingComplexes && <span className={styles.selectHint}>Загружаем список ЖК...</span>}
            {!isLoadingComplexes && selectedDeveloperId != null && complexes.length === 0 && !complexesError && (
              <span className={styles.selectHint}>Для этого застройщика пока нет ЖК</span>
            )}
            {complexesError && <span className={styles.error}>{complexesError}</span>}
            {errors.complex && <span className={styles.error}>{errors.complex}</span>}
          </div>
        </div>
      )}

      {visibleSteps >= 3 && (
        <div className={`${styles.grid} ${styles.stepThreeRow} ${styles.stepSection}`}>
          <div className={styles.fullWidth}>
            <h3 className={styles.sectionTitle}>{`Шаг 3: ${STEP_TITLES[2]}`}</h3>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Всего комнат</label>
            <div className={`${styles.roomCountGroup} ${errors.roomCount ? styles.choiceGroupError : ''}`}>
              {ROOM_OPTIONS.map((option, index) => {
                const isActive = form.roomCount === option;
                return (
                  <button
                    key={`room-option-${index.toString()}`}
                    type="button"
                    className={`${styles.roomCountButton} ${isActive ? styles.roomCountButtonActive : ''}`}
                    onClick={() => updateField('roomCount', option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          <Field key="field-area" field="area" label="Площадь (м2)" value={form.area} errors={errors} onChange={updateField} showErrorText={false} />
        </div>
      )}

      {visibleSteps >= 4 && (
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
              <input
                id="photoUpload"
                className={styles.fileInput}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={onPhotoInput}
              />
              <button type="button" className={styles.uploadButton} onClick={openPhotoDialog}>Загрузите фото</button>
              <span className={styles.uploadHint}>или перетащите JPEG, PNG до 10 Мб каждый</span>
            </div>

            {form.images.length > 0 && (
              <div className={styles.photoThumbGrid}>
                {form.images.map((image, index) => (
                <div
                  key={`photo-${index.toString()}`}
                  className={`${styles.photoThumb} ${draggingPhotoIndex === index ? styles.photoThumbDragging : ''}`}
                  draggable
                  onDragStart={() => onPhotoDragStart(index)}
                  onDragEnd={onPhotoDragEnd}
                  onDragOver={onPhotoDragOver}
                  onDrop={(e: any) => onPhotoDrop(index, e)}
                >
                  {index === 0 && <span className={styles.mainPhotoBadge}>Главное фото</span>}
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoOverlayText}>Удерживайте, чтобы перетащить</span>
                    <button
                      type="button"
                      className={styles.photoRemoveButton}
                      onClick={(e: any) => removePhoto(index, e)}
                      aria-label="Удалить фото"
                    >
                      x
                    </button>
                  </div>
                  <img src={image.previewUrl} alt={image.name} draggable="false" />
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {visibleSteps >= 5 && (
        <div className={`${styles.group} ${styles.stepSection}`}>
          <h3 className={styles.sectionTitle}>{`Шаг 5: ${STEP_TITLES[4]}`}</h3>
          <label className={styles.label}>Особенности квартиры</label>
          <div className={`${styles.featureGrid} ${errors.features ? styles.choiceGroupError : ''}`}>
            {FEATURE_OPTIONS.map((feature, index) => {
              const checked = form.features.includes(feature.value);
              return (
                <button
                  key={`feature-${index.toString()}`}
                  type="button"
                  className={`${styles.housingTypeButton} ${checked ? styles.housingTypeButtonActive : ''}`}
                  onClick={() => toggleFeature(feature.value)}
                >
                  {feature.label}
                </button>
              );
            })}
          </div>
          <label className={styles.label} htmlFor="description">Описание объявления</label>
          <textarea
            id="description"
            className={errors.description ? `${styles.textarea} ${styles.descTextarea} ${styles.textareaError}` : `${styles.textarea} ${styles.descTextarea}`}
            placeholder="Опишите преимущества квартиры, инфраструктуру и условия сделки"
            value={form.description}
            onInput={(e: any) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
              updateField('description', target.value);
            }}
          />

          <div className={styles.priceFieldWrap}>
            <Field key="field-price" field="price" label="Цена (руб)" value={form.price} errors={errors} onChange={updateField} showErrorText={false} />
          </div>
          {submitError && <div className={styles.submitError}>{submitError}</div>}
        </div>
      )}

      <div className={styles.nav}>
        {(() => {
          const cumulativeErrors = collectErrorsUpToStep(visibleSteps, formDraft);
          const fieldsUpToCurrentStep = (Array.from({ length: visibleSteps }, (_, index) => index + 1) as CreatePosterStep[])
            .flatMap((step) => STEP_ERROR_FIELDS[step]);
          const currentStepErrorMessages = fieldsUpToCurrentStep
            .map((field) => cumulativeErrors[field])
            .filter((message): message is string => !!message);
          if (visibleSteps === 1 && addressConfirmationError) {
            currentStepErrorMessages.push(addressConfirmationError);
          }
          const hasCurrentStepErrors = validatedUpToStep >= visibleSteps && currentStepErrorMessages.length > 0;

          return visibleSteps < TOTAL_CREATE_POSTER_STEPS ? (
          <div className={styles.nextButtonWrap}>
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={onNext}>
              Далее
            </button>
            {hasCurrentStepErrors && (
              <div className={styles.errorHintWrap}>
                <span className={styles.errorHintIcon} aria-hidden="true">!</span>
                <div className={styles.errorHintPopup}>
                  {currentStepErrorMessages.map((message, index) => (
                    <div key={`step-error-${visibleSteps.toString()}-${index.toString()}`}>{message}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          ) : (
            <div className={styles.nextButtonWrap}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Публикация...' : 'Опубликовать'}
              </button>
              {hasCurrentStepErrors && (
                <div className={styles.errorHintWrap}>
                  <span className={styles.errorHintIcon} aria-hidden="true">!</span>
                  <div className={styles.errorHintPopup}>
                    {currentStepErrorMessages.map((message, index) => (
                      <div key={`step-error-${visibleSteps.toString()}-${index.toString()}`}>{message}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}


