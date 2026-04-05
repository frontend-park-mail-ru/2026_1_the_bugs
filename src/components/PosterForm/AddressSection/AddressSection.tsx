import { OpenStreetMapPicker, type LeafletAddressSuggestion } from '../OpenStreetMapPicker/OpenStreetMapPicker';
import { Field } from '../Field/Field';
import styles from '../PosterForm.module.css';
import { useState, useEffect } from '@my-react/hooks';
import type { CreatePosterField } from '../validation';

export interface AddressValidationResult {
  addressError: string | null;
}

interface Props {
  address: string;
  onAddressChange: (value: string) => void;
  onPickCoordinates?: (lat: number, lon: number) => void;
  errors?: Record<string, string | undefined>;
  placeholder?: string;
  setErrors: (e: Partial<Record<CreatePosterField, string>>) =>void;

  registerValidator?: (fn: () => AddressValidationResult) => void;
}

function normalizeAddressForCompare(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

export const AddressSection = (props: Props) => {
  const {setErrors, address, onAddressChange, onPickCoordinates, errors = {}, placeholder } = props;

  const [isAddressManualInput, setIsAddressManualInput] = useState(false);
  const [addressSuggestionCandidate, setAddressSuggestionCandidate] = useState<null | { typedAddress: string; suggestion: LeafletAddressSuggestion }>(null);
  const [addressLookupState, setAddressLookupState] = useState<null | { query: string; recognized: boolean }>(null);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [addressConfirmationError, setAddressConfirmationError] = useState<string | null>(null);

//   const addressFieldErrors = addressConfirmationError === 'Укажите корректный адрес'
//     ? { ...errors, address: addressConfirmationError }
//     : errors;

  const handleAddressInput = (value: string) => {
    setIsAddressManualInput(true);
    setIsAddressConfirmed(false);
    setAddressConfirmationError(null);
    setAddressSuggestionCandidate(null);
    setAddressLookupState(null);
    onAddressChange(value);
  };

  const handlePickFromMap = (value: string) => {
    setIsAddressManualInput(false);
    setIsAddressConfirmed(false);
    setAddressConfirmationError(null);
    setAddressSuggestionCandidate(null);
    setAddressLookupState(null);
    onAddressChange(value);
  };

  const onResolveTypedAddress = (query: string, suggestion: LeafletAddressSuggestion | null) => {
    const normalizedCurrent = normalizeAddressForCompare(address);
    const normalizedQuery = normalizeAddressForCompare(query);
    if (!normalizedCurrent || normalizedCurrent !== normalizedQuery) return;

    if (!suggestion?.fullAddress?.trim()) {
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
    setAddressSuggestionCandidate({ typedAddress: query, suggestion });
  };

  const confirmAddress = () => {
    if (!addressSuggestionCandidate) return;
    setAddressConfirmationError(null);
    setIsAddressConfirmed(true);
    setAddressLookupState({ query: addressSuggestionCandidate.suggestion.fullAddress, recognized: true });
    onAddressChange(addressSuggestionCandidate.suggestion.fullAddress);
  };

  // Register a validator function for parent components to call.
  useEffect(() => {
      let addressError: string | null = null;
      const normalizedCurrentAddress = normalizeAddressForCompare(address);
      const isLookupActual = !!addressLookupState && normalizeAddressForCompare(addressLookupState.query) === normalizedCurrentAddress;
      const hasAddressToConfirm = !!addressSuggestionCandidate && normalizeAddressForCompare(address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress);
      console.log({isLookupActual, hasAddressToConfirm, isAddressConfirmed, addressConfirmationError})

      if (!isLookupActual || !addressLookupState?.recognized) {
        addressError = 'Укажите корректный адрес';
      } else if (hasAddressToConfirm && !isAddressConfirmed) {
        addressError = 'Подтвердите адрес, чтобы перейти к следующему шагу';
      }
      console.log(addressError)

      if (addressError) {
        setErrors({ ...errors, address: addressError });
      } else {
        const { address: _, ...rest } = errors;
        setErrors(rest as Partial<Record<CreatePosterField, string>>);
      }
      
      
  }, [address, addressLookupState, addressSuggestionCandidate, isAddressConfirmed]);

  return (
    <div className={styles.grid}>
      <div className={styles.fullWidth}>
        <OpenStreetMapPicker
          key="osm-picker"
          address={address}
          onPickAddress={(addr) => { handlePickFromMap(addr); }}
          onPickCoordinates={(latitude, longitude) => onPickCoordinates?.(latitude, longitude)}
          onResolveTypedAddress={onResolveTypedAddress}
        />
      </div>

      <div className={styles.fullWidth}>
        <Field
          key="field-address"
          field="address"
          label="Адрес"
          value={address}
          errors={errors as any}
          onChange={(_, value) => handleAddressInput(value)}
          showErrorText={false}
          placeholder={placeholder ?? 'Например: Москва, ул. Ленина, 10'}
        />

        {addressSuggestionCandidate && normalizeAddressForCompare(address) === normalizeAddressForCompare(addressSuggestionCandidate.typedAddress) && (
          <div className={`${styles.addressSuggestion} ${addressConfirmationError === 'Подтвердите адрес, чтобы перейти к следующему шагу' ? styles.addressSuggestionError : ''}`}>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;
